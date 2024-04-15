import Stripe from 'stripe';
import { GetStaticProps, InferGetStaticPropsType } from 'next';
import Link from 'next/link';
import axios, { AxiosResponse } from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { PricePlan } from '@/types';
import { useUser } from '@/context/userContext';

const Pricing = ({ plans }: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { user, login, isLoadingUser } = useUser();

  const showSubscribeBtn = !!user && !user.is_subscribed;
  const showCreateAccountBtn = !user;
  const showManageSubscriptionBtn = !!user && user.is_subscribed;

  const processSubscription = async (planId: string) => {
    try {
      const { data }: AxiosResponse<{ id: string }> = await axios.get(
        `/api/subscription/${planId}`
      );
      const stripeClient = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!);
      if (!stripeClient) {
        throw new Error("Stripe client hasn't been initialized.");
      }

      await stripeClient.redirectToCheckout({ sessionId: data.id });
    } catch (error) {
      console.error('Error in the process subscription:', error);
    }
  };

  return (
    <ul className="w-full max-w-3xl mx-auto py-16 flex justify-around">
      {plans.map(plan => (
        <li key={plan.id} className="w-80 h-40 rounded shadow px-6 py-4">
          <h2 className="text-xl">{plan.name}</h2>
          {plan.price && (
            <p className="text-gray-500">
              ${plan.price / 100} / {plan.interval}
            </p>
          )}
          {!isLoadingUser && (
            <div>
              {showSubscribeBtn && (
                <button onClick={() => processSubscription(plan.id)}>Subscribe</button>
              )}
              {showCreateAccountBtn && <button onClick={login}>Create Account</button>}
              {showManageSubscriptionBtn && <Link href="/dashboard">Manage Subscription</Link>}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
};

export const getStaticProps: GetStaticProps<{
  plans: PricePlan[];
}> = async () => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    typescript: true,
    apiVersion: '2023-10-16',
  });

  const { data: prices } = await stripe.prices.list();

  const plans = await Promise.all(
    prices.map(async price => {
      const product = await stripe.products.retrieve(price.product as string);
      return {
        id: price.id,
        name: product.name,
        price: price.unit_amount,
        interval: price.recurring?.interval,
        currency: price.currency,
      };
    })
  );

  const sortedPlans = plans.sort((a, b) => {
    const priceA = a.price ?? 0;
    const priceB = b.price ?? 0;

    return priceA - priceB;
  });

  return {
    props: {
      plans: sortedPlans,
    },
  };
};

export default Pricing;
