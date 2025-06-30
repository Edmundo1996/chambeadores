import axios from "axios";
import React, { useState } from "react";
import {
  Form,
  Button,
  Col,
  Container,
  FloatingLabel,
  InputGroup,
  Row,
  Card,
} from "react-bootstrap";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.css";
import { useNavigate } from "react-router-dom";

type alumnoEstructura = {
  matricula: string;
  aPaterno: string;
  aMaterno: string;
  nombre: string;
  sexo: string;
  dCalle: string;
  dNumero: number;
  dColonia: string;
  dCodigoPostal: number;
  aTelefono: string;
  aCorreo: string;
  aFacebook: string;
  aInstagram: string;
  aTipoSangre: string;
  nombreContacto: string;
  telefonoContacto: string;
  contraseña: string;
};

const initialState: alumnoEstructura = {
  matricula: "",
  aPaterno: "",
  aMaterno: "",
  nombre: "",
  sexo: "",
  dCalle: "",
  dNumero: 0,
  dColonia: "",
  dCodigoPostal: 0,
  aTelefono: "",
  aCorreo: "",
  aFacebook: "",
  aInstagram: "",
  aTipoSangre: "",
  nombreContacto: "",
  telefonoContacto: "",
  contraseña: "",
};

function AlumnoEliminar() {
  const [alumno, setAlumno] = useState(initialState);
  const [mat, setMat] = useState("");
  const [show, setShow] = useState(false);

  const navigate = useNavigate();
  
  const {
    matricula,
    aPaterno,
    aMaterno,
    nombre,
    sexo,
    dCalle,
    dNumero,
    dColonia,
    dCodigoPostal,
    aTelefono,
    aCorreo,
    aFacebook,
    aInstagram,
    aTipoSangre,
    nombreContacto,
    telefonoContacto,
    contraseña,
  } = alumno;

  const alumnoConsultar = async () => {
    const mat1 = mat === "" ? 0 : mat;
    const response = await axios
      .get(`http://localhost:5000/alumno/traer/${mat1}`)
      .then((response) => {
        if (response.data.status === 200) {
          if (response.data.result.length > 0) {
            setAlumno(response.data.result[0]);
            setShow(true);
          } else {
            setAlumno(initialState);
            notify(101);
          }
        } else {
          console.error("Error al consultar el alumno:", response.data.message);
        }
      });
  };

  const handleMatChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    let { value } = e.target;
    setMat(value);
  };

  const handleCancelar = () => {
    setAlumno(initialState);
    setShow(false);
  };

  const handleEliminar = async () => {
    const response = await axios
      .post(`http://localhost:5000/alumno/eliminar`, alumno)
      .then((response) => {
        if (response.data.status === 200) {
          notify(response.data.status);
          setAlumno(initialState);
          setShow(false);
          setMat("");
        } else {
          console.error("Error al eliminar el alumno:", response.data.message);
        }

        setTimeout(() => navigate("/"), 1000);
      });
  };

  const notify = (status: number) => {
    if (status === 200) {
      Swal.fire({
        title: "Completado!",
        text: "Eliminado con éxito",
        icon: "success",
        confirmButtonText: "Cool",
      });
      handleCancelar();
      navigate("/");
    }
    if (status === 100) {
      Swal.fire({
        title: "Error!",
        text: "No se pudo eliminar el alumno",
        icon: "error",
        confirmButtonText: "Inténtalo de nuevo",
      });
    }
    if (status === 101) {
      Swal.fire({
        title: "No pudo!",
        text: "No se encontró el alumno con esa matrícula",
        icon: "error",
        confirmButtonText: "Inténtalo de nuevo",
      });
    }
  };

  return (
    <Container fluid>
      <Row className="mt-3 fs-3">
        <Col>&nbsp;</Col>
        <Col
          style={{
            background: "#e60909",
            borderRadius: 10,
            color: "white",
          }}
        >
          Eliminar Alumno
        </Col>
        <Col>&nbsp;</Col>
      </Row>

      <Row className="mt-3">
        <Col>&nbsp;</Col>
        <Col
          className="pt-4 pb-4"
          style={{
            background: "#e60909",
            borderRadius: 10,
          }}
        >
          <InputGroup>
            <Button
              id="button-addon1"
              onClick={alumnoConsultar}
              style={{ background: "#454545" }}
            >
              Buscar
            </Button>
            <FloatingLabel label="Ingresa la matricula">
              <Form.Control
                name="mat"
                type="text"
                placeholder="Ingresa matricula"
                value={mat}
                onChange={handleMatChange}
              ></Form.Control>
            </FloatingLabel>
          </InputGroup>
        </Col>
        <Col>&nbsp;</Col>
      </Row>

      <Row className="mt-3">
        <Col>&nbsp;</Col>
        <Col style={{ display: "flex", justifyContent: "center" }}>
          {show ? (
            <Card
              style={{
                width: "100%",
                backgroundColor: "#99a1e8",
                color: "white",
              }}
            >
              <Card.Body>
                <Card.Title>
                  Matricula
                  <br />
                  {matricula}
                </Card.Title>
                <Card.Subtitle className="mb-2">
                  Nombre: {nombre} {aPaterno}
                  {aMaterno}
                </Card.Subtitle>
                <Card.Text>
                  Teléfono: {aTelefono}
                  <br />
                  Correo: {aCorreo}
                  <br />
                  Nombre contacto: {nombreContacto}
                  <br />
                  Teléfono contacto: {telefonoContacto}
                  <br />
                </Card.Text>
                <Button variant="danger" onClick={handleEliminar}>
                  Eliminar
                </Button>
                &nbsp;&nbsp;
                <Button variant="success" onClick={handleCancelar}>
                  Cancelar
                </Button>
              </Card.Body>
            </Card>
          ) : (
            <br />
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default AlumnoEliminar;
