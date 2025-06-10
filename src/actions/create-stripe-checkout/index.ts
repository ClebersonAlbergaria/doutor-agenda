"use server";

import { headers } from "next/headers";
import Stripe from "stripe";

import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

//se tiver outros planos. Receber os planos na action. EX: action.schema.input.extend({
// plan: z.enum(["essential", "pro", "enterprise"]),
//}); e criar uma session para cada plano.

export const createStripeCheckout = actionClient.action(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe secret key not found");
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-05-28.basil",
  });

  const { id: sessionId } = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "subscription",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    subscription_data: {
      trial_period_days: 7,
      metadata: {
        userId: session.user.id,
      },
    },
    line_items: [
      {
        price: process.env.STRIPE_PLAN_PRICE_ESSENTIAL_ID,
        quantity: 1,
      },
    ],
    // customer_email: session.user.email,
    // client_reference_id: session.user.id,
    // metadata: {
    //   clinicId: session.user.clinic.id,
    // },
  });
  return {
    sessionId,
  };
});
