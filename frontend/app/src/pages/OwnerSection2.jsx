import React, { useState } from "react";
import Sidebar from "../components/administrativeComponents/Sidebar";
import EmptyProductView from "../components/administrativeComponents/EmptyProductView";
import NewProduct from "../components/administrativeComponents/NewProduct";
import ProductPage from "../components/administrativeComponents/ProductPage";

const OwnerSection2 = () => {
  const [currentPage, setCurrentPage] = useState(null); // Estado para la página actual
  const [products, setProducts] = useState([]); // Simular lista de productos

  const renderContent = () => {
    switch (currentPage) {
      case "Lista de productos":
        return products.length === 0 ? (
          <EmptyProductView onAddProduct={() => setCurrentPage("NewProduct")} />
        ) : (
          <ProductPage />
        );
      case "NewProduct":
        return <NewProduct />;
      default:
        return <div>Selecciona una opción desde la barra lateral</div>;
    }
  };

  return (
    <div className="flex h-screen"> {/* Contenedor principal con flex y altura completa */}
      <Sidebar onSelect={setCurrentPage} /> {/* Sidebar fija */}
      <div className="flex-1 overflow-y-auto "> {/* Contenedor para el contenido dinámico */}
        {renderContent()}
      </div>
    </div>
  );
};

export default OwnerSection2;