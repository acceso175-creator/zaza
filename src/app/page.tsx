"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { productCatalog, type Product } from "@/lib/products";

import brownieChocolateImage from "../../images/Brownie de chocolate.jpg";
import brownieSuperChocolateImage from "../../images/Brownie de súper chocolate con trozos de chocolate Hersheys.jpg";
import galletaChispasChocolateImage from "../../images/Galleta con chispas de chocolate.jpg";
import galletaChispasCajetaImage from "../../images/Galleta con chispas y cajeta.jpg";
import galletaChocoMentaImage from "../../images/Galleta chocomenta.jpg";
import heroImage from "../../images/hero.jpg";

type CartItem = { productId: string; quantity: number };

const productImages: Record<string, typeof brownieChocolateImage> = {
  "brownie-chocolate": brownieChocolateImage,
  "brownie-super-chocolate": brownieSuperChocolateImage,
  "galleta-chispas-chocolate": galletaChispasChocolateImage,
  "galleta-choco-menta": galletaChocoMentaImage,
  "galleta-chispas-cajeta": galletaChispasCajetaImage,
};

const formatCurrency = (value: number) =>
  value.toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 });

const faqs = [
  {
    question: "¿Qué son los productos Zazasquatch?",
    answer: "Son brownies y galletas artesanales infusionados con derivados de THC (THC-P y THC-O), elaborados con ingredientes de calidad premium para ofrecerte una experiencia única y potente.",
  },
  {
    question: "¿Qué es el THC-P y el THC-O?",
    answer: "Son cannabinoides derivados del cáñamo que ofrecen efectos distintos. El THC-P es conocido por su potencia, mientras que el THC-O ofrece una experiencia más suave. Ambos están diseñados para uso recreativo responsable.",
  },
  {
    question: "¿En cuánto tiempo se siente el efecto?",
    answer: "Los efectos pueden tardar entre 30 minutos a 2 horas en manifestarse, dependiendo de tu metabolismo y si has comido antes. Recomendamos empezar con una porción pequeña y esperar antes de consumir más.",
  },
  {
    question: "¿Hacen envíos?",
    answer: "Sí, realizamos envíos a toda la República Mexicana. Los tiempos de entrega varían según tu ubicación. Contáctanos por WhatsApp para más detalles sobre tu zona.",
  },
  {
    question: "¿Necesito ser mayor de edad?",
    answer: "Sí, todos nuestros productos son exclusivos para mayores de 18 años. Al realizar tu compra, confirmas que cumples con este requisito.",
  },
  {
    question: "¿Cuál es la dosis recomendada?",
    answer: "Si es tu primera vez, recomendamos empezar con media porción y esperar al menos 2 horas antes de consumir más. Cada persona reacciona diferente, así que es importante conocer tu tolerancia gradualmente.",
  },
];

