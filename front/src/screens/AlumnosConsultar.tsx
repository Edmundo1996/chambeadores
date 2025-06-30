import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  Button,
  Col,
  Container,
  InputGroup,
  Modal,
  Row,
  Table,
  Form,
} from "react-bootstrap";

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

function AlumnosConsultar() {
  const [alumnos, setAlumnos] = useState<alumnoEstructura[]>([]);
  const [alumno, setAlumno] = useState<alumnoEstructura>(initialState);
  const [show, setShow] = useState(false);
  const [buscar, setBuscar] = useState("");

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
  } = alumno || initialState;

  useEffect(() => {
    traerAlumnos();
  }, []);

  const traerAlumnos = async () => {
    const nombre = buscar === "" ? "_" : buscar;

    const response = await axios
      .get(`http://localhost:5000/alumnos/traer/${nombre}`)
      .then((response) => {
        if (response.data.status === 200) {
          setAlumnos(response.data.result);
        } else {
          console.error("Error al obtener los alumnos:", response.data.message);
          console.log(response);
        }
      });
  };

  const AlumnoConsultar = async (matricula: string) => {
    const response = await axios
      .get(`http://localhost:5000/alumno/traer/${matricula}`)
      .then((response) => {
        if (response.data.status === 200) {
          setShow(true);
          setAlumno(response.data.result[0]);
        } else {
          console.error("Error al consultar el alumno:", response.data.message);
          console.log(response);
        }
      });
  };

  const handleClose = () => {
    setShow(false);
    setAlumno(initialState);
  };

  const handleBuscar = () => {
    traerAlumnos();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    let { value } = e.target;
    setBuscar(value);
  };

  return (
    <Container>
      <Row className="mt-3">
        <Col>
          <div className="fs-3">Consultar Alumnos</div>
        </Col>
      </Row>

      <Row className="mt-3">
        <Col>
          <InputGroup className="mb-3">
            <Button
              variant="outline-secondary"
              onClick={handleBuscar}
              id="button-addon1"
            >
              Buscar
            </Button>
            <Form.Control
              type="text"
              aria-label="Ingresa nombre a buscar"
              aria-describedby="basic-addon1"
              onChange={handleInputChange}
              value={buscar}
            />
          </InputGroup>
        </Col>
      </Row>

      <Table striped bordered hover variant="dark">
        <thead>
          <tr>
            <th>Matricula</th>
            <th>Nombre</th>
            <th>Correo - Telefono</th>
            <th>Contacto</th>
            <th>Telefono contacto</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {alumnos.map((alumno) => (
            <tr key={alumno.matricula}>
              <td>{alumno.matricula}</td>
              <td>
                {alumno.nombre}&nbsp;{alumno.aPaterno}&nbsp;
                {alumno.aMaterno}
              </td>
              <td>
                {alumno.aCorreo} &nbsp; {alumno.aTelefono}
              </td>
              <td>{alumno.nombreContacto}</td>
              <td>{alumno.telefonoContacto}</td>
              <td>
                <Button
                  variant="primary"
                  onClick={() => AlumnoConsultar(alumno.matricula)}
                >
                  Consultar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
        data-bs-theme="dark"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {matricula}&nbsp;{nombre}&nbsp;{aPaterno}&nbsp;{aMaterno}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Container>
            <Row>
              <Col>Telefono:&nbsp;{aTelefono}</Col>
              <Col>Correo:&nbsp;{aCorreo}</Col>
            </Row>
            <Row>
              <Col>
                Direccion:&nbsp;{dCalle}&nbsp;{dNumero},&nbsp;
                {dColonia},&nbsp;{dCodigoPostal}
              </Col>
            </Row>
            <Row>
              <Col>Facebook:&nbsp;{aFacebook}</Col>
              <Col>Instagram:&nbsp;{aInstagram}</Col>
            </Row>
            <Row>
              <Col>Tipo de Sangre:&nbsp;{aTipoSangre}</Col>
              <Col>
                Sexo:&nbsp;
                {Number.parseInt(sexo) === 1 ? "Femenino" : "Masculino"}
              </Col>
            </Row>
            <Row>
              <Col>Nombre de contacto:&nbsp;{nombreContacto}</Col>
            </Row>
            <Row>
              <Col>Telefono de contacto:&nbsp;{telefonoContacto}</Col>
            </Row>
          </Container>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default AlumnosConsultar;
