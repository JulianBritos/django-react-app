import { Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function CartItem({ item }) {
  const itemTotal = item.price * item.quantity;

  return (
    <div className="py-4 flex flex-col md:grid md:grid-cols-5 gap-4">
      {/* Producto */}
      <div className="col-span-2 flex items-center space-x-4">
        <div className="relative h-20 w-20 flex-shrink-0">
          {/* Usamos el tag <img> en lugar de <Image> de Next.js */}
          <img
            src={item.image || "/placeholder.svg"}
            alt={item.name}
            className="object-cover rounded w-full h-full" // Usamos estilos de Tailwind
          />
        </div>
        <div>
          <h3 className="text-sm font-medium">{item.name}</h3>
          <p className="text-xs text-gray-500 mt-1">
            SKU: PRD-{item.id}00{item.id}
          </p>
          <button className="text-xs text-red-500 mt-1 md:hidden">
            Eliminar
          </button>
        </div>
      </div>

      {/* Precio */}
      <div className="md:text-center flex justify-between">
        <span className="md:hidden text-sm text-gray-600">Precio:</span>
        <span className="text-sm">${item.price.toFixed(2)}</span>
      </div>

      {/* Cantidad */}
      <div className="md:text-center flex justify-between items-center">
        <span className="md:hidden text-sm text-gray-600">Cantidad:</span>
        <div className="flex items-center border rounded-md">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none">
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-8 text-center text-sm">{item.quantity}</span>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none">
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Total */}
      <div className="md:text-center flex justify-between items-center">
        <span className="md:hidden text-sm text-gray-600">Total:</span>
        <span className="text-sm font-medium">${itemTotal.toFixed(2)}</span>
        <Button variant="ghost" size="icon" className="h-8 w-8 hidden md:flex">
          <X className="h-4 w-4" />
          <span className="sr-only">Eliminar</span>
        </Button>
      </div>
    </div>
  );
}
