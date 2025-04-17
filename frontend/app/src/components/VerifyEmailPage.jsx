import React, { useState, useEffect } from "react";
import axios from "axios";

const VerifyEmailPage = ({ email }) => {
  const [code, setCode] = useState("");
  const [timer, setTimer] = useState(120); // 2 minutes countdown
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async () => {
    try {
      const response = await axios.post("/api/users/verify-email/", {
        email,
        code,
      });
      alert(response.data.message);
      window.location.href = "/login";
    } catch (err) {
      setError(err.response?.data?.error || "Error al verificar el código.");
      setAttempts((prev) => prev + 1);
    }
  };

  const handleResend = async () => {
    try {
      const response = await axios.post("/api/users/resend-code/", { email });
      alert(response.data.message);
      setTimer(120); // Reset timer
      setError("");
      setAttempts(0);
    } catch (err) {
      setError(err.response?.data?.error || "Error al reenviar el código.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Verificar Email</h2>
        <p className="mb-4">
          Hemos enviado un código de verificación a {email}. Por favor,
          ingrésalo a continuación.
        </p>

        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Código de 6 dígitos"
          className="w-full p-2 border rounded mb-4"
        />

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Verificar
        </button>

        <div className="flex justify-between items-center mt-4">
          <button
            onClick={handleResend}
            className="text-blue-500 hover:underline"
            disabled={timer > 0}
          >
            Reenviar código
          </button>
          <span className="text-gray-500">
            {timer > 0 ? `Reenviar en ${timer}s` : "Puedes reenviar el código."}
          </span>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
