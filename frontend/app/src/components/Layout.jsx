import { Outlet } from "react-router-dom";
import Header from "./landingPageComponents/Header";
import Footer from "./landingPageComponents/Footer";
import WhatsAppFloating from "./WhatsAppFloating";

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      {/* Añadir botón flotante de WhatsApp (se renderiza solo en mobile via Tailwind) */}
      <WhatsAppFloating />
    </div>
  );
};

export default Layout;
