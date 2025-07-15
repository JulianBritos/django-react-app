# Product Cards - Componentes Centralizados

Este conjunto de componentes de ProductCard está **centralizado en `src/components/ui/Card.jsx`** para facilitar el mantenimiento y permitir cambios rápidos en la visual desde un solo lugar.

## 🎯 **Ventajas de la Centralización**

- ✅ **Un solo archivo** para todos los estilos de cards
- ✅ **Cambios rápidos** en la visual desde un lugar
- ✅ **Consistencia** en el diseño de toda la aplicación
- ✅ **Mantenimiento simplificado**
- ✅ **Reutilización** de estilos base

## Componentes Disponibles

### 1. ProductCard (Principal)

El componente principal con información completa del producto.

**Características:**

- Badges informativos (descuentos, stock, productos nuevos)
- Calificaciones y reviews
- Información de envío y garantía
- Botones de acción (favoritos, carrito, ver detalles)
- Diseño responsive
- Efectos hover y transiciones suaves

**Uso:**

```jsx
import { ProductCard } from "../components/ProductCards";

<ProductCard product={productData} addToCart={handleAddToCart} />;
```

### 2. ProductCardCompact

Versión compacta para grids densos y listas de productos.

**Características:**

- Información esencial en formato reducido
- Badges básicos
- Botón de acción simplificado
- Ideal para catálogos con muchos productos

**Uso:**

```jsx
import { ProductCardCompact } from "../components/ProductCards";

<ProductCardCompact product={productData} addToCart={handleAddToCart} />;
```

### 3. ProductCardHorizontal

Formato horizontal para resultados de búsqueda y comparaciones.

**Características:**

- Layout horizontal con imagen a la izquierda
- Información detallada a la derecha
- Botones de acción en la parte inferior
- Ideal para listas de búsqueda

**Uso:**

```jsx
import { ProductCardHorizontal } from "../components/ProductCards";

<ProductCardHorizontal product={productData} addToCart={handleAddToCart} />;
```

### 4. ProductCardHero (NUEVO)

Específicamente diseñado para secciones de productos destacados.

**Características:**

- Diseño más visual y atractivo
- Efectos hover más pronunciados (scale, translate)
- Información resumida para generar interés
- Call-to-action sutil ("Ver detalles →")
- Sin botón de carrito (enfocado en ver detalles)
- Ideal para landing pages y secciones hero

**Uso:**

```jsx
import { ProductCardHero } from "../components/ProductCards";

<ProductCardHero product={productData} />;
```

### 5. ProductCardMinimal (NUEVO)

Versión ultra-minimalista para mostrar muchos productos en poco espacio.

**Características:**

- Solo información esencial
- Un solo badge (el más importante)
- Diseño limpio y compacto
- Call-to-action sutil
- Ideal para grids muy densos o listas de productos relacionados

**Uso:**

```jsx
import { ProductCardMinimal } from "../components/ProductCards";

<ProductCardMinimal product={productData} />;
```

## 🏗️ **Arquitectura Centralizada**

```
src/
├── components/
│   ├── ui/
│   │   └── Card.jsx          ← TODOS los componentes de cards aquí
│   └── ProductCards.jsx      ← Archivo de exportación
```

### **Componentes en Card.jsx:**

- `Card` - Componente base con variantes
- `StatCard` - Para estadísticas
- `ContentCard` - Para contenido estructurado
- `ProductCard` - ProductCard básico
- `ProductCardFull` - ProductCard completo (exportado como ProductCard)
- `ProductCardCompact` - Versión compacta
- `ProductCardHorizontal` - Layout horizontal
- `ProductCardHero` - Para destacados
- `ProductCardMinimal` - Versión minimalista

## 🎨 **Personalización Centralizada**

### **Cambiar estilos globalmente:**

Para modificar el aspecto de todas las cards, edita `src/components/ui/Card.jsx`:

```jsx
// Cambiar colores base
const variants = {
  default: "bg-white border border-gray-200", // ← Modificar aquí
  elevated: "bg-white border-0", // ← O aquí
};

// Cambiar efectos hover
const hoverEffects = {
  lift: "hover:shadow-lg hover:-translate-y-1", // ← Modificar aquí
  scale: "hover:scale-105", // ← O aquí
};
```

### **Variantes disponibles:**

- `default` - Fondo blanco con borde gris
- `primary` - Fondo azul claro
- `secondary` - Fondo gris claro
- `success` - Fondo verde claro
- `warning` - Fondo amarillo claro
- `danger` - Fondo rojo claro
- `info` - Fondo azul claro
- `dark` - Fondo oscuro
- `transparent` - Fondo transparente
- `elevated` - Sin borde (para ProductCards)

### **Efectos hover disponibles:**

