import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ScrollableNavbar = ({ categories, onCategoryClick }) => { // AGREGA onCategoryClick COMO PROP
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.25;
      
      const start = scrollLeft;
      const end = direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
      const duration = 800; // Duración en milisegundos
      const startTime = performance.now();

      const animateScroll = (currentTime) => {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        scrollRef.current.scrollLeft = start + (end - start) * progress;
        if (progress < 1) {
          requestAnimationFrame(animateScroll);
        }
      };

      requestAnimationFrame(animateScroll);
    }
  };

  return (
    <div className="relative w-full overflow-hidden bg-white flex items-center px-4 py-2"> {/* Agregado padding lateral */}
      {/* Botones de desplazamiento en versión desktop */}
      <button
        className="hidden md:flex bg-gray-200 p-1 rounded-full z-10 transition-transform transform hover:scale-150 duration-300" /* Aumento de escala más notable y animación más lenta */
        onClick={() => scroll("left")}
      >
        <ChevronLeft className="w-6 h-6 text-gray-600" /> {/* Tamaño ajustado */}
      </button>

      {/* Contenedor scrollable */}
      <div
        ref={scrollRef}
        className="flex space-x-8 overflow-x-auto scrollbar-hide px-4 w-screen items-center"
        style={{
          scrollSnapType: "x mandatory", 
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none", /* Oculta la barra de desplazamiento en Firefox */
          msOverflowStyle: "none" /* Oculta la barra de desplazamiento en Edge */
        }}
      >
        {categories.map((category, index) => (
          <button
            key={index}
            className="flex-shrink-0 px-4 py-2 text-gray-800 hover:text-gray-600 transition"
            onClick={() => onCategoryClick(category)} // AGREGA EL EVENTO PARA ACTUALIZAR EL TÍTULO
          >
            {category}
          </button>
        ))}
      </div>

      {/* Botones de desplazamiento en versión desktop */}
      <button
        className="hidden md:flex bg-gray-200 p-1 rounded-full z-10 transition-transform transform hover:scale-150 duration-300" /* Aumento de escala más notable y animación más lenta */
        onClick={() => scroll("right")}
      >
        <ChevronRight className="w-6 h-6 text-gray-600" /> {/* Tamaño ajustado */}
      </button>
    </div>
  );
};

export default ScrollableNavbar;