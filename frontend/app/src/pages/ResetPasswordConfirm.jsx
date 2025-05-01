import React from "react";
import { Navigate, useParams } from "react-router-dom";
import { useState } from "react";
import { connect } from "react-redux";
import { resetPasswordConfirm } from "../reducer/Actions";

const ResetPasswordConfirm = ({ resetPasswordConfirm }) => {
  const [status, setStatus] = useState(false);
  const { uid, token } = useParams();
  const [formData, setFormData] = useState({
    new_password1: "",
    new_password2: "",
  });
  const { new_password1, new_password2 } = formData;
  const handleInput = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = (e) => {
    e.preventDefault();
    resetPasswordConfirm(new_password1, new_password2, uid, token);
    setStatus(true);
  };
  if (status) {
    return <Navigate to={"../login/"}></Navigate>;
  }
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white shadow-md rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center mb-6">
          Nueva contraseña
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Nueva contraseña</label>
            <input
              type="password"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
              name="new_password1"
              value={new_password1}
              onChange={handleInput}
              placeholder="Ingresa tu nueva contraseña"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">
              Confirmar nueva contraseña
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
              name="new_password2"
              value={new_password2}
              onChange={handleInput}
              placeholder="Confirma tu nueva contraseña"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200 disabled:opacity-50"
          >
            Reestablecer contraseña
          </button>
        </form>
      </div>
    </div>
  );
};

export default connect(null, { resetPasswordConfirm })(ResetPasswordConfirm);
