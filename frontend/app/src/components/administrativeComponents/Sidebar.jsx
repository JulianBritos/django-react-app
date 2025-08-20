import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // <-- Agrega esta línea
import {
  Home,
  BarChart2,
  DollarSign,
  Tag,
  CreditCard,
  Users,
  Percent,
  Megaphone,
  Store,
  MonitorSmartphone,
  Share2,
  Boxes,
  Settings,
  Puzzle,
} from "lucide-react";

const sidebarItems = [
  {
    label: "Tu eCommerce",
    icon: <Home size={18} />,
    key: "Tu eCommerce",
    children: [],
  },
  {
    label: "Estadísticas",
    icon: <BarChart2 size={18} />,
    key: "estadisticas",
    children: [],
  },
  {
    label: "Ventas",
    icon: <DollarSign size={18} />,
    key: "ventas",
    children: ["Lista de ventas", "Órdenes de compra", "Carritos abandonados"],
  },
  {
    label: "Productos",
    icon: <Tag size={18} />,
    key: "productos",
    children: ["Lista de productos", "Inventario", "Categorías"],
  },
  {
    label: "Pagos",
    icon: <CreditCard size={18} />,
    key: "pagos",
    children: ["Pasarelas", "Historial"],
  },
  {
    label: "Clientes",
    icon: <Users size={18} />,
    key: "clientes",
    children: ["Listado", "Segmentos"],
  },
  {
    label: "Descuentos",
    icon: <Percent size={18} />,
    key: "descuentos",
    children: ["Cupones", "Promociones"],
  },
  {
    label: "Marketing",
    icon: <Megaphone size={18} />,
    key: "marketing",
    children: ["Campañas", "Email Marketing"],
  },
];

const Sidebar = ({ onSelect }) => {
  const [openSection, setOpenSection] = useState(null);
  const [activeMainItem, setActiveMainItem] = useState(null);
  const [activeSubItem, setActiveSubItem] = useState(null);
  const navigate = useNavigate(); // <-- Agrega esta línea

  const handleToggle = (key) => {
    if (key === "Tu eCommerce") {
      setActiveMainItem(key);
      navigate("/"); // <-- Navega a la ruta raíz
      return;
    }
    if (openSection === key) {
      setOpenSection(null);
    } else {
      setOpenSection(key);
    }
    setActiveMainItem(key);
  };

  const handleSubItemClick = (subItem) => {
    setActiveSubItem(subItem); // Marcar el subbotón activo
    onSelect(subItem); // Notificar selección de subelemento al nivel superior
  };

  return (
    <div className="w-72 h-screen bg-gradient-to-b from-primary-50 to-primary-100 p-6 text-gray-700 shadow-lg rounded-lg overflow-y-auto scrollbar scrollbar-thumb-primary-300 scrollbar-track-primary-100 scrollbar-thin">
      <ul className="space-y-4 mb-6">
        {sidebarItems.map((item) => (
          <li key={item.key} className="mb-4">
            <div
              onClick={() => handleToggle(item.key)}
              className={`flex items-center gap-3 cursor-pointer px-4 py-3 rounded-lg transition-all duration-300 ease-in-out font-semibold ${
                activeMainItem === item.key
                  ? "bg-primary-200 text-primary-700"
                  : "hover:bg-primary-100"
              }`}
            >
              {item.icon}
              <span className="text-sm">{item.label}</span>
            </div>
            {openSection === item.key && item.children.length > 0 && (
              <ul className="ml-6 mt-3 space-y-3">
                {item.children.map((subItem, idx) => (
                  <li
                    key={idx}
                    onClick={() => handleSubItemClick(subItem)} // Manejar clic en subbotón
                    className={`cursor-pointer transition-all duration-200 text-sm ${
                      activeSubItem === subItem
                        ? "text-primary-600"
                        : "text-gray-600 hover:text-primary-600"
                    }`}
                  >
                    {subItem}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>

      {/* Canales de venta */}
      <h2 className="text-xs text-gray-500 uppercase mb-4">Canales de venta</h2>
      <ul className="space-y-4 mb-6">
        <li className="flex items-center gap-3 cursor-pointer hover:bg-primary-100 px-4 py-3 rounded-lg transition-all duration-200">
          <Store size={18} className="text-primary-600" /> Tienda online
        </li>
        <li className="flex items-center gap-3 cursor-pointer hover:bg-primary-100 px-4 py-3 rounded-lg transition-all duration-200">
          <MonitorSmartphone size={18} className="text-primary-600" /> Punto de
          Venta
        </li>
        <li className="flex items-center gap-3 cursor-pointer hover:bg-primary-100 px-4 py-3 rounded-lg transition-all duration-200">
          <Share2 size={18} className="text-primary-600" /> Redes sociales
        </li>
        <li className="flex items-center gap-3 cursor-pointer hover:bg-primary-100 px-4 py-3 rounded-lg transition-all duration-200">
          <Boxes size={18} className="text-primary-600" /> Marketplaces
        </li>
      </ul>

      {/* Potenciar */}
      <h2 className="text-xs text-gray-500 uppercase mb-4">Potenciar</h2>
      <ul className="space-y-4 mb-6">
        <li className="flex items-center gap-3 text-gray-400 px-4 py-3">
          <Puzzle size={18} className="text-primary-500" /> Aplicaciones
        </li>
      </ul>

      {/* Configuración */}
      <ul className="space-y-4 mt-auto">
        <li className="flex items-center gap-3 cursor-pointer hover:bg-primary-200 px-4 py-3 rounded-lg transition-all duration-200">
          <Settings size={18} className="text-primary-600" /> Configuración
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
