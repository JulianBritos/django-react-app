import React, { useState, useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const MAX_VISIBLE_BRANCHES = 5; // Número máximo de sucursales visibles antes de usar menú desplegable

const BranchMap = ({ branches }) => {
  const [selectedBranch, setSelectedBranch] = useState(branches[0]);
  const [showDropdown, setShowDropdown] = useState(branches.length > MAX_VISIBLE_BRANCHES);
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);

  useEffect(() => {
    if (map.current) return;
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      center: selectedBranch.position,
      zoom: 15,
    });
    marker.current = new maplibregl.Marker()
      .setLngLat(selectedBranch.position)
      .addTo(map.current);
  }, []);

  useEffect(() => {
    if (!map.current) return;
    map.current.flyTo({ center: selectedBranch.position, zoom: 15 });
    marker.current.setLngLat(selectedBranch.position);
  }, [selectedBranch]);

  const handleBranchSelect = (branch) => {
    setSelectedBranch(branch);
  };

  // Abrir Google Maps para navegación hacia la sucursal seleccionada
  const openGoogleMaps = () => {
    const [lon, lat] = selectedBranch.position;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
    window.open(url, "_blank");
  };

  return (
    <div className="w-full flex flex-col md:flex-row gap-8">
      {/* Lista de direcciones estilo ContactInfo */}
      <div className="flex-1 p-6 flex flex-col">
        <h2 className="text-lg font-bold text-secondary-950 mb-4 text-left">
          {branches.length > 1 ? "Sucursales" : "Dirección"}
        </h2>
        {branches.length === 1 ? (
          <div className="text-gray-700 text-lg">
            {branches[0].address}
          </div>
        ) : (
          branches.length > 6 ? (
            <div className="mt-8 max-h-[420px] overflow-y-auto pr-2">
              <ul className="text-gray-700 list-disc pl-4">
                {branches.map((branch) => (
                  <li
                    key={branch.id}
                    className={`cursor-pointer py-2 px-2 rounded-md transition font-medium ${selectedBranch.id === branch.id ? 'text-primary-700 bg-primary-100' : 'hover:text-primary-700'}`}
                    onClick={() => handleBranchSelect(branch)}
                  >
                    <span>{branch.name} - {branch.address}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <ul className="text-gray-700 list-disc pl-4">
              {branches.map((branch) => (
                <li
                  key={branch.id}
                  className={`cursor-pointer py-2 px-2 rounded-md transition font-medium ${selectedBranch.id === branch.id ? 'text-primary-700 bg-primary-100' : 'hover:text-primary-700'}`}
                  onClick={() => handleBranchSelect(branch)}
                >
                  <span>{branch.name} - {branch.address}</span>
                </li>
              ))}
            </ul>
          )
        )}
      </div>
      {/* Card del mapa */}
      <div className="flex-1 bg-white rounded-xl shadow-2xl border border-gray-100 p-6 flex flex-col min-w-[260px] max-w-2xl">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          Ubicación de la sucursal
        </h2>
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
    </div>
  );
};

export default BranchMap;
