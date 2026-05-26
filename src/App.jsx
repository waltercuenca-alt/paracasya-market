import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import AdminPage from "./pages/AdminPage";
import CajaPage from "./pages/CajaPage";
import ClientePage from "./pages/ClientePage";
import LandingPage from "./pages/LandingPage";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/cliente" element={<ClientePage />} />
        <Route path="/caja" element={<CajaPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Route>
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  );
}

export default App;
