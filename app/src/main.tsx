import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { AppProviders } from "./AppProviders";
import { AppRouter } from "./routes/AppRouter";
import "./components/styles/globals.css";
import "./components/styles/experience.css";

createRoot(document.getElementById("root")!).render(
  <AppProviders>
    <HashRouter>
      <AppRouter />
    </HashRouter>
  </AppProviders>,
);