- `none` - Sin efecto
- `lift` - Elevación con sombra
- `glow` - Sombra con brillo azul
- `scale` - Escalado
- `border` - Cambio de borde

## Estructura de Datos Esperada

Los componentes esperan un objeto `product` con la siguiente estructura:

```javascript
{
  id: number,
  name: string,
  description: string,
  brand: string,
  status: 'ACTIVE' | 'INACTIVE',
  created_at: string, // ISO date string
  category: {
    id: number,
    name: string
  },
  product_attributes: [
    {
      id: number,
      selling_price: number,
      offer_price: number,
      stock: number,
      sku: string,
      uploaded_images: [
        {
          image: string // URL de la imagen
        }
      ]
    }
  ]
}
```

## Características Implementadas

### Badges Automáticos

- **Descuentos**: Se calculan automáticamente cuando `offer_price < selling_price`
- **Stock bajo**: Se muestra cuando hay 5 o menos unidades
- **Agotado**: Se muestra cuando `stock === 0`
- **Producto nuevo**: Se muestra para productos creados en los últimos 30 días

### Información de Precio

- Precio actual (con descuento aplicado si existe)
- Precio original tachado (si hay descuento)
- Porcentaje de descuento calculado automáticamente

### Indicadores Visuales

- Estado de stock con indicadores de color
- Calificaciones con estrellas (placeholder para futuras implementaciones)
- Información de envío y garantía (placeholders)

### Funcionalidades Interactivas

- Botón de favoritos (preparado para futuras implementaciones)
- Agregar al carrito (excepto en Hero y Minimal)
- Ver detalles del producto
- Efectos hover en imágenes y botones

## Casos de Uso Recomendados

### ProductCard (Principal)

- Páginas de catálogo principales
- Listas de productos con información completa
- Cuando necesitas mostrar toda la información disponible

### ProductCardCompact

- Grids densos de productos
- Listas de productos relacionados
- Sidebars con productos sugeridos

### ProductCardHorizontal

- Resultados de búsqueda
- Comparación de productos
- Listas de productos con información detallada

### ProductCardHero

- **Secciones de productos destacados** ⭐
- Landing pages
- Banners promocionales
- Cuando quieres generar interés sin saturar con información

### ProductCardMinimal

- Grids muy densos (6-8 columnas)
- Productos relacionados
- Listas de productos similares
- Cuando el espacio es muy limitado

## Personalización

### Colores

Los componentes usan las clases de color definidas en `tailwind.config.js`:

- `primary-*`: Colores principales de la marca
- `gray-*`: Escala de grises
- `red-*`, `green-*`, `orange-*`: Para badges y estados

### Tamaños

- **ProductCard**: Tamaño estándar para grids principales
- **ProductCardCompact**: Tamaño reducido para grids densos
- **ProductCardHorizontal**: Layout horizontal flexible
- **ProductCardHero**: Tamaño estándar con efectos visuales mejorados
- **ProductCardMinimal**: Tamaño ultra-compacto

## Integración con el Carrito

Los componentes ProductCard, ProductCardCompact y ProductCardHorizontal requieren una función `addToCart`:

```jsx
const { addToCart } = useCart();

<ProductCard product={product} addToCart={addToCart} />;
```

Los componentes ProductCardHero y ProductCardMinimal no incluyen funcionalidad de carrito por diseño.

## Responsive Design

Todos los componentes están optimizados para diferentes tamaños de pantalla:

### ProductCard, ProductCardHero

- **Mobile**: 1 columna
- **Tablet**: 2-3 columnas
- **Desktop**: 3-4 columnas
- **Large Desktop**: 4-6 columnas

### ProductCardCompact

- **Mobile**: 2 columnas
- **Tablet**: 3-4 columnas
- **Desktop**: 4-6 columnas
- **Large Desktop**: 6-8 columnas

### ProductCardMinimal

- **Mobile**: 2 columnas
- **Tablet**: 3-4 columnas
- **Desktop**: 4-6 columnas
- **Large Desktop**: 6-8 columnas

### ProductCardHorizontal

- **Mobile**: 1 columna
- **Tablet**: 1 columna
- **Desktop**: 1 columna
- **Large Desktop**: 1 columna

## Accesibilidad

- Imágenes con `alt` text apropiado
- Botones con `aria-label` cuando es necesario
- Navegación por teclado
- Contraste de colores adecuado

## 🔧 **Mantenimiento**

### **Para agregar un nuevo tipo de card:**

1. Crear el componente en `src/components/ui/Card.jsx`
2. Agregar la exportación en el mismo archivo
3. Actualizar `src/components/ProductCards.jsx` si es necesario

### **Para cambiar estilos globalmente:**

1. Editar `src/components/ui/Card.jsx`
2. Los cambios se aplicarán a todos los componentes que usen Card

