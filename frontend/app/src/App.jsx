import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <h1>test title</h1>
        <input type="text" placeholder="test box" />
        <input type="text" placeholder="test box 2" />
        <button>test add record</button>
      </div>
    </>
  );
}

export default App;
