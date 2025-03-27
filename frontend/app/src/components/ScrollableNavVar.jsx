import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ScrollableNavbar = ({ categories }) => {
  const scrollRef = useRef(null);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const navigate = useNavigate();

  const checkScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollWidth, clientWidth } = scrollRef.current;
      setShowScrollButtons(scrollWidth > clientWidth);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    window.addEventListener("resize", checkScrollButtons);
    return () => window.removeEventListener("resize", checkScrollButtons);
  }, [categories]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.25;
      const start = scrollLeft;
      const end =
        direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
      const duration = 800;
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

  const handleCategoryClick = (category) => {
    navigate(`/products/${category.name}`);
  };

  return (
    <div className="relative w-full bg-white flex items-center px-4 py-2">
      {showScrollButtons && (
        <button
          className="hidden md:flex bg-gray-200 p-1 rounded-full z-10 transition-transform transform hover:scale-150 duration-300"
          onClick={() => scroll("left")}
        >
          <ChevronLeft className="w-6 h-6 text-gray-600" />
        </button>
      )}

      <div
        ref={scrollRef}
        className={`flex overflow-x-auto scrollbar-hide px-4 w-full items-center ${
          showScrollButtons ? "justify-start space-x-8" : "justify-center space-x-6"
        }`}
        style={{
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {categories.map((category, index) => (
          <button
            key={index}
            className="flex-shrink-0 px-4 py-2 text-gray-800 hover:text-gray-600 transition whitespace-nowrap"
            onClick={() => handleCategoryClick(category)}
          >
            {category.name}
          </button>
        ))}
      </div>

      {showScrollButtons && (
        <button
          className="hidden md:flex bg-gray-200 p-1 rounded-full z-10 transition-transform transform hover:scale-150 duration-300"
          onClick={() => scroll("right")}
        >
          <ChevronRight className="w-6 h-6 text-gray-600" />
        </button>
      )}
    </div>
  );
};

export default ScrollableNavbar;