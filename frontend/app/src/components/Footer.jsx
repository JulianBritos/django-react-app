const Footer = () => {
  return (
    <footer className="bg-transpaarent shadow-xl text-gray-800 py-2 mt-4">
      <div className="container mx-auto text-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Mi Tienda. Todos los derechos
          reservados.
        </p>
        <nav className="mt-2">
          <a href="/terms" className="text-gray-800 hover:text-gray-950 mx-2">
            Términos y Condiciones
          </a>
          <a href="/privacy" className="text-gray-800 hover:text-gray-950 mx-2">
            Política de Privacidad
          </a>
          <a href="/contact" className="text-gray-800 hover:text-gray-950 mx-2">
            Contacto
          </a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
