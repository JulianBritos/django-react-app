// Exportar todos los componentes de ProductCard desde el archivo centralizado
export {
  ProductCardFull as ProductCard,
  ProductCardCompact,
  ProductCardHorizontal,
  ProductCardHero,
  ProductCardMinimal,
  ProductCardMobile, // <-- AGREGA ESTA LÍNEA
} from "./ui/Card";

// También exportar como default el ProductCard principal
export { ProductCardFull as default } from "./ui/Card";
