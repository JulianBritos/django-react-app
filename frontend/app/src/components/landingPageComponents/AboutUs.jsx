import { Truck, LucideHandshake, Headset } from "lucide-react";

const AboutUs = () => {
  return (
    <section className="py-5 text-center w-full max-w-7xl mx-auto mt-6 p-6 rounded-2xl flex flex-col">
      <h2 className="text-3xl font-bold mb-6">Sobre nosotros</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-7 flex flex-col items-center text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-primary-300 shadow-md shadow-primary-400 rounded-full m-2">
            <LucideHandshake size={30} />
          </div>
          <h3 className="font-semibold">El mejor asesoramiento</h3>
          <p className="text-gray-500">
            La mayor variedad de productos. Avalados por profesionales
          </p>
        </div>
        <div className="p-7 flex flex-col items-center text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-primary-300 rounded-full m-2">
            <Truck size={30} />
          </div>
          <h3 className="font-semibold">Envíos en tiempo record</h3>
          <p className="text-gray-500">
            Compras por encima de $20.000 tienen envío gratis.
          </p>
        </div>
        <div className="p-7 flex flex-col items-center text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-primary-300 rounded-full m-2">
            <Headset size={30} />
          </div>
          <h3 className="font-semibold">Soporte 24/7</h3>
          <p className="text-gray-500">
            Estamos para ayudarte en cualquier momento.
          </p>
        </div>
      </div>
    </section>
  );
};
export default AboutUs;
