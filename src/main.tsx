import { createRoot } from "react-dom/client";
import App from "./AppRoot";
import "./index.css";

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}
