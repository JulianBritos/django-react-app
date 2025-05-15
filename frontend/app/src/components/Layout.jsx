import { Outlet } from "react-router-dom";
import Header from "./landingPageComponents/Header";
import Footer from "./landingPageComponents/Footer";

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
