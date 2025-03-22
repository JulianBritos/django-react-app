import { useState } from "react";

const HeroSection = () => {
  const [showMore, setShowMore] = useState(false);

  return (
    <section className="w-full max-w-7xl mx-auto shadow-xl mt-6 p-6 bg-gradient-to-r from-blue-400 to-purple-300 text-black rounded-2xl flex flex-col lg:flex-row  items-center justify-center text-center lg:text-left">
      <div className="max-w-3xl">
        <h1 className="text-4xl text-blue-950 lg:text-6xl font-bold leading-tight mb-4">
          Cosmo Play
        </h1>
        <p className="text-lg text-blue-900 lg:text-xl mb-6">
          Juegos y juguetes diseñados para estimular, relajar y acompañar a
          personas con TDAH, TEA y ansiedad. Herramientas ideales para
          profesionales de la salud y familias.
        </p>
        <div className="flex justify-center lg:justify-start gap-4">
          <a
            href="/products"
            className="bg-white text-blue-600 font-semibold py-3 px-6 rounded-lg shadow-xl hover:bg-blue-100 transition"
          >
            Ver productos
          </a>
          <button
            onClick={() => setShowMore(!showMore)}
            className="bg-transparent border border-white text-white font-semibold py-3 px-6 rounded-lg shadow-xl hover:bg-white hover:text-blue-600 transition"
          >
            {showMore ? "Ver menos" : "Conocé más"}
          </button>
        </div>

        {/* Sección expandible */}
        {showMore && (
          <div className="mt-6 p-4 bg-transparent text-white">
            <h2 className="text-xl font-bold mb-2">Nuestra misión</h2>
            <p className="text-sm leading-relaxed">
              Somos Julian, Pablo y Andrina, un grupo de profesionales de
              distintas áreas que decidimos unir fuerzas para crear{" "}
              <strong>Cosmo Play</strong>. Nuestro objetivo es diseñar y ofrecer
              juegos y juguetes que acompañen el desarrollo, la relajación y el
              tratamiento de personas con TDAH, TEA y ansiedad.
            </p>
            <p className="text-sm leading-relaxed mt-2">
              Nos motiva facilitar el acceso a estos recursos a familias,
              profesionales de la salud y centros educativos.
            </p>
            <p className="text-sm leading-relaxed mt-2">
              Creemos en el <strong>juego como herramienta terapéutica</strong>{" "}
              y como puente para conectar, aprender y crecer. Queremos ser un
              nexo entre las familias, los profesionales y las soluciones que
              realmente marcan la diferencia.
            </p>
          </div>
        )}
      </div>

      <div className="mt-8 lg:mt-0 lg:ml-12">
        <img
          src="https://source.unsplash.com/400x400/?toys"
          alt="Cosmo Play Toys"
          className="w-64 h-64 object-cover rounded-lg shadow-lg"
        />
      </div>
    </section>
  );
};

export default HeroSection;
