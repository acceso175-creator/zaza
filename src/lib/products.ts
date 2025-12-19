export type Product = {
  id: string;
  name: string;
  price: number;
  type: string;
  description: string;
};

export const productCatalog: Product[] = [
  {
    id: "brownie-chocolate",
    name: "Brownie de chocolate",
    price: 250,
    type: "THC-P",
    description:
      "Brownie clásico, súper chocolatoso, con textura húmeda por dentro y ligera costra por fuera. Perfecto para antojo de algo intenso pero sencillo.",
  },
  {
    id: "brownie-super-chocolate",
    name: "Brownie de súper chocolate con trozos de chocolate Hershey's",
    price: 350,
    type: "THC-O",
    description:
      "Brownie extra cargado de chocolate, con trozos de Hershey's que se derriten al morder. Ideal para los que 'nunca es suficiente chocolate'.",
  },
  {
    id: "galleta-chispas-chocolate",
    name: "Galleta con chispas de chocolate",
    price: 250,
    type: "THC-P",
    description:
      "Galleta suave por dentro y ligeramente crujiente por fuera, llena de chispas de chocolate en cada bocado. Un clásico que nunca falla.",
  },
  {
    id: "galleta-choco-menta",
    name: "Galleta choco-menta",
    price: 250,
    type: "THC-P",
    description:
      "Galleta de chocolate con un toque fresco de menta, perfecta para quienes aman la combinación intensa y refrescante.",
  },
  {
    id: "galleta-chispas-cajeta",
    name: "Galleta con chispas y cajeta",
    price: 250,
    type: "THC-O",
    description:
      "Galleta con chispas de chocolate y centros de cajeta suave que se derrite. Dulce, cremosa y súper antojable.",
  },
];

export const productMap = new Map(productCatalog.map((product) => [product.id, product]));

export function getProductById(id: string) {
  return productMap.get(id);
}