### **Para cambiar estilos específicos:**

1. Usar la prop `className` para sobrescribir estilos
2. O modificar el componente específico en `Card.jsx`

## Futuras Mejoras

- Integración con sistema de reviews y calificaciones
- Funcionalidad de favoritos
- Comparación de productos
- Filtros avanzados
- Búsqueda en tiempo real
- Wishlist personalizada

# ClientDetailCard Component

## Descripción

El componente `ClientDetailCard` es una tarjeta modal que muestra todos los detalles disponibles de un cliente cuando se presiona el botón "Ver detalles" en la lista de clientes.

## Características

### Visualización de Datos

- **Información Personal**: Nombre, apellido, nombre de usuario, fecha de nacimiento
- **Información de Contacto**: Email (solo lectura), teléfono
- **Dirección**: Dirección completa, ciudad, país
- **Información de Cuenta**: Estado (activo/inactivo), rol
- **Fechas**: Fecha de registro, último acceso

### Funcionalidades de Edición

- **Permisos**: Solo usuarios superusuarios o administradores pueden editar
- **Campos Editables**: Todos los campos excepto email (por seguridad)
- **Validación**: Formulario con validación básica
- **Guardado**: Actualización en tiempo real de la lista de clientes

### Interfaz de Usuario

- **Modal Responsivo**: Se adapta a diferentes tamaños de pantalla
- **Iconos Intuitivos**: Uso de iconos de Lucide React para mejor UX
- **Estados de Carga**: Indicadores visuales durante operaciones
- **Manejo de Errores**: Alertas para errores de actualización

## Uso

### Integración con ClientsList

```jsx
import ClientDetailCard from "./ClientDetailCard";

// En el componente padre
const [selectedClient, setSelectedClient] = useState(null);

const handleViewDetails = (client) => {
  setSelectedClient(client);
};

const handleCloseDetails = () => {
  setSelectedClient(null);
};

const handleClientUpdate = (updatedClient) => {
  // Actualizar la lista local
  setClients((prevClients) =>
    prevClients.map((client) =>
      client.id === updatedClient.id ? updatedClient : client
    )
  );
};

// En el JSX
{
  selectedClient && (
    <ClientDetailCard
      client={selectedClient}
      onClose={handleCloseDetails}
      onUpdate={handleClientUpdate}
    />
  );
}
```

### Props

| Prop       | Tipo     | Descripción                                          |
| ---------- | -------- | ---------------------------------------------------- |
| `client`   | Object   | Objeto con todos los datos del cliente               |
| `onClose`  | Function | Función para cerrar el modal                         |
| `onUpdate` | Function | Función para actualizar el cliente en la lista padre |

### Estructura de Datos del Cliente

```javascript
{
  id: number,
  email: string,
  first_name: string,
  last_name: string,
  username: string,
  phone: string,
  birth_date: string,
  address: string,
  city: string,
  country: string,
  is_active: boolean,
  role: string,
  date_joined: string,
  last_login: string,
  profile_picture: string
}
```

## Permisos de Edición

### Usuarios que pueden editar:

- **Superusuarios**: `is_superuser: true`
- **Administradores**: `role: "admin"`

### Usuarios que NO pueden editar:

- **Vendedores**: `role: "vendedor"`
- **Clientes**: `role: "cliente"`

## API Endpoints Utilizados

- `GET /api/users/me/` - Obtener usuario actual para verificar permisos
- `PATCH /api/users/{id}/` - Actualizar datos del cliente

## Estilos

El componente utiliza Tailwind CSS con las siguientes clases principales:

- **Modal**: `fixed inset-0 bg-black bg-opacity-50`
- **Card**: `bg-white rounded-lg shadow-xl`
- **Responsive**: `max-w-2xl w-full max-h-[90vh]`
- **Grid**: `grid grid-cols-1 md:grid-cols-2`

## Manejo de Estados

1. **Estado de Edición**: `isEditing` controla si el formulario está en modo edición
2. **Estado de Carga**: `loading` muestra spinner durante guardado
3. **Usuario Actual**: `currentUser` almacena datos del usuario logueado
4. **Datos del Formulario**: `formData` mantiene los valores editables

## Validaciones

- **Campos Requeridos**: Nombre es obligatorio
- **Formato de Email**: Validación automática del backend
- **Permisos**: Verificación de rol antes de permitir edición
- **Errores de API**: Manejo de errores de red y servidor

## Mejoras Futuras

1. **Validación en Frontend**: Agregar validación más robusta
2. **Historial de Cambios**: Registrar cambios realizados
3. **Notificaciones**: Sistema de notificaciones más elegante
4. **Imagen de Perfil**: Permitir subir/cambiar imagen de perfil
5. **Exportar Datos**: Opción para exportar información del cliente
