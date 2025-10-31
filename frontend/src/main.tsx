import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.tsx";
import { LoansProvider } from "./context/LoansContext.tsx";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <LoansProvider>
        <App />
        </LoansProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
