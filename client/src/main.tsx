import { createRoot } from "react-dom/client";
import App from "./App";
import { PrintProvider } from "@/context/print-context";
import "./index.css";
import "./print.css";

createRoot(document.getElementById("root")!).render(
  <PrintProvider>
    <App />
  </PrintProvider>
);
