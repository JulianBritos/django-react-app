import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const DescriptionField = ({ description, onChange }) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-lg">
      <label className="block text-2xl font-bold mb-1">Descripción*</label>
      <ReactQuill
        theme="snow"
        value={description}
        onChange={onChange}
        className="rounded-lg border border-gray-300 overflow-hidden"
        style={{
          height: '200px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
        placeholder="Escribe la descripción del producto..."
      />
    </div>
  );
};

export default DescriptionField;

