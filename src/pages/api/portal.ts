import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { createClientAPI } from '@/utils/supabase/supabase-api';
import { PostgrestSingleResponse } from '@supabase/supabase-js';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const supabase = createClientAPI(req, res);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return res.status(401).send('Unauthorized');
  }

  const {
    data: stripeCustomer,
    error,
  }: PostgrestSingleResponse<{ stripe_customer: string | null }> = await supabase
    .from('profile')
    .select('stripe_customer')
    .eq('id', session.user.id)
    .single();

  if (error) {
    res.status(Number(error.code)).send(error.message);
  }

  if (!stripeCustomer || !stripeCustomer.stripe_customer) {
    res.status(404).send(`The user with id ${session.user.id} doesn't have stripe_customer id`);
    return;
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    typescript: true,
    apiVersion: '2023-10-16',
  });

  try {
    const sessionStripe = await stripe.billingPortal.sessions.create({
      customer: stripeCustomer.stripe_customer,
      return_url: 'http://localhost:3000/dashboard',
    });

    res.send({
      url: sessionStripe.url,
    });
  } catch (stripeError) {
    console.error('Stripe error:', stripeError);
    return res.status(500).send('Internal Server Error');
  }
};

export default handler;