export default function Home() {
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const products = useMemo(
    () =>
      productCatalog
        .map((product) => ({
          ...product,
          image: productImages[product.id],
        }))
        .filter((product): product is Product & { image: (typeof brownieChocolateImage) } => Boolean(product.image)),
    [],
  );

  const cartWithDetails = useMemo(
    () =>
      cartItems
        .map((item) => {
          const product = products.find((p) => p.id === item.productId);
          if (!product) return null;
          return { ...item, product, lineTotal: product.price * item.quantity };
        })
        .filter(Boolean) as Array<{ product: Product & { image: (typeof brownieChocolateImage) }; quantity: number; productId: string; lineTotal: number }>,
    [cartItems, products],
  );

  const subtotal = useMemo(
    () => cartWithDetails.reduce((total, item) => total + item.lineTotal, 0),
    [cartWithDetails],
  );

  const addToCart = (productId: string) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (existing) {
        return prev.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...prev, { productId, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCartItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((item) => item.productId !== productId);
      }
      return prev.map((item) =>
        item.productId === productId ? { ...item, quantity } : item,
      );
    });
  };

  const checkout = async () => {
    setCheckingOut(true);
    setCheckoutError(null);
    try {
      const response = await fetch("/.netlify/functions/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: cartItems }),
      });

      if (!response.ok) {
        throw new Error("No pudimos iniciar el pago. Intenta de nuevo.");
      }

      const data = (await response.json()) as { url?: string; error?: string };
      if (!data.url) {
        throw new Error(data.error || "No pudimos crear la sesión de pago.");
      }

      window.location.href = data.url;
    } catch (error) {
      console.error(error);
      setCheckoutError(error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setCheckingOut(false);
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#050011] text-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050011]/95 backdrop-blur-sm border-b border-purple-900/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">
            ZAZASQUATCH
          </div>
          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => scrollToSection("inicio")} className="hover:text-purple-400 transition-colors">
              Inicio
            </button>
            <button onClick={() => scrollToSection("productos")} className="hover:text-purple-400 transition-colors">
              Productos
            </button>
            <button onClick={() => scrollToSection("como-funciona")} className="hover:text-purple-400 transition-colors">
              Cómo funciona
            </button>
            <button onClick={() => scrollToSection("faq")} className="hover:text-purple-400 transition-colors">
              Preguntas frecuentes
            </button>
            <button onClick={() => scrollToSection("contacto")} className="hover:text-purple-400 transition-colors">
              Contacto
            </button>
            <Button onClick={() => scrollToSection("productos")} className="bg-purple-600 hover:bg-purple-700">
              Comprar ahora
            </Button>
          </div>
          <div className="md:hidden">
            <Button onClick={() => scrollToSection("productos")} size="sm" className="bg-purple-600 hover:bg-purple-700">
              Comprar
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section
        id="inicio"
        className="relative pt-32 pb-20 px-4 gradient-radial min-h-screen flex items-center overflow-hidden"
      >
        <div className="absolute inset-0">
          <Image
            src={heroImage}
            alt="Brownie y galletas Zazasquatch"
            fill
            className="object-cover"
            priority
            placeholder="blur"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#050011]/85 via-[#0f0624]/70 to-[#4C1D95]/60" />
        </div>

        <div className="relative container mx-auto max-w-4xl">
          <div className="text-center md:text-left space-y-6 md:space-y-8">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-black/40 border border-purple-700/50 text-sm text-purple-200 backdrop-blur">
              <span className="inline-block w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              <span>Potencia monstruosa en cada bocado</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-2 tracking-tight leading-tight">
              ZAZASQUATCH
            </h1>
            <p className="text-2xl md:text-3xl text-purple-100 drop-shadow-lg">
              Brownies y galletas con potencia monstruosa
            </p>
            <p className="text-lg md:text-xl text-gray-100/90 max-w-3xl leading-relaxed">
              Brownies y galletas infusionados con THC-P y THC-O, pensados para usuarios responsables que buscan experiencias intensas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start items-center">
              <Button onClick={() => scrollToSection("productos")} size="lg" className="bg-purple-600 hover:bg-purple-700 text-lg px-8 shadow-lg shadow-purple-900/40">
                Ver productos
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-purple-300/60 text-purple-100 hover:bg-purple-900/30 text-lg px-8 backdrop-blur"
              >
                <a
                  href="https://wa.me/5210000000000?text=Hola%20Zazasquatch%2C%20quiero%20hacer%20un%20pedido"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Comprar por WhatsApp
                </a>
              </Button>
            </div>
            <p className="text-sm text-gray-200/80">
              Consumo exclusivo para adultos. Disfruta de forma responsable.
            </p>
          </div>
        </div>
      </section>

      {/* Productos */}
      <section id="productos" className="py-20 px-4 bg-gradient-to-b from-[#050011] to-[#4C1D95]/20">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">Nuestros Productos</h2>
          <p className="text-center text-gray-300 mb-12 max-w-2xl mx-auto">
            Elige entre nuestra selección de brownies y galletas infusionados, cada uno con su propia intensidad y sabor único.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => {
              const quantityInCart =
                cartItems.find((item) => item.productId === product.id)?.quantity ?? 0;

              return (
                <Card
                  key={product.id}
                  className="bg-[#1a0b2e] border-purple-800/40 hover:border-purple-600/60 transition-all hover:shadow-lg hover:shadow-purple-900/50 hover:scale-105"
                >
                  <CardHeader>
                    <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden border border-purple-800/60 bg-black/20">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                        placeholder="blur"
                      />
                    </div>
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-xl text-white">{product.name}</CardTitle>
                      <span className="text-2xl font-bold text-purple-400">{formatCurrency(product.price)}</span>
                    </div>
                    <CardDescription>
                      <span className="inline-block px-3 py-1 bg-purple-600/30 text-purple-300 rounded-full text-sm font-semibold border border-purple-500/50">
                        Infusionado con {product.type}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 text-sm leading-relaxed">{product.description}</p>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-3">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="border-purple-700/60 text-purple-200 hover:bg-purple-800/40"
                          onClick={() => updateQuantity(product.id, quantityInCart - 1)}
                          disabled={quantityInCart === 0}
                          aria-label="Reducir cantidad"
                        >
                          -
                        </Button>
                        <span className="text-lg font-semibold">{quantityInCart}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="border-purple-700/60 text-purple-200 hover:bg-purple-800/40"
                          onClick={() => updateQuantity(product.id, quantityInCart + 1)}
                          aria-label="Incrementar cantidad"
                        >
                          +
                        </Button>
                      </div>
                      <div className="text-sm text-gray-300">
                        {quantityInCart > 0
                          ? `Subtotal: ${formatCurrency(product.price * quantityInCart)}`
                          : "Listo para tu carrito"}
                      </div>
                    </div>
                    <Button
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      onClick={() => addToCart(product.id)}
                    >
                      {quantityInCart ? "Agregar uno más" : "Agregar al carrito"}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#1a0b2e] border border-purple-800/40 rounded-lg p-6">
              <h3 className="text-2xl font-semibold text-white mb-4">Tu carrito</h3>
              {cartWithDetails.length === 0 ? (
                <p className="text-gray-300">Agrega productos para iniciar tu compra.</p>
              ) : (
                <div className="space-y-4">
                  {cartWithDetails.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center justify-between rounded-md border border-purple-800/40 p-3 bg-[#0f0624]"
                    >
                      <div>
                        <p className="font-semibold text-white">{item.product.name}</p>
                        <p className="text-sm text-gray-300">
                          {item.quantity} x {formatCurrency(item.product.price)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-purple-300">{formatCurrency(item.lineTotal)}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-300 hover:text-red-200"
                          onClick={() => updateQuantity(item.productId, 0)}
                        >
                          Quitar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="bg-[#1a0b2e] border border-purple-800/40 rounded-lg p-6 flex flex-col gap-4">
              <h3 className="text-2xl font-semibold text-white">Resumen y pago</h3>
              <div className="flex items-center justify-between text-lg text-purple-100">
                <span>Subtotal</span>
                <span className="font-bold">{formatCurrency(subtotal)}</span>
              </div>
              <p className="text-sm text-gray-300">
                El costo de envío se calcula y valida en el servidor antes de crear la sesión de pago.
              </p>
              {checkoutError && <p className="text-sm text-red-300">{checkoutError}</p>}
              <Button
                className="bg-purple-600 hover:bg-purple-700"
                disabled={cartWithDetails.length === 0 || checkingOut}
                onClick={checkout}
              >
                {checkingOut ? "Creando sesión..." : "Pagar"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="py-20 px-4 bg-[#050011]">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">Cómo Funciona</h2>
          <div className="space-y-6">
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm font-bold">1</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-purple-300">Productos infusionados</h3>
                <p className="text-gray-300">
                  Nuestros brownies y galletas están infusionados con derivados de THC (THC-P y THC-O) de alta calidad, ofreciendo experiencias potentes y consistentes.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm font-bold">2</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-purple-300">Consumo responsable</h3>
                <p className="text-gray-300">
                  Comienza con una dosis pequeña y espera al menos 2 horas antes de consumir más. Los efectos pueden variar según tu metabolismo y tolerancia.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm font-bold">3</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-purple-300">Solo para adultos</h3>
                <p className="text-gray-300">
                  Todos nuestros productos son exclusivos para mayores de 18 años. No conduzcas ni operes maquinaria bajo los efectos de estos productos.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm font-bold">4</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-purple-300">Almacenamiento seguro</h3>
                <p className="text-gray-300">
                  Mantén los productos en un lugar fresco y seco, fuera del alcance de niños y mascotas. Consumir con precaución y conocimiento.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4 bg-gradient-to-b from-[#050011] to-[#4C1D95]/20">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">Preguntas Frecuentes</h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-[#1a0b2e] border border-purple-800/40 rounded-lg p-6 hover:border-purple-600/60 transition-colors">
                <h3 className="text-xl font-semibold mb-3 text-purple-300">{faq.question}</h3>
                <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contacto */}
      <section id="contacto" className="py-20 px-4 bg-[#050011]">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">¿Listo para tu siguiente experiencia Zazasquatch?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Contáctanos por WhatsApp para realizar tu pedido o resolver cualquier duda.
          </p>
          <div className="mb-8">
            <Button
              asChild
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-lg px-8"
            >
              <a
                href="https://wa.me/5210000000000?text=Hola%20Zazasquatch%2C%20quiero%20hacer%20un%20pedido"
                target="_blank"
                rel="noopener noreferrer"
              >
                Chatear por WhatsApp
              </a>
            </Button>
          </div>
          <div className="bg-[#1a0b2e] border border-purple-800/40 rounded-lg p-8 max-w-md mx-auto">
            <h3 className="text-xl font-semibold mb-4 text-purple-300">O envíanos un mensaje</h3>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <input
                type="text"
                placeholder="Tu nombre"
                className="w-full px-4 py-3 bg-[#0f0624] border border-purple-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
              />
              <input
                type="email"
                placeholder="Tu correo"
                className="w-full px-4 py-3 bg-[#0f0624] border border-purple-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
              />
              <textarea
                placeholder="Tu mensaje"
                rows={4}
                className="w-full px-4 py-3 bg-[#0f0624] border border-purple-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white resize-none"
              />
              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                Enviar mensaje
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-[#0a0519] border-t border-purple-900/30">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <div className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">
              ZAZASQUATCH
            </div>
            <p className="text-sm text-gray-400 max-w-2xl mx-auto mb-6">
              Consumo exclusivo para mayores de 18 años. No conduzcas ni operes maquinaria bajo los efectos de estos productos.
              Disfruta de forma responsable y conoce tus límites.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <button className="text-purple-400 hover:text-purple-300 transition-colors">
                Términos y condiciones
              </button>
              <span className="text-gray-600">•</span>
              <button className="text-purple-400 hover:text-purple-300 transition-colors">
                Aviso de privacidad
              </button>
              <span className="text-gray-600">•</span>
              <button
                onClick={() => setShowLegalModal(true)}
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                Aviso legal (&lt;1% Delta-9 THC)
              </button>
            </div>
          </div>
          <div className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Zazasquatch. Todos los derechos reservados.
          </div>
        </div>
      </footer>

      {/* Modal Aviso Legal */}
      {showLegalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a0b2e] border border-purple-700 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8 relative">
            <button
              onClick={() => setShowLegalModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>
            <h2 className="text-3xl font-bold mb-6 text-purple-300">Aviso Legal</h2>
            <div className="space-y-4 text-gray-300">
              <p className="leading-relaxed">
                Todos los productos Zazasquatch contienen menos de <strong className="text-purple-400">1% de Delta-9 THC</strong> en peso seco,
                en cumplimiento con la normativa aplicable.
              </p>
              <p className="leading-relaxed">
                Nuestros brownies y galletas están infusionados con cannabinoides derivados del cáñamo (THC-P y THC-O), los cuales
                son compuestos legales en muchas jurisdicciones cuando se derivan de cáñamo con bajo contenido de Delta-9 THC.
              </p>
              <p className="leading-relaxed">
                <strong className="text-purple-400">Restricción de edad:</strong> Este sitio y todos nuestros productos son exclusivos
                para personas mayores de 18 años. Al realizar una compra, confirmas que cumples con este requisito de edad.
              </p>
              <p className="leading-relaxed">
                <strong className="text-purple-400">Consumo responsable:</strong> Se recomienda enfáticamente consumir estos productos
                de manera responsable. No conduzcas, operes maquinaria pesada ni realices actividades que requieran atención plena
                mientras estés bajo los efectos de estos productos.
              </p>
              <p className="leading-relaxed">
                <strong className="text-purple-400">Almacenamiento:</strong> Mantén los productos fuera del alcance de niños y mascotas.
                Almacena en un lugar fresco y seco.
              </p>
              <p className="leading-relaxed">
                <strong className="text-purple-400">Descargo de responsabilidad:</strong> Zazasquatch no realiza afirmaciones médicas
                sobre sus productos. Estos productos no están diseñados para diagnosticar, tratar, curar o prevenir ninguna enfermedad.
                Consulta con un profesional de la salud antes de consumir si tienes condiciones médicas preexistentes.
              </p>
              <p className="leading-relaxed text-sm text-gray-400 mt-6">
                Al comprar nuestros productos, aceptas estos términos y confirmas que cumples con todas las leyes locales aplicables
                en tu jurisdicción.
              </p>
            </div>
            <div className="mt-8">
              <Button onClick={() => setShowLegalModal(false)} className="w-full bg-purple-600 hover:bg-purple-700">
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
