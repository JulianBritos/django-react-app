import BranchMap from '../components/BranchMap'
import ContactBanner from '../components/ContactBanner'
import ContactForm from '../components/landingPageComponents/ContactForm'



const ContactInfo = () => (
  <div className="flex flex-col gap-6 p-6 h-full justify-center">
    <div>
      <h2 className="text-lg font-bold text-secondary-950 mb-2">Dirección</h2>
      <p className="text-gray-700">Av. Siempre Viva 1234<br />Ciudad, Provincia<br />CP 1234</p>
    </div>
    <div>
      <h2 className="text-lg font-bold text-secondary-950 mb-2">Redes Sociales</h2>
      <div className="flex gap-4">
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-medium">Facebook</a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-800 font-medium">Instagram</a>
        <a href="https://wa.me/5491112345678" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800 font-medium">WhatsApp</a>
      </div>
    </div>
  </div>
);

const ContactPage = () => {
  return (
    <>
      <ContactBanner />
      <div className="max-w-7xl mx-auto w-full px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        <div className="col-span-1 h-full"><ContactForm className="h-full"/></div>
        <div className="col-span-1 h-full"><ContactInfo /></div>
        <div className="col-span-1 h-full"><BranchMap /></div>
      </div>
    </>
  )
}

export default ContactPage