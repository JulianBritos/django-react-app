const ContactBanner = () => (
  <div className="relative w-full h-48 md:h-64 flex items-center justify-center mb-8 overflow-hidden shadow-xl bg-gradient-to-r from-secondary-400 to-primary-300">
    <img
      src="/banner-contact.jpg" // Cambia por la ruta de tu imagen
      alt="Banner Contacto"
      className="absolute inset-0 w-full h-full object-cover object-center opacity-60"
    />
    <div className="absolute inset-0 bg-gradient-to-r from-secondary-400/80 to-primary-300/80" />
    <h1 className="relative z-10 text-secondary-950 text-4xl md:text-6xl font-bold drop-shadow-lg tracking-wide text-center">
      Contacto
    </h1>
  </div>
);

export default ContactBanner