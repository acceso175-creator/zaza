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
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "customer_details", "shipping_cost.shipping_rate", "shipping_details"],
    });

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
        line_items: session.line_items?.data.map((item) => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          amount_subtotal: item.amount_subtotal,
          amount_total: item.amount_total,
          currency: item.currency,
        })),
      }),
    };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: JSON.stringify({ error: "Unable to retrieve session" }) };
  }
};

export { handler };
