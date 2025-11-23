import { useState, useEffect, useRef } from "react";
import { Button } from "../ui/Button";
import { ProductCardHero } from "../ProductCards";

const BREAKPOINT = 480;

const BestProducts = ({ products = [] }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= BREAKPOINT);
  const [current, setCurrent] = useState(0);
  const carouselRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= BREAKPOINT);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Asegurarse de que products sea un array
  const safeProducts = Array.isArray(products) ? products : [];
  const featured = safeProducts.slice(0, 3);

  // Actualiza el punto activo al scrollear manualmente
  useEffect(() => {
    if (!isMobile || !carouselRef.current) return;

    const handleScroll = () => {
      const scrollLeft = carouselRef.current.scrollLeft;
      const width = carouselRef.current.offsetWidth;
      const idx = Math.round(scrollLeft / width);

      setCurrent(idx);
    };

    const ref = carouselRef.current;
    ref.addEventListener("scroll", handleScroll);

    return () => ref.removeEventListener("scroll", handleScroll);
  }, [isMobile]);


  return (
    <section className="w-full max-w-7xl mx-auto mt-6 p-4 sm:p-6 rounded-2xl flex flex-col">
      <div className="py-2">
        <div className="flex flex-col md:flex-row items-center md:items-center justify-between gap-8">
          {/* Texto y botón */}
          <div className="w-full md:w-1/3 mb-6 md:mb-0">
            <h2 className="text-start text-2xl sm:text-3xl font-bold text-black">
              Productos destacados
            </h2>
            <p className="text-start text-gray-500 mt-2 text-base sm:text-lg">
              La forma más fácil de llevar una vida saludable comprando tus juguetes favoritos.
            </p>
            <div className="flex flex-col items-start">
              <Button
                variant="outline"
                size="default"
                as="a"
                href="/products"
                className="mt-4"
              >
                Ver más
                <span className="ml-2">→</span>
              </Button>
            </div>
          </div>

          {/* Carrusel en móviles, grid en desktop */}
          <div className="w-full md:w-2/3">
            {isMobile ? (
              <>
                <div
                  ref={carouselRef}
                  className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory"
                  style={{ scrollBehavior: "smooth", minHeight: "320px" }}
                >
                  {featured.map((product, idx) => (
                    <div
                      key={product.id}
                      className="min-w-full snap-center"
                      style={{ display: "block" }}
                    >
                      <ProductCardHero product={product} />
                    </div>
                  ))}
                </div>
                {/* Indicadores */}
                <div className="flex justify-center mt-4">
                  {featured.map((_, idx) => (
                    <button
                      key={idx}
                      className={`h-2 w-2 mx-1 rounded-full ${
                        current === idx ? "bg-violet-500" : "bg-gray-300"
                      }`}
                      onClick={() => {
                        setCurrent(idx);
                        if (carouselRef.current) {
                          carouselRef.current.scrollTo({
                            left: idx * carouselRef.current.offsetWidth,
                            behavior: "smooth",
                          });
                        }
                      }}
                      aria-label={`Ir al producto ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featured.map((product) => (
                  <ProductCardHero key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BestProducts;
