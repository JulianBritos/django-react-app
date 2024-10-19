import { useState } from "react";
import axios from "axios";

function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8000/api/v1/register/", {
        username,
        password,
      });
      alert("User registered successfully");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <div className="text-black">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
        />
      </div>
      <div className="text-black">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
      </div>
      <button className="mt-4 bg-indigo-600 px-3 pl-2 rounded-lg" type="submit">
        Register
      </button>
    </form>
  );
}

export default RegisterPage;
