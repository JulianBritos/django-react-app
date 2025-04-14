const DescriptionField = ({ description, onChange }) => {
    return (
      <div>
        <label className="block text-sm font-medium mb-1">Descripción*</label>
        <textarea
          name="description"
          rows={3}
          value={description}
          onChange={onChange}
          className="w-full p-2 border rounded"
        />
      </div>
    );
  };
  
  export default DescriptionField;
  