import React, { useState } from "react";
import Sidebar from "../components/administrativeComponents/Sidebar";
import NewProduct from "../components/administrativeComponents/NewProduct";
import ProductPage from "../components/administrativeComponents/ProductPage";
import CategoriesManagementPage from "./CategoriesManagementPage";
import ClientsList from "../components/administrativeComponents/ClientsList";

const OwnerSection2 = () => {
  const [currentPage, setCurrentPage] = useState(null); // Estado para la página actual

  const handleSidebarSelect = (selectedItem) => {
    setCurrentPage(selectedItem);
  };

  const renderContent = () => {
    switch (currentPage) {
      case "Lista de productos":
        return <ProductPage />;
      case "NewProduct":
        return <NewProduct />;
      case "Categorías":
        return <CategoriesManagementPage />;
      case "Listado":
        return <ClientsList />;
      default:
        return <div>Selecciona una opción desde la barra lateral</div>;
    }
  };

  return (
    <div className="flex h-screen">
      {" "}
      {/* Contenedor principal con flex y altura completa */}
      <Sidebar onSelect={handleSidebarSelect} /> {/* Sidebar fija */}
      <div className="flex-1 overflow-y-auto ">
        {" "}
        {/* Contenedor para el contenido dinámico */}
        {renderContent()}
      </div>
    </div>
  );
};

export default OwnerSection2;
