import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import FirstDraft from "./FirstDraft.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <FirstDraft />
  </StrictMode>
);
