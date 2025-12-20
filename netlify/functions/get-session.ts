import type { Handler } from "@netlify/functions";
import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: "2025-02-24.acacia",
    })
  : null;

const handler: Handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  if (!stripe) {
    return { statusCode: 500, body: JSON.stringify({ error: "Stripe is not configured correctly" }) };
  }

  const sessionId = event.queryStringParameters?.session_id;

  if (!sessionId) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing session_id" }) };
  }

  try {
    const session = (await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "customer_details", "shipping_cost.shipping_rate", "shipping_details"],
    })) as {
      id?: string;
      amount_total?: number;
      currency?: string;
      status?: string;
      customer_details?: unknown;
      shipping_details?: unknown;
      shipping_cost?: unknown;
      line_items?: { data: Array<Record<string, unknown>> };
    };

    return {
      statusCode: 200,
      body: JSON.stringify({
        id: session.id,
        amount_total: session.amount_total,
        currency: session.currency,
        status: session.status,
        customer_details: session.customer_details,
        shipping_details: session.shipping_details,
        shipping_cost: session.shipping_cost,
        line_items: session.line_items?.data.map((item: Record<string, unknown>) => ({
          id: item.id as string,
          description: item.description as string,
          quantity: item.quantity as number,
          amount_subtotal: item.amount_subtotal as number,
          amount_total: item.amount_total as number,
          currency: item.currency as string,
        })),
      }),
    };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: JSON.stringify({ error: "Unable to retrieve session" }) };
  }
};

export { handler };
