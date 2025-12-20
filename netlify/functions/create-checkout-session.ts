import type { Handler } from "@netlify/functions";
import Stripe from "stripe";

import { productCatalog } from "../../src/lib/products";

const PRODUCT_CATALOG = productCatalog.reduce(
  (catalog, product) => ({
    ...catalog,
    [product.id]: {
      name: product.name,
      unit_amount_mxn: product.price,
      description: product.description,
    },
  }),
  {} as Record<string, { name: string; unit_amount_mxn: number; description?: string }>,
);

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const siteUrl = process.env.SITE_URL;
const freeShippingThreshold = Number(process.env.FREE_SHIPPING_THRESHOLD_MXN ?? "NaN");
const shippingRateFree = process.env.STRIPE_SHIPPING_RATE_FREE;
const shippingRatePaid = process.env.STRIPE_SHIPPING_RATE_PAID;

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: "2025-02-24.acacia",
    })
  : null;

const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  if (!stripe || !siteUrl) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Stripe is not configured correctly" }),
    };
  }

  if (!shippingRateFree || !shippingRatePaid || Number.isNaN(freeShippingThreshold)) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Shipping configuration is missing" }),
    };
  }

  if (!event.body) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing request body" }) };
  }

  try {
    const payload = JSON.parse(event.body as string);
    const items: { id?: string; quantity?: number }[] = Array.isArray(payload?.items) ? payload.items : [];

    const validatedItems = items
      .map((item) => {
        const quantity = Number(item?.quantity);
        const product = item?.id ? PRODUCT_CATALOG[item.id] : undefined;
        if (!product || Number.isNaN(quantity) || quantity <= 0) return null;
        return { product, quantity, id: item.id };
      })
      .filter(Boolean) as { product: (typeof PRODUCT_CATALOG)[string]; quantity: number; id: string }[];

    if (validatedItems.length === 0) {
      const receivedIds = Array.from(new Set(items.map((item) => item?.id).filter(Boolean))) as string[];
      const validIds = Object.keys(PRODUCT_CATALOG);
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "No valid items in cart",
          details: { receivedIds, validIds },
        }),
      };
    }

    const subtotal = validatedItems.reduce(
      (total, { product, quantity }) => total + product.unit_amount_mxn * quantity,
      0,
    );
    const shippingRateToUse = subtotal >= freeShippingThreshold ? shippingRateFree : shippingRatePaid;

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = validatedItems.map(({ product, quantity }) => ({
      price_data: {
        currency: "mxn",
        unit_amount: product.unit_amount_mxn * 100,
        product_data: {
          name: product.name,
          description: product.description,
        },
      },
      quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      shipping_options: [{ shipping_rate: shippingRateToUse }],
      success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/cart`,
      metadata: {
        shipping_rate_applied: shippingRateToUse,
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
    };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: JSON.stringify({ error: "Unable to create checkout session" }) };
  }
};

export { handler };
