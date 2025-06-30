import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./components/Login";
import SecurityDebugPanel from "./components/SecurityDebugPanel";
import { Spinner, Container } from "react-bootstrap";
import {
  AlumnosAgregar,
  AlumnosConsultar,
  AlumnoModificar,
  ContenidoA,
  HomeA,
  AlumnoEliminar,
  Mensajes,
} from "./screens";

// Componente para rutas protegidas
const AppRoutes = () => {
  const { isAuthenticated, loading, login } = useAuth();

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
      </Container>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={login} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeA />}>
          <Route index element={<ContenidoA />} />
          <Route path="agregar" element={<AlumnosAgregar />} />
          <Route path="consultar" element={<AlumnosConsultar />} />
          <Route path="modificar" element={<AlumnoModificar />} />
          <Route path="eliminar" element={<AlumnoEliminar />} />
          <Route path="mensajes" element={<Mensajes />} />
        </Route>
      </Routes>
      {/* Panel de debug de seguridad */}
      <SecurityDebugPanel />
    </BrowserRouter>
  );
};

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </div>
  );
}

export default App;
