import React from "react";
import { Navigate } from "react-router-dom";
import { useState } from "react";
import { connect } from "react-redux";
import { resetPassword } from "../reducer/Actions";
import { Button } from "../components/ui/Button";

const ResetPassword = ({ resetPassword }) => {
  const [status, setStatus] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
  });
  const { email } = formData;
  const handleInput = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = (e) => {
    e.preventDefault();
    resetPassword(email);
    setStatus(true);
  };
  if (status) {
    return <Navigate to={"../"}></Navigate>;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white shadow-md rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center mb-6">
          Recuperar contraseña
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Correo electrónico</label>
            <input
              type="email"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
              value={email}
              name="email"
              placeholder="Ingresa tu correo electrónico"
              onChange={handleInput}
              required
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={loading}
            isLoading={loading}
          >
            {loading ? "Enviando..." : "Enviar Email de Restablecimiento"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default connect(null, { resetPassword })(ResetPassword);
