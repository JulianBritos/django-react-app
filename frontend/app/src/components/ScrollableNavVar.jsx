import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/Button";

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
        direction === "left"
          ? scrollLeft - scrollAmount
          : scrollLeft + scrollAmount;
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
      <Button
        variant="ghost"
        size="icon"
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white shadow-md rounded-full p-2"
      >
        <ChevronLeft className="w-6 h-6 text-gray-600" />
      </Button>

      <div
        ref={scrollRef}
        className={`flex overflow-x-auto scrollbar-hide px-4 w-full items-center ${
          showScrollButtons
            ? "justify-start space-x-8"
            : "justify-center space-x-6"
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

      <Button
        variant="ghost"
        size="icon"
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white shadow-md rounded-full p-2"
      >
        <ChevronRight className="w-6 h-6 text-gray-600" />
      </Button>
    </div>
  );
};

export default ScrollableNavbar;
