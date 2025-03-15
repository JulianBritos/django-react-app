import { useState } from "react";
import { Menu, X, ShoppingCart, User } from "lucide-react";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <header className="bg-purple-50 shadow-sm">
      <div className="container mx-auto flex justify-between items-center px-4 py-4">
        {/* Logo + Menú Desktop */}
        <div className="flex items-center space-x-6">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <h1 className="text-xl font-bold tracking-wide">Cosmo Play</h1>
          </div>

          {/* Menú Desktop (cerca del logo) */}
          <nav className="hidden md:flex space-x-6">
            <a href="/" className="text-black font-medium hover:text-gray-600">
              Inicio
            </a>
            <a
              href="/products"
              className="text-black font-medium hover:text-gray-600"
            >
              Productos
            </a>
            <a
              href="/contact"
              className="text-black font-medium hover:text-gray-600"
            >
              Contacto
            </a>
          </nav>
        </div>

        {/* Iconos e Iniciar Sesión */}
        <div className="flex items-center space-x-6">
          <a href="/cart" className="text-black">
            <ShoppingCart className="w-6 h-6 cursor-pointer" />
          </a>
          <a href="/profile" className="text-black">
            <User className="w-6 h-6 cursor-pointer" />
          </a>

          {/* Botón Iniciar Sesión (Desktop) */}
          <a
            href="/login"
            className="hidden md:inline-block shadow-md shadow-purple-300 bg-white text-purple-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
          >
            Iniciar Sesión
          </a>

          {/* Menú Hamburguesa (Mobile) */}
          <button
            className="md:hidden text-black focus:outline-none"
            onClick={toggleMenu}
          >
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Menú Móvil (slide desde la derecha) */}
      <div
        className={`fixed top-0 right-0 h-full bg-white text-black w-64 shadow-lg transform transition-transform duration-300 ease-in-out ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        } md:hidden`}
      >
        <div className="p-4 flex justify-end">
          <button onClick={toggleMenu} className="text-black">
            <X size={28} />
          </button>
        </div>
        <nav className="flex flex-col space-y-4 p-4">
          <a
            href="/"
            className="text-black hover:text-gray-600"
            onClick={toggleMenu}
          >
            Inicio
          </a>
          <a
            href="/products"
            className="text-black hover:text-gray-600"
            onClick={toggleMenu}
          >
            Productos
          </a>
          <a
            href="/contact"
            className="text-black hover:text-gray-600"
            onClick={toggleMenu}
          >
            Contacto
          </a>
          <a
            href="/cart"
            className="text-black hover:text-gray-600"
            onClick={toggleMenu}
          >
            Carrito
          </a>
          <a
            href="/login"
            className="text-blue-600 font-medium hover:text-blue-800"
            onClick={toggleMenu}
          >
            Iniciar Sesión
          </a>
        </nav>
      </div>
    </header>
  );
}

export default Header;
