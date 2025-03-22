import HeroSection from "../components/HeroSection";
import Categories from "../components/CategorysSection";
import AboutUs from "../components/AboutUs";
import Testimonials from "../components/Testimonials";
import BestProducts from "../components/BestProducts";
import ContactForm from "../components/ContactForm";

const HomePage = () => {
  return (
    <div className="">
      <div className="py-4 ">
        <div className="m-4">
          <HeroSection />
        </div>
      </div>
      <div className="py-4 ">
        <div className="m-4">
          <BestProducts />
        </div>
      </div>
      <div className="py-4">
        <div className="m-4">
          <Categories />
        </div>
      </div>
      <div className="py-4  ">
        <div className="m-4">
          <AboutUs />
        </div>
      </div>
      <div className="py-4 ">
        <div className="m-4">
          <Testimonials />
        </div>
      </div>
      <div className="py-4 ">
        <div className="m-4">
          <ContactForm />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
