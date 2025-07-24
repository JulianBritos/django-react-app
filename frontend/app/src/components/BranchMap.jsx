import React, { useState, useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const BREAKPOINT = 480;

const BranchMap = ({ branches }) => {
  const [selectedBranch, setSelectedBranch] = useState(branches[0]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= BREAKPOINT);
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= BREAKPOINT);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const openGoogleMaps = () => {
    const [lon, lat] = selectedBranch.position;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
    window.open(url, "_blank");
  };

  return (
    <div className="w-full flex flex-col md:flex-row gap-8">
      {/* Lista de sucursales solo en escritorio */}
      {!isMobile && (
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
      )}
      {/* Card del mapa y menú desplegable en móvil */}
      <div className="flex-1 bg-white rounded-xl shadow-2xl border border-gray-100 p-6 flex flex-col min-w-[260px] max-w-2xl">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          Ubicación de la sucursal
        </h2>
        {isMobile && branches.length > 1 && (
          <div className="mb-4">
            <label htmlFor="branch-select" className="block text-gray-700 font-medium mb-2">
              Haz click abajo para seleccionar una sucursal
            </label>
            <select
              id="branch-select"
              value={selectedBranch.id}
              onChange={(e) => {
                const branch = branches.find(b => b.id === e.target.value);
                if (branch) handleBranchSelect(branch);
              }}
              className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
            >
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name} - {branch.address}
                </option>
              ))}
            </select>
          </div>
        )}
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
