import Stripe from 'stripe';

export type PricePlan = {
  id: string;
  name: string;
  price: number | null;
  interval: Stripe.Price.Recurring.Interval | undefined;
  currency: string;
};
