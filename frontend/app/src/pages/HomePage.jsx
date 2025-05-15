import HeroSection from "../components/landingPageComponents/HeroSection";
import Categories from "../components/landingPageComponents/CategorysSection";
import AboutUs from "../components/landingPageComponents/AboutUs";
import Testimonials from "../components/landingPageComponents/Testimonials";
import BestProducts from "../components/landingPageComponents/BestProducts";
import ContactForm from "../components/landingPageComponents/ContactForm";

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
