import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function CartPage() {
  return (
    <div className="min-h-screen bg-[#050011] text-white flex items-center justify-center px-4 py-20">
      <div className="max-w-xl w-full bg-[#1a0b2e] border border-purple-800/40 rounded-lg p-8 text-center space-y-4 shadow-lg">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">Carrito</h1>
        <p className="text-gray-300">
          Tu sesión de pago fue cancelada. Vuelve a la tienda para actualizar tu carrito y completar el pedido.
        </p>
        <Button asChild className="bg-purple-600 hover:bg-purple-700">
          <Link href="/">Regresar a la tienda</Link>
        </Button>
      </div>
    </div>
  );
}
