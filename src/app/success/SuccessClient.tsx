"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

type LineItem = {
  description?: string | null;
  quantity?: number | null;
  amount_total?: number | null;
  amount_subtotal?: number | null;
  currency?: string | null;
};

type SessionSummary = {
  id?: string;
  amount_total?: number | null;
  currency?: string | null;
  status?: string | null;
  customer_details?: {
    email?: string | null;
    name?: string | null;
  } | null;
  shipping_details?: {
    address?: {
      line1?: string | null;
      line2?: string | null;
      city?: string | null;
      state?: string | null;
      postal_code?: string | null;
      country?: string | null;
    } | null;
  } | null;
  shipping_cost?: {
    amount_total?: number | null;
  } | null;
  line_items?: LineItem[] | null;
};

const formatCurrency = (value: number, currency?: string | null) =>
  (value / 100).toLocaleString("es-MX", {
    style: "currency",
    currency: currency ?? "MXN",
  });

export default function SuccessClient({ sessionId }: { sessionId?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<SessionSummary | null>(null);

  const address = useMemo(() => {
    const addressFields = session?.shipping_details?.address;
    if (!addressFields) return null;
    const lines = [
      addressFields.line1,
      addressFields.line2,
      addressFields.city,
      addressFields.state,
      addressFields.postal_code,
      addressFields.country,
    ].filter(Boolean);
    if (lines.length === 0) return null;
    return lines.join(", ");
  }, [session]);

  useEffect(() => {
    const fetchSession = async () => {
      if (!sessionId) {
        setError("Falta el identificador de la sesión");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/.netlify/functions/get-session?session_id=${sessionId}`);
        if (!response.ok) {
          throw new Error("No pudimos obtener los detalles del pago.");
        }
        const data = (await response.json()) as SessionSummary;
        setSession(data);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "No pudimos consultar el pago.");
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-[#050011] text-white px-4 py-20">
      <div className="max-w-3xl mx-auto bg-[#1a0b2e] border border-purple-800/40 rounded-lg p-8 shadow-xl">
        <h1 className="text-4xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">
          ¡Pago confirmado!
        </h1>
        <p className="text-center text-gray-300 mb-8">
          Gracias por tu compra. Aquí tienes el resumen de tu pedido.
        </p>

        {loading && <p className="text-center text-purple-200">Consultando información de Stripe...</p>}
        {error && <p className="text-center text-red-300">{error}</p>}

        {!loading && !error && session && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-[#0f0624] border border-purple-800/40 rounded-lg p-4">
              <span className="text-gray-300">Estado</span>
              <span className="text-lg font-semibold text-purple-200">{session.status ?? "desconocido"}</span>
            </div>
            <div className="flex items-center justify-between bg-[#0f0624] border border-purple-800/40 rounded-lg p-4">
              <span className="text-gray-300">Total pagado</span>
              <span className="text-lg font-semibold text-purple-200">
                {session.amount_total != null ? formatCurrency(session.amount_total, session.currency) : "--"}
              </span>
            </div>
            {session.shipping_cost?.amount_total != null && (
              <div className="flex items-center justify-between bg-[#0f0624] border border-purple-800/40 rounded-lg p-4">
                <span className="text-gray-300">Envío</span>
                <span className="text-lg font-semibold text-purple-200">
                  {formatCurrency(session.shipping_cost.amount_total, session.currency)}
                </span>
              </div>
            )}
            {session.customer_details?.email && (
              <div className="bg-[#0f0624] border border-purple-800/40 rounded-lg p-4">
                <p className="text-gray-300">Recibo enviado a</p>
                <p className="text-purple-100 font-semibold">{session.customer_details.email}</p>
              </div>
            )}
            {address && (
              <div className="bg-[#0f0624] border border-purple-800/40 rounded-lg p-4">
                <p className="text-gray-300">Dirección de envío</p>
                <p className="text-purple-100 font-semibold">{address}</p>
              </div>
            )}
            {session.line_items && session.line_items.length > 0 && (
              <div className="bg-[#0f0624] border border-purple-800/40 rounded-lg p-4">
                <p className="text-gray-300 mb-3">Productos</p>
                <div className="space-y-2">
                  {session.line_items.map((item, index) => (
                    <div key={`${item.description}-${index}`} className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 font-semibold">{item.description ?? "Artículo"}</p>
                        <p className="text-sm text-gray-300">Cantidad: {item.quantity ?? 0}</p>
                      </div>
                      <p className="text-purple-200 font-semibold">
                        {item.amount_total != null ? formatCurrency(item.amount_total, item.currency) : "--"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <Button asChild className="bg-purple-600 hover:bg-purple-700">
            <Link href="/">Seguir comprando</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

