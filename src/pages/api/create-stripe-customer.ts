import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { createClientAdmin } from '@/utils/supabase/supabase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
  apiVersion: '2023-10-16',
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const supabase = createClientAdmin();

  if (req.query.API_ROUTE_SECRET !== process.env.API_ROUTE_SECRET) {
    return res.status(401).send('You are not authorized to call this API');
  }

  const customer = await stripe.customers.create({
    email: req.body.record.email,
  });

  await supabase
    .from('profile')
    .update({
      stripe_customer: customer.id,
    })
    .eq('id', req.body.record.id);

  res.send({ message: `Stripe customer created: ${customer.id}` });
};

export default handler;
