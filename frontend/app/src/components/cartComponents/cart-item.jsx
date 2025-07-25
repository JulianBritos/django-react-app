import { Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function CartItem({
  item,
  checked,
  onCheck,
  onIncrease,
  onDecrease,
  onRemove,
  isFirstItem,
}) {
  const itemTotal = item.price * item.quantity;

  return (
    <>
      {/* Encabezado solo en desktop */}
      {isFirstItem && (
        <div className="hidden md:grid md:grid-cols-8 gap-4 mb-4 text-sm font-semibold text-gray-600">
          <div className="text-center"></div>
          <div className="col-span-2">Producto</div>
          <div className="text-center">SKU</div>
          <div className="text-center">Precio</div>
          <div className="text-center">Cantidad</div>
          <div className="text-center">Total</div>
          <div className="text-center"></div>
        </div>
      )}

      {/* Desktop */}
      <div className="py-4 hidden md:grid md:grid-cols-8 gap-4 items-center">
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={checked}
            onChange={onCheck}
            className="w-5 h-5 accent-primary-600"
          />
        </div>

        <div className="col-span-2 flex items-center space-x-4">
          <div className="relative h-16 w-16 flex-shrink-0">
            <img
              src={item.image || "/placeholder.svg"}
              alt={item.name}
              className="object-cover rounded w-full h-full"
            />
          </div>
          <div>
            <h3 className="text-sm font-medium">{item.name}</h3>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <span className="text-sm">{`PRD-${item.id}00${item.id}`}</span>
        </div>

        <div className="flex items-center justify-center">
          <span className="text-sm">${item.price.toFixed(2)}</span>
        </div>

        <div className="flex items-center justify-center">
          <div className="flex items-center border rounded-md">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-none"
              onClick={onDecrease}
              disabled={item.quantity <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center text-sm">{item.quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-none"
              onClick={onIncrease}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <span className="text-sm font-medium">${itemTotal.toFixed(2)}</span>
        </div>

        <div className="flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onRemove}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Eliminar</span>
          </Button>
        </div>
      </div>

      {/* Mobile: mostramos todo en un bloque */}
      <div className="flex flex-col gap-3 md:hidden bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={checked}
            onChange={onCheck}
            className="w-5 h-5 accent-primary-600"
          />
          <div className="relative h-16 w-16 flex-shrink-0">
            <img
              src={item.image || "/placeholder.svg"}
              alt={item.name}
              className="object-cover rounded w-full h-full"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-medium">{item.name}</h3>
            <span className="text-xs text-gray-500">{`PRD-${item.id}00${item.id}`}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onRemove}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Eliminar</span>
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Precio:</span>
          <span className="text-sm">${item.price.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Cantidad:</span>
          <div className="flex items-center border rounded-md">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-none"
              onClick={onDecrease}
              disabled={item.quantity <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center text-sm">{item.quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-none"
              onClick={onIncrease}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Total:</span>
          <span className="text-sm font-medium">${itemTotal.toFixed(2)}</span>
        </div>
      </div>
    </>
  );
}
