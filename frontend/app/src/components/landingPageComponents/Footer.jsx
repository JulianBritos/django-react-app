import { Facebook, Instagram, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="text-gray-800 py-10 mt-4">
      <div className="container mx-auto px-6 lg:px-20 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sección Izquierda */}
        <div className="flex flex-col items-start">
          <h2 className="text-xl font-semibold">COSMO PLAY</h2>
          <p className="text-gray-600 mt-2">
            We help you find your dream plant
          </p>
          <div className="flex space-x-4 mt-4">
            <a
              href="#"
              className="text-gray-800 p-2 bg-white rounded-full shadow-md hover:bg-gray-200"
            >
              <Facebook size={18} />
            </a>
            <a
              href="#"
              className="text-gray-800 p-2 bg-white rounded-full shadow-md hover:bg-gray-200"
            >
              <Instagram size={18} />
            </a>
            <a
              href="#"
              className="text-gray-800 p-2 bg-white rounded-full shadow-md hover:bg-gray-200"
            >
              <Twitter size={18} />
            </a>
          </div>
        </div>

        {/* Sección Central - Movida a la derecha */}
        <div className="grid grid-cols-3 gap-8 text-gray-600 md:col-span-2 md:justify-self-end">
          <div>
            <h3 className="font-semibold text-gray-900">Information</h3>
            <ul className="mt-2 space-y-2">
              <li>
                <a href="#" className="hover:text-gray-900">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900">
                  Product
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900">
                  Blog
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Company</h3>
            <ul className="mt-2 space-y-2">
              <li>
                <a href="#" className="hover:text-gray-900">
                  Community
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900">
                  Career
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900">
                  Our story
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Contact</h3>
            <ul className="mt-2 space-y-2">
              <li>
                <a href="#" className="hover:text-gray-900">
                  Getting Started
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-900">
                  Resources
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Sección Inferior */}
      <div className="text-center mt-6 text-gray-600">
        <p>
          2023 all Right Reserved Term of use{" "}
          <span className="font-semibold">COSMO PLAY</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
