import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:8000/api/token/", {
        username: username,
        password: password,
      });

      const { access, refresh } = response.data;

      // Guardar los tokens en el almacenamiento local (localStorage)
      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);

      // Redirigir al usuario a la página de tareas o dashboard
      navigate("/tasks");
    } catch (error) {
      setError("Invalid username or password.");
      console.error("Error during login", error);
    }
  };

  const handleRegisterRedirect = () => {
    // Redirigir a la página de registro
    navigate("/register");
  };

  return (
    <div className="login-page">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Username:</label>
          <input
            className="bg-transparent rounded-md shadow-sm ring-1 ring-inset ring-white-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            className="bg-transparent rounded-md shadow-sm ring-1 ring-inset ring-white-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button
          className="mt-4 mr-10 text-black bg-indigo-500 px-3 pl-2 rounded-lg "
          type="submit"
        >
          Login
        </button>
        <button
          className="mt-4 mr-10 text-black bg-gray-300 px-3 pl-2 rounded-lg "
          type="button" // Cambiado a "button" para evitar enviar el formulario
          onClick={handleRegisterRedirect}
        >
          Register
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
