import clsx from "clsx";

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

// Componente especializado para tarjetas de productos
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

// Exportar todos los componentes
export { Card, StatCard, ContentCard, ProductCard };
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
