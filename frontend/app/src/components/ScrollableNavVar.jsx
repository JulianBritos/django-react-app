import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/Button";

const ScrollableNavbar = ({ categories, onCategoryClick }) => {
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
      const duration = 400;
      const startTime = performance.now();

      const animateScroll = (currentTime) => {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        // easeInOut
        const eased = 0.5 - Math.cos(progress * Math.PI) / 2;
        scrollRef.current.scrollLeft = start + (end - start) * eased;
        if (progress < 1) {
          requestAnimationFrame(animateScroll);
        }
      };

      requestAnimationFrame(animateScroll);
    }
  };

  const handleCategoryClick = (category) => {
    if (typeof onCategoryClick === "function") {
      onCategoryClick(category.name ?? category);
    } else {
      navigate(`/products/${category.name}`);
    }
  };

  // Hint animation: desplaza ligeramente para indicar que es scrolleable
  useEffect(() => {
    let mounted = true;
    let rafId;
    const animateScrollTo = (from, to, duration) =>
      new Promise((resolve) => {
        const start = performance.now();
        const step = (now) => {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 0.5 - Math.cos(progress * Math.PI) / 2;
          if (scrollRef.current) {
            scrollRef.current.scrollLeft = from + (to - from) * eased;
          }
          if (progress < 1 && mounted) {
            rafId = requestAnimationFrame(step);
          } else {
            resolve();
          }
        };
        rafId = requestAnimationFrame(step);
      });

    const hintScroll = async () => {
      if (!scrollRef.current) return;
      const { scrollWidth, clientWidth } = scrollRef.current;
      const maxScroll = scrollWidth - clientWidth;
      if (maxScroll <= 0) return;
      const original = scrollRef.current.scrollLeft;
      const hintDistance = Math.min(maxScroll, clientWidth * 0.25);
      try {
        await animateScrollTo(original, original + hintDistance, 600);
        await new Promise((r) => setTimeout(r, 300));
        await animateScrollTo(original + hintDistance, original, 600);
      } catch (e) {
        // ignora si se desmonta
      }
    };

    if (showScrollButtons) {
      // Esperar un tick para que el layout termine de estabilizarse
      const id = setTimeout(() => {
        hintScroll();
      }, 300);
      return () => {
        mounted = false;
        clearTimeout(id);
        if (rafId) cancelAnimationFrame(rafId);
      };
    }
    return () => {
      mounted = false;
    };
  }, [showScrollButtons, categories]);

  return (
    <div className="relative w-full bg-white flex items-center px-4 py-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => scroll("left")}
        className="hidden sm:flex absolute left-0 top-1/2 transform -translate-y-1/2 bg-white shadow-md rounded-full p-2 ml-2"
        aria-hidden={!showScrollButtons}
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
        {categories
          .filter((category) => category.parent_id === null)
          .map((category, index) => (
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
        className="hidden sm:flex absolute right-0 top-1/2 transform -translate-y-1/2 bg-white shadow-md rounded-full p-2 mr-2"
        aria-hidden={!showScrollButtons}
      >
        <ChevronRight className="w-6 h-6 text-gray-600" />
      </Button>
    </div>
  );
};

export default ScrollableNavbar;
