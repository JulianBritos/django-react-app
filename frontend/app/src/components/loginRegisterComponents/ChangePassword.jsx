import React, { useState } from "react";
import toast from "react-hot-toast";
import { Navigate } from "react-router-dom";
import { connect } from "react-redux";
import { changePassword } from "../../reducer/Actions";

const ChangePassword = ({ isAuthenticated, changePassword }) => {
  const [formData, setFormData] = useState({
    new_password1: "",
    new_password2: "",
    old_password: "",
  });
  const { new_password1, new_password2, old_password } = formData;

  const handlingInput = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handlingSubmit = (e) => {
    e.preventDefault();
    changePassword(new_password1, new_password2, old_password);
  };

  if (!isAuthenticated && !localStorage.getItem("access")) {
    return <Navigate to={"../login"} />;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-3xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-semibold text-center mb-8">
          Cambiar Contraseña
        </h2>
        <form className="mb-4" onSubmit={handlingSubmit}>
          <div className="mb-4">
            <label htmlFor="new_password1" className="text-lg text-gray-700">
              Nueva Contraseña
            </label>
            <input
              name="new_password1"
              value={new_password1}
              onChange={handlingInput}
              type="password"
              className="w-full px-6 py-3 mt-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-800 placeholder-gray-400"
              id="new_password1"
              placeholder="Nueva contraseña"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="new_password2" className="text-lg text-gray-700">
              Confirmar Nueva Contraseña
            </label>
            <input
              name="new_password2"
              value={new_password2}
              onChange={handlingInput}
              type="password"
              className="w-full px-6 py-3 mt-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-800 placeholder-gray-400"
              id="new_password2"
              placeholder="Repetir nueva contraseña"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="old_password" className="text-lg text-gray-700">
              Contraseña Actual
            </label>
            <input
              name="old_password"
              value={old_password}
              onChange={handlingInput}
              type="password"
              className="w-full px-6 py-3 mt-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-800 placeholder-gray-400"
              id="old_password"
              placeholder="Contraseña actual"
            />
          </div>
          <div className="d-grid gap-4">
            <button
              type="submit"
              className="w-full py-3 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 transition duration-300"
            >
              Cambiar Contraseña
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    isAuthenticated: state.AuthReducer.isAuthenticated,
  };
};

export default connect(mapStateToProps, { changePassword })(ChangePassword);
