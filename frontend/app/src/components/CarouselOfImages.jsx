import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "./ui/Button";

const CarouselOfImages = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  if (!images || images.length === 0) {
    return <p>No hay imágenes disponibles</p>;
  }

  const maxVisibleThumbnails = Math.floor(600 / 80);

  const selectImage = (index) => {
    if (
      index === maxVisibleThumbnails - 1 &&
      images.length > maxVisibleThumbnails
    ) {
      setCurrentIndex(maxVisibleThumbnails - 1);
      setIsOverlayOpen(true);
    } else {
      setCurrentIndex(index);
    }
  };

  const toggleOverlay = () => {
    setIsOverlayOpen(!isOverlayOpen);
  };

  const navigateOverlay = (direction) => {
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex + direction;
      if (newIndex < 0) return images.length - 1;
      if (newIndex >= images.length) return 0;
      return newIndex;
    });
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOverlayOpen(false);
      }
    };

    const handleClickOutside = (event) => {
      if (event.target.classList.contains("overlay")) {
        setIsOverlayOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex w-full max-w-5xl items-center">
      {/* Barra lateral de miniaturas */}
      <div className="flex flex-col max-h-[600px] w-24 space-y-2 pr-2 relative overflow-hidden justify-center">
        {images.slice(0, maxVisibleThumbnails).map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Miniatura ${index + 1}`}
            className={`w-20 h-20 object-cover rounded cursor-pointer border ${
              index === currentIndex
                ? "border-primary-500 border-2"
                : "border-gray-300 border"
            }`}
            onMouseEnter={() => setCurrentIndex(index)}
          />
        ))}
        {images.length > maxVisibleThumbnails && (
          <div
            className="absolute bottom-0 left-0 w-20 h-20 bg-gray-800 bg-opacity-50 flex items-center justify-center text-white text-sm font-bold rounded cursor-pointer"
            onClick={() => {
              setCurrentIndex(maxVisibleThumbnails - 1);
              setIsOverlayOpen(true);
            }}
          >
            +{images.length - maxVisibleThumbnails}
          </div>
        )}
      </div>

      {/* Imagen principal */}
      <div className="relative flex-1 bg-white h-[700px] flex items-center justify-center rounded-lg">
        <img
          src={images[currentIndex]}
          alt={`Imagen ${currentIndex + 1}`}
          className="h-full w-full object-contain cursor-pointer"
          onClick={toggleOverlay}
        />
      </div>

      {/* Overlay de imagen ampliada */}
      {isOverlayOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 overlay">
          <div
            className="relative w-[100%] h-[100%] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[currentIndex]}
              alt={`Imagen ampliada ${currentIndex + 1}`}
              className="w-[55%] object-contain rounded-lg"
            />
            <div className="absolute top-4 left-4 bg-black bg-opacity-50 w-16 h-12 flex items-center justify-center rounded shadow-md text-white text-lg font-semibold">
              {currentIndex + 1} / {images.length}
            </div>
            <button
              className="absolute top-4 right-4 bg-black bg-opacity-50 w-12 h-12 flex items-center justify-center rounded shadow-md"
              onClick={toggleOverlay}
            >
              <X className="text-white w-10 h-10" />
            </button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateOverlay(-1)}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg"
            >
              ←
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateOverlay(1)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg"
            >
              →
            </Button>
          </div>
        </div>
      )}

      {/* Indicadores */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {images.map((_, index) => (
          <Button
            key={index}
            variant={currentIndex === index ? "primary" : "ghost"}
            size="icon"
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full ${
              currentIndex === index ? "bg-white" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CarouselOfImages;
