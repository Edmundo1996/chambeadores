import React from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";

function ContenidoA() {
  return (
    <>
      <Link className="btn btn-primary" to="/agregar">
        Agregar
      </Link>
      &nbsp;
      <Link className="btn btn-secondary" to="/modificar">
        Modificar
      </Link>
      &nbsp;
      <Link className="btn btn-success" to="/consultar">
        Consultar
      </Link>
      &nbsp;
      <Link className="btn btn-warning" to="/eliminar">
        Eliminar
      </Link>
    </>
  );
}

export default ContenidoA;
