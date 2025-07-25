import { FaInstagram, FaFacebook, FaWhatsapp, FaXTwitter } from "react-icons/fa6";

const ContactInfo = (props) => {
  const addresses = props.addresses;
  const social = props.social;
  const hasMultipleAddresses = addresses && addresses.length > 1;
  return (
    <div className="gap-6 p-6 h-full">
      <div>
        <h2 className="text-lg font-bold text-secondary-950 mb-2">
          {hasMultipleAddresses ? "Sucursales" : "Dirección"}
        </h2>
        {hasMultipleAddresses ? (
          <ul className="text-gray-700 list-disc pl-4">
            {addresses.map((addr, idx) => (
              <li key={idx}>{addr}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-700">{addresses && addresses[0]}</p>
        )}
      </div>
      <div className="mt-8">
        <h2 className="text-lg font-bold text-secondary-950 mb-2">Nuestras Redes Sociales</h2>
        <div className="flex gap-4">
          {social && social.instagram && (
            <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-800 font-medium flex items-center gap-1">
              <FaInstagram className="w-10 h-10" /> 
            </a>
          )}
          {social && social.facebook && (
            <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
              <FaFacebook className="w-10 h-10" /> 
            </a>
          )}
          {social && social.whatsapp && (
            <a href={social.whatsapp} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800 font-medium flex items-center gap-1">
              <FaWhatsapp className="w-10 h-10" /> 
            </a>
          )}
          {social && social.x && (
            <a href={social.x} target="_blank" rel="noopener noreferrer" className="text-black hover:text-gray-800 font-medium flex items-center gap-1">
              <FaXTwitter className="w-10 h-10" /> 
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;