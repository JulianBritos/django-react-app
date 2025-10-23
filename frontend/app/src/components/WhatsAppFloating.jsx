import React from "react";

const WhatsAppFloating = ({ link }) => {
  const waLink = link || import.meta.env.VITE_WPP_LINK || "https://wa.me/123456789";
  return (
    <a
      href={waLink}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Abrir WhatsApp"
      className="block sm:hidden fixed right-4 bottom-6 z-50 w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg flex items-center justify-center transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400"
    >
      {/* WhatsApp SVG icon (sencillo, inline para evitar cargas externas) */}
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M20.52 3.478A11.837 11.837 0 0012.002.5C6.01.5 1.176 5.33 1.176 11.33c0 1.992.52 3.93 1.51 5.635L.5 23.5l6.776-1.77A11.82 11.82 0 0012.002 22c6 0 10.82-4.834 10.82-10.67 0-2.856-1.1-5.53-2.3-7.852zM12 20.27c-1.49 0-2.94-.4-4.2-1.16l-.3-.18-4.02 1.06 1.08-3.92-.2-.32A8.86 8.86 0 013.18 11.33c0-4.93 4-8.93 8.82-8.93 2.36 0 4.58.92 6.25 2.6a8.8 8.8 0 012.57 6.33c0 4.92-4 8.93-8.82 8.93z"/>
        <path d="M17.14 14.06c-.28-.14-1.66-.82-1.92-.91-.26-.09-.45-.14-.64.14-.19.28-.74.91-.91 1.1-.17.19-.33.21-.61.07-.28-.14-1.18-.44-2.24-1.37-.83-.74-1.39-1.66-1.55-1.94-.16-.28-.02-.43.12-.57.12-.12.28-.31.41-.46.14-.16.19-.28.28-.47.09-.19.05-.36-.02-.5-.07-.14-.64-1.54-.88-2.12-.23-.56-.47-.48-.64-.48-.17 0-.36-.01-.55-.01-.19 0-.5.07-.76.36-.26.29-.99.97-.99 2.36 0 1.4 1.02 2.76 1.16 2.95.14.19 2.01 3.06 4.86 4.29 2.82 1.22 2.82.84 3.33.79.51-.05 1.66-.67 1.9-1.32.23-.65.23-1.2.16-1.32-.07-.12-.26-.19-.54-.33z"/>
      </svg>
    </a>
  );
};

export default WhatsAppFloating;