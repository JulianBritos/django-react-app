import { useState, useEffect } from "react";
import { Menu, X, ShoppingCart, User, ChevronDown, Shield } from "lucide-react";
import { getCategories } from "../api/categorys.api";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUserInfo } from "../api/user.api";

function Header() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [isAdmin] = useState(true); // Esto es temporal

  useEffect(() => {
    const loadCategories = async () => {
      const data = await getCategories();
      setCategories(data);
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const data = await getUserInfo();
        setUserName(data.first_name);
      } catch (error) {
        console.error("Error fetching user info", error);
      }
    };
    if (isAuthenticated) fetchUserInfo();
  }, [isAuthenticated]);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const toggleUserDropdown = () => setUserDropdownOpen(!userDropdownOpen);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-purple-50 shadow-sm">
      <div className="container mx-auto flex justify-between items-center px-4 py-4">
        {/* Logo + Menú Desktop */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <h1 className="text-xl font-bold tracking-wide">Cosmo Play</h1>
          </div>

          <nav className="hidden md:flex space-x-6">
            <Link to="/" className="text-black font-medium hover:text-gray-600">
              Inicio
            </Link>
            <div
              className="relative"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <Link
                to="/products/allproducts"
                className="text-black font-medium hover:text-gray-600 flex items-center"
              >
                Productos
                <ChevronDown
                  className={`w-4 h-4 ml-1 transition-transform ${
                    dropdownOpen ? "rotate-180" : "rotate-0"
                  }`}
                />
              </Link>
              {dropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white shadow-lg rounded-lg z-10">
                  {categories.map((category, index) => (
                    <Link
                      key={index}
                      to={`/products/${category.name}`}
                      className="block px-4 py-2 text-black hover:bg-gray-100"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <Link
              to="/contact"
              className="text-black font-medium hover:text-gray-600"
            >
              Contacto
            </Link>
          </nav>
        </div>

        {/* Iconos e Iniciar Sesión */}
        <div className="flex items-center space-x-6">
          {isAdmin && (
            <Link
              to="/owner"
              className="hidden md:flex items-center bg-green-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-green-700 shadow-md transition text-base"
            >
              <Shield className="w-5 h-5 mr-2" /> Admin Panel
            </Link>
          )}
          <div className="flex items-center space-x-6 relative">
            <Link to="/cart" className="text-black">
              <ShoppingCart className="w-6 h-6 cursor-pointer" />
            </Link>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={toggleUserDropdown}
                  className="text-black focus:outline-none"
                >
                  <User className="w-6 h-6 cursor-pointer" />
                </button>
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg z-10">
                    <p className="px-4 py-2 text-gray-700">
                      Hola, {userName || "Usuario"}
                    </p>
                    <hr className="border-gray-200" />
                    <button
                      onClick={() => navigate("/profile")}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Editar Información
                    </button>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:inline-block shadow-md shadow-purple-300 bg-white text-purple-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
              >
                Iniciar Sesión
              </Link>
            )}

            <button
              className="md:hidden text-black focus:outline-none"
              onClick={toggleMenu}
            >
              {menuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú Móvil */}
      <div
        className={`fixed top-0 right-0 h-full bg-white text-black w-64 shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        } md:hidden`}
      >
        <div className="p-4 flex justify-end">
          <button onClick={toggleMenu} className="text-black">
            <X size={28} />
          </button>
        </div>
        <nav className="flex flex-col space-y-4 p-4">
          <Link
            to="/"
            className="text-black hover:text-gray-600"
            onClick={toggleMenu}
          >
            Inicio
          </Link>
          <div>
            <button
              className="text-black hover:text-gray-600 flex items-center w-full text-left"
              onClick={toggleDropdown}
            >
              Productos
              <ChevronDown
                className={`w-4 h-4 ml-1 transition-transform ${
                  dropdownOpen ? "rotate-180" : "rotate-0"
                }`}
              />
            </button>
            {dropdownOpen && (
              <div className="pl-4 mt-2 space-y-2">
                <Link
                  to="/products/allproducts"
                  className="block text-black hover:text-gray-600"
                  onClick={toggleMenu}
                >
                  Todos los productos
                </Link>
                {categories.map((category, index) => (
                  <Link
                    key={index}
                    to={`/products/${category.name}`}
                    className="block text-black hover:text-gray-600"
                    onClick={toggleMenu}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link
            to="/contact"
            className="text-black hover:text-gray-600"
            onClick={toggleMenu}
          >
            Contacto
          </Link>
          <Link
            to="/cart"
            className="text-black hover:text-gray-600"
            onClick={toggleMenu}
          >
            Carrito
          </Link>
          <Link
            to="/login"
            className="text-blue-600 font-medium hover:text-blue-800"
            onClick={toggleMenu}
          >
            Iniciar Sesión
          </Link>
          {isAdmin && (
            <Link
              to="/owner"
              className="bg-green-600 text-white px-5 py-2 rounded-md text-center font-bold hover:bg-green-700 transition text-base"
              onClick={toggleMenu}
            >
              <Shield className="inline-block w-5 h-5 mr-2" /> Admin Panel
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
