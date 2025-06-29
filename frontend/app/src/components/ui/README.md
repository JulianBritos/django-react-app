# Sistema de Componentes UI

Este directorio contiene componentes UI reutilizables que siguen un patrón consistente de diseño y permiten cambiar estilos desde un solo archivo.

## Componentes Disponibles

### 1. Button (`Button.jsx`)

Componente de botón altamente personalizable con múltiples variantes, tamaños y estados.

**Propiedades:**

- `variant`: "default" | "primary" | "secondary" | "success" | "warning" | "outline" | "outlinePrimary" | "outlineSuccess" | "ghost" | "ghostPrimary" | "destructive" | "link"
- `size`: "xs" | "sm" | "default" | "lg" | "xl" | "icon" | "iconSm" | "iconLg"
- `disabled`: boolean
- `isLoading`: boolean
- `fullWidth`: boolean
- `as`: string (elemento HTML a renderizar)

**Ejemplo:**

```jsx
import { Button } from "../ui/Button";

<Button variant="primary" size="lg" isLoading={true}>
  Guardar Cambios
</Button>;
```

### 2. Card (`Card.jsx`)

Sistema de tarjetas modular con componentes especializados para diferentes casos de uso.

#### Card Base

Componente base para tarjetas con múltiples variantes y efectos.

**Propiedades:**

- `variant`: "default" | "primary" | "secondary" | "success" | "warning" | "danger" | "info" | "dark" | "transparent" | "elevated"
- `size`: "xs" | "sm" | "default" | "lg" | "xl" | "none"
- `padding`: boolean
- `shadow`: boolean | "none" | "sm" | "default" | "lg" | "xl"
- `hover`: boolean | "none" | "lift" | "glow" | "scale" | "border"

#### StatCard

Tarjeta especializada para mostrar estadísticas con iconos y tendencias.

**Propiedades:**

- `title`: string
- `value`: string | number
- `icon`: ReactNode
- `trend`: "up" | "down" (opcional)
- `trendValue`: string (opcional)

**Ejemplo:**

```jsx
import { StatCard } from "../ui/Card";

<StatCard
  title="Total de Productos"
  value={123}
  icon={<Package size={24} className="text-blue-500" />}
  trend="up"
  trendValue="+12%"
/>;
```

#### ContentCard

Tarjeta para contenido estructurado con título, subtítulo, acciones y pie de página.

**Propiedades:**

- `title`: string (opcional)
- `subtitle`: string (opcional)
- `headerActions`: ReactNode (opcional)
- `footer`: ReactNode (opcional)

**Ejemplo:**

```jsx
import { ContentCard } from "../ui/Card";

<ContentCard
  title="Título de la tarjeta"
  subtitle="Subtítulo opcional"
  headerActions={<Button>Acción</Button>}
  footer={<p>Pie de página</p>}
>
  <p>Contenido principal</p>
</ContentCard>;
```

#### ProductCard

Tarjeta especializada para mostrar productos con imagen, título, precio y acciones.

**Propiedades:**

- `image`: string (opcional)
- `title`: string
- `subtitle`: string (opcional)
- `price`: string (opcional)
- `badge`: string (opcional)
- `actions`: ReactNode (opcional)

**Ejemplo:**

```jsx
import { ProductCard } from "../ui/Card";

<ProductCard
  image="/path/to/image.jpg"
  title="Nombre del Producto"
  subtitle="Descripción corta"
  price="$99.99"
  badge="Nuevo"
  actions={<Button>Comprar</Button>}
/>;
```

## Ventajas del Sistema

1. **Consistencia**: Todos los componentes siguen el mismo patrón de diseño
2. **Reutilización**: Un solo componente puede usarse en múltiples lugares
3. **Mantenibilidad**: Los cambios de estilo se hacen en un solo archivo
4. **Flexibilidad**: Múltiples variantes y opciones de personalización
5. **Accesibilidad**: Componentes construidos con mejores prácticas de accesibilidad

## Migración de Código Existente

Para migrar código existente a estos componentes:

1. **Reemplazar divs con clases de tarjeta:**

   ```jsx
   // Antes
   <div className="bg-white rounded-lg shadow-md p-6">
     <h3>Título</h3>
     <p>Contenido</p>
   </div>

   // Después
   <ContentCard title="Título">
     <p>Contenido</p>
   </ContentCard>
   ```

2. **Reemplazar tarjetas de estadísticas:**

   ```jsx
   // Antes
   <div className="bg-white rounded-lg shadow-md p-6">
     <div className="flex items-center justify-between">
       <div>
         <p className="text-sm font-medium text-gray-600">Total</p>
         <p className="text-2xl font-bold text-gray-900">123</p>
       </div>
       <Icon size={24} className="text-blue-500" />
     </div>
   </div>

   // Después
   <StatCard
     title="Total"
     value={123}
     icon={<Icon size={24} className="text-blue-500" />}
   />
   ```

3. **Reemplazar botones:**

   ```jsx
   // Antes
   <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
     Guardar
   </button>

   // Después
   <Button variant="primary">Guardar</Button>
   ```

## Personalización

Para personalizar los estilos de los componentes, edita las variables de estilo en cada archivo:

- `Button.jsx`: Modifica `variants`, `sizes` y `baseStyles`
- `Card.jsx`: Modifica `variants`, `sizes`, `shadows` y `hoverEffects`

Los cambios se aplicarán automáticamente a todos los componentes que usen esas variantes.
