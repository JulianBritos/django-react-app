import clsx from "clsx";
import ProductImage from "./ProductImage";
import ProductBadges from "./ProductBadges";
import { Link } from "react-router-dom";

const Card = ({
  children,
  variant = "default",
  size = "default",
  className = "",
  padding = true,
  shadow = true,
  hover = false,
  as,
  ...props
}) => {
  const baseStyles = "rounded-lg transition-all duration-200";

  const variants = {
    default: "bg-white border border-gray-200",
    primary: "bg-blue-50 border border-blue-200",
    secondary: "bg-gray-50 border border-gray-200",
    success: "bg-green-50 border border-green-200",
    warning: "bg-yellow-50 border border-yellow-200",
    danger: "bg-red-50 border border-red-200",
    info: "bg-blue-50 border border-blue-200",
    dark: "bg-gray-800 border border-gray-700 text-white",
    transparent: "bg-transparent border border-gray-200",
    elevated: "bg-white border-0",
  };

  const sizes = {
    xs: padding ? "p-2" : "",
    sm: padding ? "p-3" : "",
    default: padding ? "p-4" : "",
    lg: padding ? "p-6" : "",
    xl: padding ? "p-8" : "",
    none: "",
  };

  const shadows = {
    none: "",
    sm: "shadow-sm",
    default: "shadow-md",
    lg: "shadow-lg",
    xl: "shadow-xl",
  };

  const hoverEffects = {
    none: "",
    lift: "hover:shadow-lg hover:-translate-y-1",
    glow: "hover:shadow-lg hover:shadow-blue-500/25",
    scale: "hover:scale-105",
    border: "hover:border-blue-300",
  };

  const Component = as || "div";

  return (
    <Component
      className={clsx(
        baseStyles,
        variants[variant],
        sizes[size],
        shadow && shadows[shadow === true ? "default" : shadow],
        hover && hoverEffects[hover === true ? "lift" : hover],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

// Componente especializado para tarjetas de estadísticas
const StatCard = ({
  title,
  value,
  icon,
  trend,
  trendValue,
  className = "",
  ...props
}) => {
  return (
    <Card className={clsx("", className)} {...props}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className="flex items-center mt-1">
              <span
                className={clsx(
                  "text-xs font-medium",
                  trend === "up" ? "text-green-600" : "text-red-600"
                )}
              >
                {trend === "up" ? "↗" : "↘"} {trendValue}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0">
            <div className="w-8 h-8 flex items-center justify-center text-gray-400">
              {icon}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

// Componente especializado para tarjetas de contenido
const ContentCard = ({
  title,
  subtitle,
  children,
  headerActions,
  footer,
  className = "",
  ...props
}) => {
  return (
    <Card className={clsx("", className)} {...props}>
      {(title || headerActions) && (
        <div className="flex items-center justify-between mb-4">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
          {headerActions && (
            <div className="flex items-center gap-2">{headerActions}</div>
          )}
        </div>
      )}
      <div className="flex-1">{children}</div>
      {footer && (
        <div className="mt-4 pt-4 border-t border-gray-200">{footer}</div>
      )}
    </Card>
  );
};

// Utilidad para calcular badges de producto
function getProductBadges(product, firstVariant) {
  const sellingPrice = firstVariant?.selling_price || product.price || 0;
  const offerPrice = firstVariant?.offer_price;
  const stock = firstVariant?.stock || 0;
  const badges = [];
  // Descuento
  if (offerPrice && offerPrice < sellingPrice) {
    const discountPercentage = Math.round(
      ((sellingPrice - offerPrice) / sellingPrice) * 100
    );
    badges.push({ text: `${discountPercentage}% OFF`, type: "discount" });
  }
  // Stock
  if (stock === 0) badges.push({ text: "Agotado", type: "out-of-stock" });
  else if (stock <= 5)
    badges.push({ text: "Últimas unidades", type: "low-stock" });
  // Nuevo
  if (product.created_at) {
    const createdDate = new Date(product.created_at);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    if (createdDate > thirtyDaysAgo)
      badges.push({ text: "Nuevo", type: "new" });
  }
  return badges;
}

// Componente especializado para tarjetas de productos básicas
const ProductCard = ({
  image,
  title,
  subtitle,
  price,
  badge,
  actions,
  className = "",
  ...props
}) => {
  return (
    <Card
      variant="elevated"
      hover="lift"
      className={clsx("overflow-hidden", className)}
      {...props}
    >
      {image && (
        <div className="aspect-square overflow-hidden bg-gray-100">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/placeholder.jpg";
            }}
          />
        </div>
      )}
      <div className="p-4">
        {badge && (
          <div className="mb-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {badge}
            </span>
          </div>
        )}
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-gray-600 mb-2 line-clamp-1">{subtitle}</p>
        )}
        {price && (
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-bold text-gray-900">{price}</span>
          </div>
        )}
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </Card>
  );
};

// Componente especializado para tarjetas de productos completas
const ProductCardFull = ({ product, addToCart, className = "", ...props }) => {
  // Extraer información de la primera variante del producto
  const firstVariant = product.product_attributes?.[0];
  const productImage =
    firstVariant?.uploaded_images?.[0]?.image ||
    product.image ||
    "/placeholder.png";
  const sellingPrice = firstVariant?.selling_price || product.price || 0;
  const offerPrice = firstVariant?.offer_price;
  const stock = firstVariant?.stock || 0;

  // Calcular descuento si hay oferta
  const hasDiscount = offerPrice && offerPrice < sellingPrice;
  const discountPercentage = hasDiscount
    ? Math.round(((sellingPrice - offerPrice) / sellingPrice) * 100)
    : 0;

  // Determinar el precio a mostrar
  const displayPrice = hasDiscount ? offerPrice : sellingPrice;

  // Determinar badges
  const badges = getProductBadges(product, firstVariant);

  // Verificar si el producto tiene variantes
  const hasVariants =
    product.product_attributes && product.product_attributes.length > 1;

  return (
    <Card
      variant="elevated"
      hover="lift"
      className={clsx("group relative overflow-hidden", className)}
      {...props}
    >
      {/* Badges */}
      <ProductBadges badges={badges} className="absolute top-3 left-3 z-10" />

      {/* Botón de favoritos */}
      <button className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors shadow-sm">
        <svg
          className="w-4 h-4 text-gray-600 hover:text-red-500 transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </button>

      {/* Imagen del producto */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <ProductImage
          src={productImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Overlay con botón de ver detalles */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
          <a
            href={`/product/${product.id}`}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors">
              <svg
                className="w-4 h-4 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </button>
          </a>
        </div>
      </div>

      {/* Información del producto */}
      <div className="p-4">
        {/* Categoría */}
        {product.category && (
          <div className="mb-2">
            <span className="text-xs text-gray-500 hover:text-primary-600 transition-colors">
              {product.category.name}
            </span>
          </div>
        )}

        {/* Nombre del producto */}
        <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 hover:text-primary-600 transition-colors mb-2">
          {product.name}
        </h3>

        {/* Marca */}
        {product.brand && (
          <p className="text-xs text-gray-600 mb-2">
            Marca: <span className="font-medium">{product.brand}</span>
          </p>
        )}

        {/* Calificación */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className="w-3 h-3 fill-yellow-400 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-xs text-gray-500">(4.5)</span>
          <span className="text-xs text-gray-400">•</span>
          <span className="text-xs text-gray-500">128 vendidos</span>
        </div>

        {/* Precios */}
        <div className="mb-3">
          {hasDiscount ? (
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">
                ${displayPrice.toFixed(2)}
              </span>
              <span className="text-sm text-gray-500 line-through">
                ${sellingPrice.toFixed(2)}
              </span>
            </div>
          ) : (
            <span className="text-lg font-bold text-gray-900">
              ${displayPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Información adicional */}
        <div className="space-y-1 mb-4">
          {/* Stock */}
          <div className="flex items-center gap-1">
            <div
              className={`w-2 h-2 rounded-full ${
                stock > 0 ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <span className="text-xs text-gray-600">
              {stock > 0 ? `${stock} disponibles` : "Sin stock"}
            </span>
          </div>

          {/* Variantes */}
          {hasVariants && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-blue-600 font-medium">
                {product.product_attributes.length} variantes disponibles
              </span>
            </div>
          )}

          {/* Envío gratuito */}
          <div className="flex items-center gap-1">
            <svg
              className="w-3 h-3 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
              />
            </svg>
            <span className="text-xs text-green-600 font-medium">
              Envío gratis
            </span>
          </div>

          {/* Garantía */}
          <div className="flex items-center gap-1">
            <svg
              className="w-3 h-3 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <span className="text-xs text-blue-600">Garantía de 30 días</span>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="space-y-2">
          {stock > 0 ? (
            <>
              <button
                className="w-full bg-primary-500 text-white py-2 px-4 rounded-lg hover:bg-primary-600 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                onClick={(e) => {
                  e.preventDefault();
                  addToCart(product);
                }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                  />
                </svg>
                Agregar al carrito
              </button>
              <a href={`/product/${product.id}`}>
                <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm">
                  Ver detalles
                </button>
              </a>
            </>
          ) : (
            <button
              className="w-full bg-gray-100 text-gray-400 py-2 px-4 rounded-lg font-medium text-sm"
              disabled
            >
              Agotado
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};

// Componente especializado para tarjetas de productos compactas
const ProductCardCompact = ({
  product,
  addToCart,
  className = "",
  ...props
}) => {
  // Extraer información de la primera variante del producto
  const firstVariant = product.product_attributes?.[0];
  const productImage =
    firstVariant?.uploaded_images?.[0]?.image ||
    product.image ||
    "/placeholder.png";
  const sellingPrice = firstVariant?.selling_price || product.price || 0;
  const offerPrice = firstVariant?.offer_price;
  const stock = firstVariant?.stock || 0;

  // Calcular descuento si hay oferta
  const hasDiscount = offerPrice && offerPrice < sellingPrice;
  const discountPercentage = hasDiscount
    ? Math.round(((sellingPrice - offerPrice) / sellingPrice) * 100)
    : 0;

  // Determinar el precio a mostrar
  const displayPrice = hasDiscount ? offerPrice : sellingPrice;

  // Determinar badges
  const badges = getProductBadges(product, firstVariant);

  return (
    <Card
      variant="elevated"
      hover="lift"
      size="sm"
      className={clsx("group relative overflow-hidden", className)}
      {...props}
    >
      {/* Badges */}
      <ProductBadges
        badges={badges}
        className="absolute top-2 left-2 z-10"
        size="sm"
      />

      {/* Imagen del producto */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <ProductImage
          src={productImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />

        {/* Overlay con botón de ver detalles */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center">
          <a
            href={`/product/${product.id}`}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors">
              <svg
                className="w-4 h-4 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </button>
          </a>
        </div>
      </div>

      {/* Información del producto */}
      <div className="p-3">
        {/* Nombre del producto */}
        <h3 className="font-medium text-gray-900 text-sm leading-tight line-clamp-2 hover:text-primary-600 transition-colors mb-1">
          {product.name}
        </h3>

        {/* Calificación */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-xs text-gray-500">(4.5)</span>
        </div>

        {/* Precios */}
        <div className="mb-2">
          {hasDiscount ? (
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-gray-900">
                ${displayPrice.toFixed(2)}
              </span>
              <span className="text-xs text-gray-500 line-through">
                ${sellingPrice.toFixed(2)}
              </span>
            </div>
          ) : (
            <span className="text-base font-bold text-gray-900">
              ${displayPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Stock */}
        <div className="flex items-center gap-1 mb-3">
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              stock > 0 ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <span className="text-xs text-gray-600">
            {stock > 0 ? `${stock} disponibles` : "Sin stock"}
          </span>
        </div>

        {/* Botón de acción */}
        {stock > 0 ? (
          <button
            className="w-full bg-primary-500 text-white py-2 px-3 rounded-lg hover:bg-primary-600 transition-colors font-medium text-sm flex items-center justify-center gap-1"
            onClick={(e) => {
              e.preventDefault();
              addToCart(product);
            }}
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
              />
            </svg>
            Agregar
          </button>
        ) : (
          <button
            className="w-full bg-gray-100 text-gray-400 py-2 px-3 rounded-lg font-medium text-sm"
            disabled
          >
            Agotado
          </button>
        )}
      </div>
    </Card>
  );
};

// Componente especializado para tarjetas de productos hero (destacados)
const ProductCardHero = ({ product, className = "", ...props }) => {
  // Extraer información de la primera variante del producto
  const firstVariant = product.product_attributes?.[0];
  const productImage =
    firstVariant?.uploaded_images?.[0]?.image ||
    product.image ||
    "/placeholder.png";
  const sellingPrice = firstVariant?.selling_price || product.price || 0;
  const offerPrice = firstVariant?.offer_price;
  const stock = firstVariant?.stock || 0;

  // Calcular descuento si hay oferta
  const hasDiscount = offerPrice && offerPrice < sellingPrice;
  const discountPercentage = hasDiscount
    ? Math.round(((sellingPrice - offerPrice) / sellingPrice) * 100)
    : 0;

  // Determinar el precio a mostrar
  const displayPrice = hasDiscount ? offerPrice : sellingPrice;

  // Determinar badges (solo los más importantes)
  const badges = getProductBadges(product, firstVariant);

  return (
    <Card
      variant="elevated"
      hover="lift"
      className={clsx(
        "group relative overflow-hidden transform hover:-translate-y-1",
        className
      )}
      {...props}
    >
      {/* Badges */}
      <ProductBadges badges={badges} className="absolute top-3 left-3 z-10" />

      {/* Botón de favoritos */}
      <button className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors shadow-sm hover:shadow-md">
        <svg
          className="w-4 h-4 text-gray-600 hover:text-red-500 transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </button>

      {/* Imagen del producto */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        <ProductImage
          src={productImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Overlay con botón de ver detalles */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
          <a
            href={`/product/${product.id}`}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors">
              <svg
                className="w-5 h-5 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </button>
          </a>
        </div>
      </div>

      {/* Información del producto */}
      <div className="p-4">
        {/* Categoría */}
        {product.category && (
          <div className="mb-2">
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
              {product.category.name}
            </span>
          </div>
        )}

        {/* Nombre del producto */}
        <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2 hover:text-primary-600 transition-colors mb-2 group-hover:underline">
          {product.name}
        </h3>

        {/* Precios */}
        <div className="mb-3">
          {hasDiscount ? (
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">
                ${displayPrice.toFixed(2)}
              </span>
              <span className="text-sm text-gray-500 line-through">
                ${sellingPrice.toFixed(2)}
              </span>
            </div>
          ) : (
            <span className="text-lg font-bold text-gray-900">
              ${displayPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Call to action sutil */}
        <div className="text-center">
          <Link
            to={`/product/${product.id}`}
            className="text-xs text-primary-600 font-medium group-hover:text-primary-700 transition-colors"
            onClick={e => e.stopPropagation()}
          >
            Ver detalles →
          </Link>
        </div>
      </div>
    </Card>
  );
};

// Componente especializado para tarjetas de productos minimalistas
const ProductCardMinimal = ({ product, className = "", ...props }) => {
  // Extraer información de la primera variante del producto
  const firstVariant = product.product_attributes?.[0];
  const productImage =
    firstVariant?.uploaded_images?.[0]?.image ||
    product.image ||
    "/placeholder.png";
  const sellingPrice = firstVariant?.selling_price || product.price || 0;
  const offerPrice = firstVariant?.offer_price;

  // Calcular descuento si hay oferta
  const hasDiscount = offerPrice && offerPrice < sellingPrice;
  const displayPrice = hasDiscount ? offerPrice : sellingPrice;

  // Solo mostrar el badge más importante
  let badge = null;
  if (hasDiscount) {
    const discountPercentage = Math.round(
      ((sellingPrice - offerPrice) / sellingPrice) * 100
    );
    badge = { text: `${discountPercentage}% OFF`, type: "discount" };
  } else if (product.created_at) {
    const createdDate = new Date(product.created_at);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    if (createdDate > thirtyDaysAgo) {
      badge = { text: "Nuevo", type: "new" };
    }
  }

  return (
    <Card
      variant="elevated"
      hover="lift"
      size="sm"
      className={clsx("group relative overflow-hidden", className)}
      {...props}
    >
      {/* Badge */}
      {badge && (
        <div className="absolute top-2 left-2 z-10">
          <span
            className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-bold ${
              badge.type === "discount"
                ? "bg-red-500 text-white"
                : "bg-green-500 text-white"
            }`}
          >
            {badge.text}
          </span>
        </div>
      )}

      {/* Imagen del producto */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <ProductImage
          src={productImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Información del producto */}
      <div className="p-3">
        {/* Nombre del producto */}
        <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 hover:text-primary-600 transition-colors mb-1">
          {product.name}
        </h3>

        {/* Precios */}
        <div className="mb-2">
          {hasDiscount ? (
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-gray-900">
                ${displayPrice.toFixed(2)}
              </span>
              <span className="text-xs text-gray-500 line-through">
                ${sellingPrice.toFixed(2)}
              </span>
            </div>
          ) : (
            <span className="text-base font-bold text-gray-900">
              ${displayPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Call to action sutil */}
        <div className="text-center">
          <span className="text-xs text-primary-600 font-medium group-hover:text-primary-700 transition-colors">
            Ver más →
          </span>
        </div>
      </div>
    </Card>
  );
};

// Componente especializado para tarjetas de productos horizontales
const ProductCardHorizontal = ({
  product,
  addToCart,
  className = "",
  ...props
}) => {
  // Extraer información de la primera variante del producto
  const firstVariant = product.product_attributes?.[0];
  const productImage =
    firstVariant?.uploaded_images?.[0]?.image ||
    product.image ||
    "/placeholder.png";
  const sellingPrice = firstVariant?.selling_price || product.price || 0;
  const offerPrice = firstVariant?.offer_price;
  const stock = firstVariant?.stock || 0;

  // Calcular descuento si hay oferta
  const hasDiscount = offerPrice && offerPrice < sellingPrice;
  const discountPercentage = hasDiscount
    ? Math.round(((sellingPrice - offerPrice) / sellingPrice) * 100)
    : 0;

  // Determinar el precio a mostrar
  const displayPrice = hasDiscount ? offerPrice : sellingPrice;

  // Determinar badges
  const badges = getProductBadges(product, firstVariant);

  return (
    <Card
      variant="elevated"
      hover="lift"
      className={clsx("group relative overflow-hidden", className)}
      {...props}
    >
      <div className="flex">
        {/* Imagen del producto */}
        <div className="relative w-32 h-32 flex-shrink-0">
          <ProductImage
            src={productImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />

          {/* Badges */}
          <ProductBadges
            badges={badges}
            className="absolute top-2 left-2 z-10"
          />

          {/* Botón de favoritos */}
          <button className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors shadow-sm">
            <svg
              className="w-3.5 h-3.5 text-gray-600 hover:text-red-500 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>

        {/* Información del producto */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            {/* Categoría */}
            {product.category && (
              <div className="mb-1">
                <span className="text-xs text-gray-500 hover:text-primary-600 transition-colors">
                  {product.category.name}
                </span>
              </div>
            )}

            {/* Nombre del producto */}
            <h3 className="font-semibold text-gray-900 text-base leading-tight line-clamp-2 hover:text-primary-600 transition-colors mb-2">
              {product.name}
            </h3>

            {/* Marca */}
            {product.brand && (
              <p className="text-sm text-gray-600 mb-2">
                Marca: <span className="font-medium">{product.brand}</span>
              </p>
            )}

            {/* Calificación */}
            <div className="flex items-center gap-1 mb-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className="w-3 h-3 fill-yellow-400 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs text-gray-500">(4.5)</span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-500">128 vendidos</span>
            </div>

            {/* Información adicional */}
            <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
              <div className="flex items-center gap-1">
                <svg
                  className="w-3 h-3 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                  />
                </svg>
                <span className="text-green-600 font-medium">Envío gratis</span>
              </div>
              <div className="flex items-center gap-1">
                <svg
                  className="w-3 h-3 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                <span className="text-blue-600">Garantía 30 días</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            {/* Precios */}
            <div>
              {hasDiscount ? (
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-gray-900">
                    ${displayPrice.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    ${sellingPrice.toFixed(2)}
                  </span>
                </div>
              ) : (
                <span className="text-xl font-bold text-gray-900">
                  ${displayPrice.toFixed(2)}
                </span>
              )}

              {/* Stock */}
              <div className="flex items-center gap-1 mt-1">
                <div
                  className={`w-2 h-2 rounded-full ${
                    stock > 0 ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                <span className="text-xs text-gray-600">
                  {stock > 0 ? `${stock} disponibles` : "Sin stock"}
                </span>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col gap-2">
              {stock > 0 ? (
                <>
                  <button
                    className="bg-primary-500 text-white py-2 px-4 rounded-lg hover:bg-primary-600 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                    onClick={(e) => {
                      e.preventDefault();
                      addToCart(product);
                    }}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                      />
                    </svg>
                    Agregar al carrito
                  </button>
                  <a href={`/product/${product.id}`}>
                    <button className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm">
                      Ver detalles
                    </button>
                  </a>
                </>
              ) : (
                <button
                  className="bg-gray-100 text-gray-400 py-2 px-4 rounded-lg font-medium text-sm"
                  disabled
                >
                  Agotado
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Exportar todos los componentes
export {
  Card,
  StatCard,
  ContentCard,
  ProductCard,
  ProductCardFull,
  ProductCardCompact,
  ProductCardHorizontal,
  ProductCardHero,
  ProductCardMinimal,
};
export default Card;

/*
EJEMPLOS DE USO:

// 1. Card básica
<Card>
  <p>Contenido básico</p>
</Card>

// 2. Card con variantes
<Card variant="primary" size="lg" hover="lift">
  <p>Card con estilo primario, tamaño grande y efecto hover</p>
</Card>

// 3. StatCard para estadísticas
<StatCard
  title="Total de Productos"
  value={123}
  icon={<Package size={24} className="text-blue-500" />}
  trend="up"
  trendValue="+12%"
/>

// 4. ContentCard para contenido estructurado
<ContentCard
  title="Título de la tarjeta"
  subtitle="Subtítulo opcional"
  headerActions={<Button>Acción</Button>}
  footer={<p>Pie de página</p>}
>
  <p>Contenido principal</p>
</ContentCard>

// 5. ProductCard para productos
<ProductCard
  image="/path/to/image.jpg"
  title="Nombre del Producto"
  subtitle="Descripción corta"
  price="$99.99"
  badge="Nuevo"
  actions={<Button>Comprar</Button>}
/>

PROPIEDADES DISPONIBLES:

Card:
- variant: "default" | "primary" | "secondary" | "success" | "warning" | "danger" | "info" | "dark" | "transparent" | "elevated"
- size: "xs" | "sm" | "default" | "lg" | "xl" | "none"
- padding: boolean (default: true)
- shadow: boolean | "none" | "sm" | "default" | "lg" | "xl" (default: true)
- hover: boolean | "none" | "lift" | "glow" | "scale" | "border" (default: false)
- as: string (elemento HTML a renderizar, default: "div")

StatCard:
- title: string
- value: string | number
- icon: ReactNode
- trend: "up" | "down" (opcional)
- trendValue: string (opcional)

ContentCard:
- title: string (opcional)
- subtitle: string (opcional)
- headerActions: ReactNode (opcional)
- footer: ReactNode (opcional)

ProductCard:
- image: string (opcional)
- title: string
- subtitle: string (opcional)
- price: string (opcional)
- badge: string (opcional)
- actions: ReactNode (opcional)
*/
