import axios from "axios";
import React, { useState } from "react";
import {
  Row,
  Col,
  FloatingLabel,
  Button,
  Container,
  InputGroup,
  Form,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.css";

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

type botonesEstado = {
  btnGuardar: boolean;
  btnCancelar: boolean;
};

const initialStateBtn: botonesEstado = {
  btnGuardar: true,
  btnCancelar: true,
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

function AlumnoModificar() {
  const [alumno, setAlumno] = useState(initialState);
  const [botones, setBotones] = useState(initialStateBtn);
  const [mat, setMat] = useState("");

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

  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    let { name, value } = e.target;
    setAlumno({ ...alumno, [name]: value });
  };

  const handleMatChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    let { value } = e.target;
    setMat(value);
  };

  const handleCancelar = (): void => {
    setAlumno(initialState);
    setBotones(initialStateBtn);
  };

  const handleSelectChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    let { name, value } = e.target;
    setAlumno({ ...alumno, [name]: value });
  };

  const alumnoConsultar = async () => {
    const mat1 = mat === "" ? 0 : mat;
    const response = await axios
      .get(`http://localhost:5000/alumno/traer/${mat1}`)
      .then((response) => {
        if (response.data.status === 200) {
          if (response.data.result.length > 0) {
            setAlumno(response.data.result[0]);
            setBotones({
              btnGuardar: false,
              btnCancelar: false,
            });
          } else {
            setAlumno(initialState);
            notify(101);
          }
        } else {
          console.error("Error al consultar el alumno:", response.data.message);
        }
      });
  };

  const notify = (status: number) => {
    if (status === 200) {
      Swal.fire({
        title: "Completado!",
        text: "Guardado con éxito",
        icon: "success",
        confirmButtonText: "Cool",
      });
      handleCancelar();
      navigate("/");
    }
    if (status === 100) {
      Swal.fire({
        title: "Error!",
        text: "No se pudo guardar el alumno",
        icon: "error",
        confirmButtonText: "Inténtalo de nuevo",
      });
    }
    if (status === 101) {
      Swal.fire({
        title: "No encontrado!",
        text: "No se encontró el alumno con esa matrícula",
        icon: "warning",
        confirmButtonText: "Inténtalo de nuevo",
      });
    }
  };

  const modificarAlumno = async (data: alumnoEstructura) => {
    const response = await axios
      .post("http://localhost:5000/alumno/modificar", data)
      .then((response) => {
        notify(response.data.status);
        setAlumno(initialState);
        setBotones(initialStateBtn);
        setMat("");
      });

    setTimeout(() => navigate("/"), 2000);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    modificarAlumno(alumno);
    // console.log(alumno);
  };

  return (
    <Container fluid>
      <Row className="mt-3">
        <Col>
          <div className="fs-3">Ingrese sus datos</div>
        </Col>
      </Row>

      <Row className="mt-3">
        <Col>&nbsp;</Col>
        <Col className="bg-secondary pt-4 pb-4">
          <InputGroup>
            <Button
              id="button-addon1"
              style={{ background: "#454545" }}
              onClick={alumnoConsultar}
            >
              Buscar
            </Button>
            <FloatingLabel label="Ingresa la matricula a buscar">
              <Form.Control
                name="matricula"
                type="text"
                placeholder="Ingresa la matricula a buscar"
                value={mat}
                onChange={handleMatChange}
              />
            </FloatingLabel>
          </InputGroup>
        </Col>
        <Col>&nbsp;</Col>
      </Row>

      <Row className="mt-3">
        <Col>Buscar</Col>
      </Row>
      <Form onSubmit={handleSubmit}>
        <Row className="mt-3">
          <Col>&nbsp;</Col>
          <Col>
            <FloatingLabel label="Matricula">
              <Form.Control
                name="matricula"
                type="text"
                disabled={true}
                placeholder="Ingresa tu matricula"
                onChange={handleInputChange}
                required
              />
            </FloatingLabel>
          </Col>
          <Col> </Col>
        </Row>

        <Row className="mt-4">
          <Col> </Col>
          <Col>
            <FloatingLabel label="Nombre">
              <Form.Control
                name="nombre"
                type="text"
                placeholder="Ingrese su nombre"
                value={nombre}
                onChange={handleInputChange}
                required
              />
            </FloatingLabel>
          </Col>
          <Col>
            <FloatingLabel label="Apellido Paterno">
              <Form.Control
                name="aPaterno"
                type="text"
                placeholder="Ingrese su Apellido Paterno"
                value={aPaterno}
                onChange={handleInputChange}
                required
              />
            </FloatingLabel>
          </Col>
          <Col>
            <FloatingLabel label="Apellido Materno">
              <Form.Control
                name="aMaterno"
                type="text"
                placeholder="Ingrese su Apellido Materno"
                value={aMaterno}
                onChange={handleInputChange}
                required
              />
            </FloatingLabel>
          </Col>
          <Col> </Col>
        </Row>

        <Row className="mt-4">
          <Col> </Col>
          <Col md={3}>
            <Form.Select
              name="sexo"
              value={sexo}
              aria-label="Selecciona tu sexo"
              onChange={handleSelectChange}
              required
            >
              <option value="">Seleccione tu sexo</option>
              <option value="1">Femenino</option>
              <option value="2">Masculino</option>
            </Form.Select>
          </Col>
          <Col>
            <FloatingLabel label="Telefono ejemplo: (618) 1563424">
              <Form.Control
                name="aTelefono"
                type="text"
                placeholder="Ingrese su telefono (618)6181563424"
                pattern="^\([0-9]{3}\)[0-9]{7}$"
                value={aTelefono}
                onChange={handleInputChange}
                required
              />
            </FloatingLabel>
          </Col>
          <Col> </Col>
        </Row>

        <Row className="mt-3">
          <Col> </Col>
          <Col md={3}>
            <FloatingLabel label="Correo Electronico">
              <Form.Control
                name="aCorreo"
                type="email"
                placeholder="Ingresa aqui tu correo"
                value={aCorreo}
                onChange={handleInputChange}
                required
              />
            </FloatingLabel>
          </Col>
          <Col md={3}>
            <FloatingLabel label="Perfil Facebook">
              <Form.Control
                name="aFacebook"
                type="text"
                placeholder="Ingresa aqui tu perfil de fb"
                value={aFacebook}
                onChange={handleInputChange}
                required
              />
            </FloatingLabel>
          </Col>
          <Col> </Col>
        </Row>

        <Row className="mt-4">
          <Col> </Col>
          <Col md={3}>
            <FloatingLabel label="Perfil Instagram">
              <Form.Control
                name="aInstagram"
                type="text"
                placeholder="Ingresa aqui tu perfil de ig"
                value={aInstagram}
                onChange={handleInputChange}
                required
              />
            </FloatingLabel>
          </Col>
          <Col md={3}>
            <FloatingLabel label="Tipo de Sangre">
              <Form.Control
                name="aTipoSangre"
                type="text"
                placeholder="Ingresa tu tipo de sangre"
                value={aTipoSangre}
                onChange={handleInputChange}
                required
              />
            </FloatingLabel>
          </Col>
          <Col> </Col>
        </Row>

        <Row className="mt-3">
          <Col className="fs-3">
            <div>Dirección</div>
          </Col>
        </Row>

        <Row className="mt-3">
          <Col> </Col>
          <Col>
            <FloatingLabel label="Calle">
              <Form.Control
                name="dCalle"
                type="text"
                placeholder="Ingresa aqui tu calle"
                value={dCalle}
                onChange={handleInputChange}
                required
              />
            </FloatingLabel>
          </Col>
          <Col md={3}>
            <FloatingLabel label="Numero">
              <Form.Control
                name="dNumero"
                type="number"
                placeholder="Ingresa el numero"
                value={dNumero}
                onChange={handleInputChange}
                required
              />
            </FloatingLabel>
          </Col>
          <Col> </Col>
        </Row>

        <Row className="mt-3">
          <Col> </Col>
          <Col>
            <FloatingLabel label="Colonia">
              <Form.Control
                name="dColonia"
                type="text"
                placeholder="Ingresa aqui tu colonia"
                value={dColonia}
                onChange={handleInputChange}
                required
              />
            </FloatingLabel>
          </Col>
          <Col md={3}>
            <FloatingLabel label="Codigo Postal">
              <Form.Control
                name="dCodigoPostal"
                type="number"
                placeholder="Ingresa el CP"
                value={dCodigoPostal}
                onChange={handleInputChange}
                required
              />
            </FloatingLabel>
          </Col>
          <Col> </Col>
        </Row>

        <Row className="mt-3">
          <Col className="fs-3">
            <div>Contacto</div>
          </Col>
        </Row>

        <Row className="mt-3">
          <Col> </Col>
          <Col>
            <FloatingLabel label="Nombre">
              <Form.Control
                name="nombreContacto"
                type="text"
                placeholder="Ingresa aqui tu nombre"
                value={nombreContacto}
                onChange={handleInputChange}
                required
              />
            </FloatingLabel>
          </Col>
          <Col md={3}>
            <FloatingLabel label="Telefono ejemplo: (618) 1563424">
              <Form.Control
                name="telefonoContacto"
                type="text"
                placeholder="Ingrese su telefono (618)6181563424"
                pattern="^\([0-9]{3}\)[0-9]{7}$"
                value={telefonoContacto}
                onChange={handleInputChange}
                required
              />
            </FloatingLabel>
          </Col>
          <Col> </Col>
        </Row>

        <Row className="mt-3">
          <Col> </Col>
          <Col>
            <Button
              type="submit"
              disabled={botones.btnGuardar}
              className="btn btn-primary"
            >
              Guardar
            </Button>
          </Col>
          <Col>
            <Button
              className="btn btn-info"
              disabled={botones.btnCancelar}
              onClick={handleCancelar}
            >
              Cancelar
            </Button>
          </Col>
          <Col> </Col>
        </Row>

        <Row className="mt-3">
          <Col> </Col>
        </Row>
      </Form>
    </Container>
  );
}

export default AlumnoModificar;
