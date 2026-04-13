import { z } from "zod";
import {
  type BillingFrequency,
  BillingFrequency as BillingFrequencyValues,
  Currency,
  SubscriptionCategory,
  type SubscriptionStatus,
  SubscriptionStatus as SubscriptionStatusValues,
} from "../generated/prisma/enums.js";

const RENEWAL_PERIOD_DAYS: Record<BillingFrequency, number> = {
  [BillingFrequencyValues.DAILY]: 1,
  [BillingFrequencyValues.WEEKLY]: 7,
  [BillingFrequencyValues.MONTHLY]: 30,
  [BillingFrequencyValues.YEARLY]: 365,
};

export function calculateRenewalDate(
  start: Date,
  frequency: BillingFrequency,
): Date {
  const d = new Date(start.getTime());
  const days = RENEWAL_PERIOD_DAYS[frequency];
  d.setDate(d.getDate() + days);
  return d;
}

export function resolveSubscriptionStatusByRenewal(
  renewalDate: Date,
  status: SubscriptionStatus,
): SubscriptionStatus {
  if (renewalDate.getTime() < Date.now()) {
    return SubscriptionStatusValues.EXPIRED;
  }
  return status;
}

const zCurrency = z.enum([Currency.USD, Currency.EUR, Currency.GBP]);

const zBillingFrequency = z.enum([
  BillingFrequencyValues.DAILY,
  BillingFrequencyValues.WEEKLY,
  BillingFrequencyValues.MONTHLY,
  BillingFrequencyValues.YEARLY,
]);

const zSubscriptionCategory = z.enum([
  SubscriptionCategory.SPORTS,
  SubscriptionCategory.MUSIC,
  SubscriptionCategory.ENTERTAINMENT,
  SubscriptionCategory.LIFESTYLE,
  SubscriptionCategory.TECHNOLOGY,
  SubscriptionCategory.FINANCE,
  SubscriptionCategory.POLITICS,
  SubscriptionCategory.OTHERS,
]);

const zSubscriptionStatus = z.enum([
  SubscriptionStatusValues.ACTIVE,
  SubscriptionStatusValues.CANCELLED,
  SubscriptionStatusValues.EXPIRED,
]);

const subscriptionCreateBase = z.object({
  userId: z.number().int().positive(),
  name: z
    .string({ required_error: "Subscription name is required" })
    .trim()
    .min(1, "Subscription name is required")
    .max(200, "Subscription name is too long"),
  price: z.number().int().nonnegative(),
  currency: zCurrency.default(Currency.GBP),
  frequency: zBillingFrequency,
  category: zSubscriptionCategory,
  status: zSubscriptionStatus.default(SubscriptionStatusValues.ACTIVE),
  startDate: z.coerce.date(),
  renewalDate: z.coerce.date().optional(),
});

type SubscriptionAfterRenewal = z.infer<typeof subscriptionCreateBase> & {
  renewalDate: Date;
};

export const subscriptionCreateSchema = subscriptionCreateBase
  .transform(
    (data): SubscriptionAfterRenewal => ({
      ...data,
      renewalDate:
        data.renewalDate ??
        calculateRenewalDate(data.startDate, data.frequency),
    }),
  )
  .superRefine((data: SubscriptionAfterRenewal, ctx) => {
    const now = new Date();
    if (data.startDate.getTime() > now.getTime()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Start date must not be in the future.",
        path: ["startDate"],
      });
    }
    if (data.renewalDate.getTime() <= data.startDate.getTime()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Renewal date must be after the start date.",
        path: ["renewalDate"],
      });
    }
  })
  .transform((data: SubscriptionAfterRenewal) => ({
    ...data,
    status: resolveSubscriptionStatusByRenewal(data.renewalDate, data.status),
  }));

export type SubscriptionCreateInput = z.output<typeof subscriptionCreateSchema>;
