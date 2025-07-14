import React, { useState, useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// Sucursales con latitud, longitud (lng, lat invertidos respecto a Leaflet)
const branches = [
  {
    id: "sucursal1",
    name: "Sucursal Centro",
    position: [-58.3816, -34.6037],
  },
  {
    id: "sucursal2",
    name: "Sucursal Norte",
    position: [-58.485, -34.509],
  },
  {
    id: "sucursal3",
    name: "Sucursal Oeste",
    position: [-58.6145, -34.6412],
  },
];

const BranchMap = () => {
  const [selectedBranch, setSelectedBranch] = useState(branches[0]);
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);

  // Inicializamos mapa y marcador solo una vez
  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json", // estilo Carto Positron (sin API key)
      center: selectedBranch.position,
      zoom: 15,
    });

    marker.current = new maplibregl.Marker()
      .setLngLat(selectedBranch.position)
      .addTo(map.current);
  }, []);

  // Actualizamos el mapa y marcador cuando cambia la sucursal
  useEffect(() => {
    if (!map.current) return;

    map.current.flyTo({ center: selectedBranch.position, zoom: 15 });
    marker.current.setLngLat(selectedBranch.position);
  }, [selectedBranch]);

  // Cambiar sucursal seleccionada
  const handleChange = (e) => {
    const branch = branches.find((b) => b.id === e.target.value);
    setSelectedBranch(branch);
  };

  // Abrir Google Maps para navegación hacia la sucursal seleccionada
  const openGoogleMaps = () => {
    const [lon, lat] = selectedBranch.position;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
    window.open(url, "_blank");
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6 bg-white rounded-xl shadow-2xl border border-gray-100">
      <h2 className="text-2xl font-semibold mb-4 text-center">
        Ubicación de nuestras sucursal
      </h2>

      <select
        className="w-full p-3 mb-4 border border-gray-300 rounded-md text-lg"
        value={selectedBranch.id}
        onChange={handleChange}
      >
        {branches.map((branch) => (
          <option key={branch.id} value={branch.id}>
            {branch.name}
          </option>
        ))}
      </select>

      <div
        ref={mapContainer}
        style={{ height: "400px", width: "100%", borderRadius: "1rem", overflow: "hidden" }}
      />

      <button
        onClick={openGoogleMaps}
        className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-md text-lg font-semibold transition"
      >
        Ver ruta en Google Maps
      </button>
    </div>
  );
};

export default BranchMap;
