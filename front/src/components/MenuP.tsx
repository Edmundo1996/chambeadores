import React from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function MenuP() {
  const { usuario, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="mb-3">
      <Container>
        <Navbar.Brand>Sistema de Alumnos</Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">
              Inicio
            </Nav.Link>
            <Nav.Link as={Link} to="/consultar">
              Consultar
            </Nav.Link>
            <Nav.Link as={Link} to="/agregar">
              Agregar
            </Nav.Link>
            <Nav.Link as={Link} to="/modificar">
              Modificar
            </Nav.Link>
            <Nav.Link as={Link} to="/eliminar">
              Eliminar
            </Nav.Link>
            <Nav.Link as={Link} to="/mensajes">
              📨 Mensajes
            </Nav.Link>
          </Nav>

          <Nav>
            <Navbar.Text className="me-3">
              Bienvenido, {usuario?.nombre} {usuario?.aPaterno}
            </Navbar.Text>
            <Button variant="outline-light" size="sm" onClick={handleLogout}>
              Cerrar Sesión
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default MenuP;
