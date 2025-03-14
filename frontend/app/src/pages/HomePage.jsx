import HeroSection from "../components/HeroSection";
import Categories from "../components/CategorysSection";
import AboutUs from "../components/AboutUs";
import BestProducts from "../components/BestProducts";

const HomePage = () => {
  return (
    <div className="">
      <div className="py-4 ">
        <div className="m-4">
          <HeroSection />
        </div>
      </div>
      <div className="py-4 bg-purple-50">
        <div className="m-4">
          <BestProducts />
        </div>
      </div>
      <div className="py-4 ">
        <div className="m-4">
          <AboutUs />
        </div>
      </div>
      <div className="py-4 bg-purple-50">
        <div className="m-4">
          <Categories />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
