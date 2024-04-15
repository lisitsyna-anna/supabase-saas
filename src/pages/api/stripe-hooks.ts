import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { buffer } from 'micro';
import { createClientAdmin } from '@/utils/supabase/supabase-admin';

// Stripe requires the raw body to construct the event.
export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const supabase = createClientAdmin();

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const signature = req.headers['stripe-signature'] as string;
  const signinSecret = process.env.STRIPE_SIGNIN_SECRET!;
  const reqBuffer = await buffer(req);

  let event: Stripe.Event | null = null;

  try {
    event = stripe.webhooks.constructEvent(reqBuffer, signature, signinSecret);
    console.log('Event: ', event);
  } catch (error) {
    event = null;
    console.error('Error in the stripe-hooks: ', error);
    if (error instanceof Error) {
      return res.status(400).send(`Webhook error: ${error.message}`);
    }
  }

  if (event) {
    switch (event.type) {
      case 'customer.subscription.created':
        const { error: updateSubscriptionError } = await supabase
          .from('profile')
          .update({ is_subscribed: true, interval: event.data.object.items.data[0].plan.interval })
          .eq('stripe_customer', event.data.object.customer);

        if (updateSubscriptionError) {
          res
            .status(Number(updateSubscriptionError.code))
            .send('Update subscription error during subscription creation event');
          return;
        }
        break;

      //   case 'customer.subscription.updated':
      //     break;

      //   case 'customer.subscription.deleted':
      //     break;
    }

    res.send({ recived: true });
  }
};

export default handler;
