import BranchMap from '../components/BranchMap'
import ContactBanner from '../components/ContactBanner'
import ContactForm from '../components/landingPageComponents/ContactForm'
import ContactInfo from '../components/ContactInfo'



const demoBranches = [
  {
    id: "sucursal1",
    name: "Sucursal Centro",
    address: "Av. Siempre Viva 1234, Ciudad, Provincia, CP 1234",
    position: [-58.3816, -34.6037],
  },
  {
    id: "sucursal2",
    name: "Sucursal Norte",
    address: "Calle Falsa 456, Otra Ciudad, Otra Provincia, CP 5678",
    position: [-58.485, -34.509],
  },
  {
    id: "sucursal3",
    name: "Sucursal Oeste",
    address: "Av. Libertad 789, Tercera Ciudad, CP 9101",
    position: [-58.6145, -34.6412],
  },
  {
    id: "sucursal4",
    name: "Sucursal Sur",
    address: "Calle Sur 321, Cuarta Ciudad, CP 4321",
    position: [-58.4000, -34.7000],
  },
  {
    id: "sucursal5",
    name: "Sucursal Este",
    address: "Av. Este 654, Quinta Ciudad, CP 8765",
    position: [-58.3000, -34.5000],
  },
  {
    id: "sucursal6",
    name: "Sucursal Extra",
    address: "Calle Extra 999, Sexta Ciudad, CP 9999",
    position: [-58.2000, -34.8000],
  },
  {
    id: "sucursal7",
    name: "Sucursal Patagonia",
    address: "Ruta 40 km 123, Patagonia, CP 1111",
    position: [-68.3000, -41.5000],
  },
  {
    id: "sucursal8",
    name: "Sucursal Córdoba",
    address: "Av. Sabattini 1000, Córdoba, CP 5000",
    position: [-64.1888, -31.4201],
  },
  {
    id: "sucursal9",
    name: "Sucursal Rosario",
    address: "Bv. Oroño 500, Rosario, CP 2000",
    position: [-60.6505, -32.9500],
  },
  {
    id: "sucursal10",
    name: "Sucursal Mendoza",
    address: "Av. San Martín 800, Mendoza, CP 5500",
    position: [-68.8458, -32.8908],
  },
  {
    id: "sucursal11",
    name: "Sucursal Salta",
    address: "Calle Balcarce 300, Salta, CP 4400",
    position: [-65.4232, -24.7821],
  },
  {
    id: "sucursal12",
    name: "Sucursal Mar del Plata",
    address: "Av. Colón 1500, Mar del Plata, CP 7600",
    position: [-57.5575, -38.0023],
  },
  {
    id: "sucursal13",
    name: "Sucursal La Plata",
    address: "Calle 12 800, La Plata, CP 1900",
    position: [-57.9545, -34.9214],
  },
  {
    id: "sucursal14",
    name: "Sucursal San Juan",
    address: "Av. Libertador 2000, San Juan, CP 5400",
    position: [-68.5364, -31.5375],
  },
  {
    id: "sucursal15",
    name: "Sucursal Tucumán",
    address: "Calle 25 de Mayo 300, Tucumán, CP 4000",
    position: [-65.2093, -26.8241],
  },
];

const ContactPage = () => {
  return (
    <>
      <ContactBanner />
      <div className="max-w-7xl mx-auto w-full px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Mobile: Banner, luego mapa, luego formulario */}
        <div className="md:col-span-2 w-full">
          <BranchMap branches={demoBranches} />
        </div>
        <div className="md:col-span-1 w-full">
          <ContactForm className="w-full" />
        </div>
      </div>
    </>
  )
}

export default ContactPage