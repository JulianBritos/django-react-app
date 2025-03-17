import { useState } from "react";
import { Menu, X, ShoppingCart, User, ChevronDown } from "lucide-react"; // MODIFICADO: Se agregó ChevronDown para la flecha

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false); // MODIFICADO: Se agregó estado para controlar el desplegable
  let dropdownTimeout;

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen); // MODIFICADO: Función para abrir/cerrar el menú desplegable

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
            <a href="/" className="text-black font-medium hover:text-gray-600">Inicio</a>

            <div 
              className="relative" 
              onMouseEnter={() => {
                clearTimeout(dropdownTimeout);
                setDropdownOpen(true);
              }} 
              onMouseLeave={() => {
                dropdownTimeout = setTimeout(() => setDropdownOpen(false), 300);
              }}
            > {/* MODIFICADO: Contenedor para menú desplegable con retraso al cerrar */}
              <a href="/products" className="text-black font-medium hover:text-gray-600 flex items-center" onClick={toggleDropdown}> {/* MODIFICADO: Agregado flex y evento de click */}
                Productos
                <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${dropdownOpen ? "rotate-180" : "rotate-0"}`} /> {/* MODIFICADO: Flecha dinámica */}
              </a>
              {dropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white shadow-lg rounded-lg z-10"> {/* MODIFICADO: Estilos del menú desplegable */}
                  <a href="/products" className="block px-4 py-2 text-black font-semibold hover:bg-gray-100">Todos los productos</a> {/* MODIFICADO: Nuevo botón de todos los productos */}
                  <a href="/products/category1" className="block px-4 py-2 text-black hover:bg-gray-100">Categoría 1</a>
                  <a href="/products/category2" className="block px-4 py-2 text-black hover:bg-gray-100">Categoría 2</a>
                  <a href="/products/category3" className="block px-4 py-2 text-black hover:bg-gray-100">Categoría 3</a>
                </div>
              )}
            </div>

            <a href="/contact" className="text-black font-medium hover:text-gray-600">Contacto</a>
          </nav>
        </div>

        {/* Iconos e Iniciar Sesión */}
        <div className="flex items-center space-x-6">
          <a href="/cart" className="text-black"><ShoppingCart className="w-6 h-6 cursor-pointer" /></a>
          <a href="/profile" className="text-black"><User className="w-6 h-6 cursor-pointer" /></a>

          {/* Botón Iniciar Sesión (Desktop) */}
          <a href="/login" className="hidden md:inline-block shadow-md shadow-purple-300 bg-white text-purple-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition">Iniciar Sesión</a>

          {/* Menú Hamburguesa (Mobile) */}
          <button className="md:hidden text-black focus:outline-none" onClick={toggleMenu}>{menuOpen ? <X size={28} /> : <Menu size={28} />}</button>
        </div>
      </div>

      {/* Menú Móvil (slide desde la derecha) */}
      <div className={`fixed top-0 right-0 h-full bg-white text-black w-64 shadow-lg transform transition-transform duration-300 ease-in-out ${menuOpen ? "translate-x-0" : "translate-x-full"} md:hidden`}>
        <div className="p-4 flex justify-end">
          <button onClick={toggleMenu} className="text-black"><X size={28} /></button>
        </div>
        <nav className="flex flex-col space-y-4 p-4">
          <a href="/" className="text-black hover:text-gray-600" onClick={toggleMenu}>Inicio</a>
          <div>
            <button className="text-black hover:text-gray-600 flex items-center w-full text-left" onClick={toggleDropdown}> {/* MODIFICADO: Botón en móvil */}
              Productos
              <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${dropdownOpen ? "rotate-180" : "rotate-0"}`} /> {/* MODIFICADO: Flecha en móvil */}
            </button>
            {dropdownOpen && (
              <div className="pl-4 mt-2 space-y-2"> {/* MODIFICADO: Menú desplegable en móvil */}
                <a href="/products" className="block text-black font-semibold hover:text-gray-600">Todos los productos</a> {/* MODIFICADO: Nuevo botón de todos los productos en móvil */}
                <a href="/products/category1" className="block text-black hover:text-gray-600">Categoría 1</a>
                <a href="/products/category2" className="block text-black hover:text-gray-600">Categoría 2</a>
                <a href="/products/category3" className="block text-black hover:text-gray-600">Categoría 3</a>
              </div>
            )}
          </div>
          <a href="/contact" className="text-black hover:text-gray-600" onClick={toggleMenu}>Contacto</a>
          <a href="/cart" className="text-black hover:text-gray-600" onClick={toggleMenu}>Carrito</a>
          <a href="/login" className="text-blue-600 font-medium hover:text-blue-800" onClick={toggleMenu}>Iniciar Sesión</a>
        </nav>
      </div>
    </header>
  );
}

export default Header;
