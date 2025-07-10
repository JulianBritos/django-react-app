import React, { useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { connect } from "react-redux";
import { emailVerification } from "../../reducer/Actions";
import { Button } from "../ui/Button";

const EmailVerification = ({ emailVerification }) => {
  const [status, setStatus] = useState(false);
  const { key } = useParams();
  const [loading, setLoading] = useState(false);

  const handleVerify = (e) => {
    e.preventDefault();
    setLoading(true);
    emailVerification(key);
    setStatus(true);
  };

  if (status) {
    return <Navigate to="../login/" />;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white shadow-md rounded-2xl p-6 w-full max-w-md text-center">
        <h2 className="text-2xl font-semibold mb-4">Verificación de correo</h2>
        <p className="mb-6">Haz clic en el botón para verificar tu cuenta.</p>
        <form onSubmit={handleVerify}>
          <Button
            variant="primary"
            onClick={handleVerify}
            disabled={loading}
            isLoading={loading}
          >
            {loading ? "Verificando..." : "Verificar"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default connect(null, { emailVerification })(EmailVerification);
