import { useState, useEffect, useRef } from "react";
import { Menu, X, ShoppingCart, User, ChevronDown, Shield, ChevronRight } from "lucide-react";
import { getCategories } from "../../api/categories.api";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getUser, logout } from "../../reducer/Actions";
import { Button } from "../ui/Button";

function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector(
    (state) =>
      state.AuthReducer || {
        isAuthenticated: false,
        user: null,
      }
  );

  const [state, setState] = useState({
    menuOpen: false,
    dropdownOpen: false,
    userDropdownOpen: false,
    categories: [],
    hoveredParentId: null, // para trackear la categoría padre sobre la que está el mouse
  });

  // Estado para expandir submenús en mobile
  const [expandedParentId, setExpandedParentId] = useState(null);

  // Ref para el timeout de cierre del menú (evitar cierres abruptos)
  const dropdownTimeout = useRef(null);

  const [mobileMenu, setMobileMenu] = useState("main"); // "main", "products", "subcategories"
  const [selectedParent, setSelectedParent] = useState(null);

  const openProductsMenu = () => setMobileMenu("products");
  const backToMainMenu = () => setMobileMenu("main");
  const openSubcategoriesMenu = (category) => {
    setSelectedParent(category);
    setMobileMenu("subcategories");
  };
  const backToProductsMenu = () => setMobileMenu("products");

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories();
        setState((prevState) => ({ ...prevState, categories: data }));
      } catch (error) {
        console.error("Error loading categories", error);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getUser());
    }
  }, [isAuthenticated, dispatch]);

  const toggleState = (key) => {
    setState((prevState) => ({ ...prevState, [key]: !prevState[key] }));
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  // --- Funciones para menú desplegable ---
  const handleDropdownEnter = () => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setState((prev) => ({ ...prev, dropdownOpen: true }));
  };
  const handleDropdownLeave = () => {
    dropdownTimeout.current = setTimeout(() => {
      setState((prev) => ({ ...prev, dropdownOpen: false, hoveredParentId: null }));
    }, 180); // 180ms delay
  };

  // Para submenú por categoría padre
  const handleParentMouseEnter = (parentId) => {
    setState((prev) => ({ ...prev, hoveredParentId: parentId }));
  };

  const handleParentMouseLeave = () => {
    setState((prev) => ({ ...prev, hoveredParentId: null }));
  };

  const {
    menuOpen,
    dropdownOpen,
    userDropdownOpen,
    categories,
    hoveredParentId,
  } = state;

  // Filtrar categorías padres y subcategorías
  const parentCategories = categories.filter((cat) => !cat.parent_id);
  const subCategories = categories.filter((cat) => cat.parent_id);

  // Agrupar subcategorías por parent_id para acceso rápido
  const subCategoriesByParent = subCategories.reduce((acc, subCat) => {
    const key = typeof subCat.parent_id === "object" ? subCat.parent_id.id : subCat.parent_id;
    if (!acc[key]) acc[key] = [];
    acc[key].push(subCat);
    return acc;
  }, {});

  return (
    <header className="bg-primary-50 shadow-sm">
      <div className="container mx-auto flex justify-between items-center px-4 py-4">
        {/* Logo + Menú Desktop */}
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <h1 className="text-xl font-bold tracking-wide">Cosmo Play</h1>
          </Link>

          <nav className="hidden md:flex space-x-6">
            <div
              className="relative group"
              onMouseEnter={handleDropdownEnter}
              onMouseLeave={handleDropdownLeave}
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
                <div
                  className="absolute top-full left-0 mt-1 w-48 bg-white shadow-lg rounded-lg z-10 flex"
                  onMouseEnter={handleDropdownEnter}
                  onMouseLeave={handleDropdownLeave}
                >
                  {/* Menú principal: categorías padres */}
                  <div className="w-48">
                    {parentCategories.map((category) => {
                      const hasSubs = subCategoriesByParent[category.id]?.length > 0;
                      return (
                        <div
                          key={category.id}
                          className="relative group"
                          onMouseEnter={() => handleParentMouseEnter(category.id)}
                          onMouseLeave={handleParentMouseLeave}
                        >
                          <Link
                            to={`/products/${category.name}`}
                            className="block px-4 py-2 text-black hover:bg-gray-100 flex justify-between items-center"
                          >
                            {category.name}
                            {hasSubs && (
                              <ChevronRight className="w-4 h-4 ml-2 text-gray-600" />
                            )}
                          </Link>

                          {/* Submenú: solo si el hoveredParentId coincide y tiene subcategorías */}
                          {hasSubs && hoveredParentId === category.id && (
                            <div className="absolute top-0 left-full mt-0 w-48 bg-white shadow-lg rounded-lg z-20">
                              {subCategoriesByParent[category.id].map((subCat) => (
                                <Link
                                  key={subCat.id}
                                  to={`/products/${category.name}/${subCat.name}`}
                                  className="block px-4 py-2 text-black hover:bg-gray-100"
                                >
                                  {subCat.name}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
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
          {isAuthenticated && (
            <Button
              variant="success"
              size="default"
              as={Link}
              to="/owner2"
              className="hidden md:flex items-center"
            >
              <Shield className="w-5 h-5 mr-2" /> Admin Panel
            </Button>
          )}
          <div className="flex items-center space-x-6 relative">
            <Link to="/cart" className="text-black">
              <ShoppingCart className="w-6 h-6 cursor-pointer" />
            </Link>

            {isAuthenticated ? (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleState("userDropdownOpen")}
                  className="text-black focus:outline-none"
                >
                  <User className="w-6 h-6 cursor-pointer" />
                </Button>
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg z-10">
                    <p className="px-4 py-2 text-gray-700">
                      Hola, {user?.first_name || "Usuario"}
                    </p>
                    <hr className="border-gray-200" />
                    <Button
                      variant="ghost"
                      onClick={() => navigate("/profile")}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Editar Información
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Cerrar Sesión
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <Button
                variant="outline"
                size="default"
                as={Link}
                to="/login"
                className="hidden md:inline-block bg-white text-primary-700 hover:bg-gray-200"
              >
                Iniciar Sesión
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-black focus:outline-none"
              onClick={() => toggleState("menuOpen")}
            >
              {menuOpen ? <X size={28} /> : <Menu size={28} />}
            </Button>
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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleState("menuOpen")}
            className="text-black"
          >
            <X size={28} />
          </Button>
        </div>
        <nav className="flex flex-col space-y-4 p-4">
          {mobileMenu === "main" && (
            <>
              <Link
                to="/"
                className="text-black hover:text-gray-600"
                onClick={() => {
                  toggleState("menuOpen");
                  setMobileMenu("main");
                }}
              >
                Inicio
              </Link>
              <button
                className="flex items-center justify-between w-full text-black font-medium hover:text-gray-600"
                onClick={openProductsMenu}
              >
                <span>Productos</span>
                <ChevronRight className="w-4 h-4 ml-2 text-gray-600" />
              </button>
              <Link
                to="/contact"
                className="text-black hover:text-gray-600"
                onClick={() => {
                  toggleState("menuOpen");
                  setMobileMenu("main");
                }}
              >
                Contacto
              </Link>
              <Link
                to="/cart"
                className="text-black hover:text-gray-600"
                onClick={() => {
                  toggleState("menuOpen");
                  setMobileMenu("main");
                }}
              >
                Carrito
              </Link>
              <Link
                to="/login"
                className="text-primary-600 font-medium hover:text-primary-800"
                onClick={() => {
                  toggleState("menuOpen");
                  setMobileMenu("main");
                }}
              >
                Iniciar Sesión
              </Link>
              {isAuthenticated && (
                <Button
                  variant="primary"
                  size="default"
                  as={Link}
                  to="/owner"
                  className="bg-thirdary-600 hover:bg-thirdary-700"
                  onClick={() => {
                    toggleState("menuOpen");
                    setMobileMenu("main");
                  }}
                >
                  <Shield className="inline-block w-5 h-5 mr-2" /> Admin Panel
                </Button>
              )}
            </>
          )}

          {mobileMenu === "products" && (
            <div>
              <div className="flex items-center mb-4">
                <button onClick={backToMainMenu} className="mr-2">
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </button>
                <span className="font-bold text-lg">Productos</span>
              </div>
              <div className="flex flex-col space-y-2">
                {parentCategories.map((category) => {
                  const hasSubs = subCategoriesByParent[category.id]?.length > 0;
                  return hasSubs ? (
                    <button
                      key={category.id}
                      className="flex items-center justify-between w-full px-2 py-2 text-black hover:bg-gray-100 rounded"
                      onClick={() => openSubcategoriesMenu(category)}
                    >
                      <span>{category.name}</span>
                      <ChevronRight className="w-4 h-4 ml-2 text-gray-600" />
                    </button>
                  ) : (
                    <Link
                      key={category.id}
                      to={`/products/${category.name}`}
                      className="block px-2 py-2 text-black hover:bg-gray-100 rounded"
                      onClick={() => {
                        toggleState("menuOpen");
                        setMobileMenu("main");
                      }}
                    >
                      {category.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {mobileMenu === "subcategories" && selectedParent && (
            <div>
              <div className="flex items-center mb-4">
                <button onClick={backToProductsMenu} className="mr-2">
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </button>
                <span className="font-bold text-lg">{selectedParent.name}</span>
              </div>
              <div className="flex flex-col space-y-2">
                {subCategoriesByParent[selectedParent.id]?.map((subCat) => (
                  <Link
                    key={subCat.id}
                    to={`/products/${selectedParent.name}/${subCat.name}`}
                    className="block px-2 py-2 text-black hover:bg-gray-100 rounded"
                    onClick={() => {
                      toggleState("menuOpen");
                      setMobileMenu("main");
                    }}
                  >
                    {subCat.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
