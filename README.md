This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Stripe y Netlify

El checkout de Stripe se ejecuta en funciones serverless de Netlify. Configura las siguientes variables de entorno en Netlify para que el pago funcione:

- `STRIPE_SECRET_KEY`: clave secreta de Stripe (solo en servidor).
- `SITE_URL`: URL pública del sitio (se usa para las redirecciones de éxito y cancelación).
- `FREE_SHIPPING_THRESHOLD_MXN`: monto a partir del cual aplica envío gratis.
- `STRIPE_SHIPPING_RATE_FREE`: ID de la tarifa de envío gratis creada en Stripe.
- `STRIPE_SHIPPING_RATE_PAID`: ID de la tarifa de envío con costo en Stripe.

El botón **Pagar** llama a `/.netlify/functions/create-checkout-session`, que valida los precios del carrito en el servidor y selecciona la tarifa de envío apropiada antes de redirigir al Checkout de Stripe. La página `/success` consulta `/.netlify/functions/get-session` para mostrar el resumen del pago.
