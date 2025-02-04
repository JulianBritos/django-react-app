import React from "react";

const Hero = () => {
  return (
    <section className="relative bg-gray-900">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl">
            Bienvenido a Nuestra Aplicación
          </h1>
          <p className="mt-4 text-lg text-gray-300 sm:mt-6">
            Soluciones efectivas para tus necesidades empresariales.
          </p>
          <div className="mt-8 flex justify-center">
            <a
              href="#"
              className="inline-block rounded-md bg-indigo-600 px-6 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              Comienza Ahora
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
