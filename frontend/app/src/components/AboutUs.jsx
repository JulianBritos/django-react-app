import { Truck, LucideHandshake, Headset } from "lucide-react";

const AboutUs = () => {
  return (
    <section className="py-5 text-center">
      <h2 className="text-3xl font-bold mb-6">About us</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-7 flex flex-col items-center text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-purple-300 rounded-full m-2">
            <LucideHandshake size={30} />
          </div>
          <h3 className="font-semibold">Large Assortment</h3>
          <p className="text-gray-500">
            We offer many different types of products.
          </p>
        </div>
        <div className="p-7 flex flex-col items-center text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-purple-300 rounded-full m-2">
            <Truck size={30} />
          </div>
          <h3 className="font-semibold">Fast & Free Shipping</h3>
          <p className="text-gray-500">Orders over $50 get free shipping.</p>
        </div>
        <div className="p-7 flex flex-col items-center text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-purple-300 rounded-full m-2">
            <Headset size={30} />
          </div>
          <h3 className="font-semibold">24/7 Support</h3>
          <p className="text-gray-500">We are here to help you anytime.</p>
        </div>
      </div>
    </section>
  );
};
export default AboutUs;
