import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Tab,
  Tabs,
  Button,
  Badge,
  ListGroup,
  Modal,
  Form,
  Alert,
  Spinner,
} from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

interface Mensaje {
  id: number;
  emisor_matricula: string;
  receptor_matricula: string;
  asunto: string;
  mensaje: string;
  fecha_envio: string;
  leido: boolean;
  emisor_nombre?: string;
  emisor_paterno?: string;
  emisor_materno?: string;
  receptor_nombre?: string;
  receptor_paterno?: string;
  receptor_materno?: string;
}

interface Usuario {
  matricula: string;
  nombre: string;
  aPaterno: string;
  aMaterno: string;
}

const Mensajes: React.FC = () => {
  const { usuario } = useAuth();
  const [mensajesRecibidos, setMensajesRecibidos] = useState<Mensaje[]>([]);
  const [mensajesEnviados, setMensajesEnviados] = useState<Mensaje[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [mensajesNoLeidos, setMensajesNoLeidos] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // Modal para nuevo mensaje
  const [showModal, setShowModal] = useState(false);
  const [nuevoMensaje, setNuevoMensaje] = useState({
    receptor_matricula: "",
    asunto: "",
    mensaje: "",
  });
  const [enviando, setEnviando] = useState(false);

  // Modal para ver mensaje completo
  const [showMensajeModal, setShowMensajeModal] = useState(false);
  const [mensajeSeleccionado, setMensajeSeleccionado] =
    useState<Mensaje | null>(null);

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      await Promise.all([
        cargarMensajesRecibidos(),
        cargarMensajesEnviados(),
        cargarUsuarios(),
        cargarConteoNoLeidos(),
      ]);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      setError("Error al cargar los mensajes");
    } finally {
      setCargando(false);
    }
  };

  const cargarMensajesRecibidos = async () => {
    const response = await axios.get(
      "http://localhost:5000/mensajes/recibidos"
    );
    setMensajesRecibidos(response.data.mensajes);
  };

  const cargarMensajesEnviados = async () => {
    const response = await axios.get("http://localhost:5000/mensajes/enviados");
    setMensajesEnviados(response.data.mensajes);
  };

  const cargarUsuarios = async () => {
    const response = await axios.get("http://localhost:5000/usuarios/lista");
    setUsuarios(response.data.usuarios);
  };

  const cargarConteoNoLeidos = async () => {
    const response = await axios.get(
      "http://localhost:5000/mensajes/no-leidos/count"
    );
    setMensajesNoLeidos(response.data.count);
  };

  const enviarMensaje = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !nuevoMensaje.receptor_matricula ||
      !nuevoMensaje.asunto ||
      !nuevoMensaje.mensaje
    ) {
      setError("Todos los campos son requeridos");
      return;
    }

    setEnviando(true);
    try {
      await axios.post("http://localhost:5000/mensajes/enviar", nuevoMensaje);
      setShowModal(false);
      setNuevoMensaje({ receptor_matricula: "", asunto: "", mensaje: "" });
      setError("");
      await cargarMensajesEnviados();
      alert("Mensaje enviado exitosamente");
    } catch (error: any) {
      setError(error.response?.data?.mensaje || "Error al enviar mensaje");
    } finally {
      setEnviando(false);
    }
  };

  const verMensaje = async (mensaje: Mensaje) => {
    setMensajeSeleccionado(mensaje);
    setShowMensajeModal(true);

    // Si es un mensaje recibido y no está leído, marcarlo como leído
    if (!mensaje.leido && mensaje.receptor_matricula === usuario?.matricula) {
      try {
        await axios.put(
          `http://localhost:5000/mensajes/${mensaje.id}/marcar-leido`
        );
        await cargarMensajesRecibidos();
        await cargarConteoNoLeidos();
      } catch (error) {
        console.error("Error al marcar mensaje como leído:", error);
      }
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (cargando) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">
                📨 Sistema de Mensajes
                {mensajesNoLeidos > 0 && (
                  <Badge bg="danger" className="ms-2">
                    {mensajesNoLeidos} nuevos
                  </Badge>
                )}
              </h4>
              <Button variant="primary" onClick={() => setShowModal(true)}>
                ✉️ Nuevo Mensaje
              </Button>
            </Card.Header>
            <Card.Body>
              {error && (
                <Alert
                  variant="danger"
                  dismissible
                  onClose={() => setError("")}
                >
                  {error}
                </Alert>
              )}

              <Tabs defaultActiveKey="recibidos" id="mensajes-tabs">
                <Tab
                  eventKey="recibidos"
                  title={
                    <>
                      📥 Recibidos{" "}
                      {mensajesNoLeidos > 0 && (
                        <Badge bg="danger">{mensajesNoLeidos}</Badge>
                      )}
                    </>
                  }
                >
                  <div className="mt-3">
                    {mensajesRecibidos.length === 0 ? (
                      <p className="text-muted text-center">
                        No tienes mensajes recibidos
                      </p>
                    ) : (
                      <ListGroup>
                        {mensajesRecibidos.map((mensaje) => (
                          <ListGroup.Item
                            key={mensaje.id}
                            action
                            onClick={() => verMensaje(mensaje)}
                            className={`d-flex justify-content-between align-items-start ${
                              !mensaje.leido ? "bg-light border-primary" : ""
                            }`}
                          >
                            <div className="me-auto">
                              <div className="fw-bold">
                                {!mensaje.leido && (
                                  <Badge bg="danger" className="me-2">
                                    Nuevo
                                  </Badge>
                                )}
                                {mensaje.asunto}
                              </div>
                              <small className="text-muted">
                                De: {mensaje.emisor_nombre}{" "}
                                {mensaje.emisor_paterno} (
                                {mensaje.emisor_matricula})
                              </small>
                              <div className="mt-1">
                                <small
                                  className="text-truncate d-block"
                                  style={{ maxWidth: "300px" }}
                                >
                                  {mensaje.mensaje}
                                </small>
                              </div>
                            </div>
                            <small className="text-muted">
                              {formatearFecha(mensaje.fecha_envio)}
                            </small>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    )}
                  </div>
                </Tab>

                <Tab eventKey="enviados" title="📤 Enviados">
                  <div className="mt-3">
                    {mensajesEnviados.length === 0 ? (
                      <p className="text-muted text-center">
                        No has enviado mensajes
                      </p>
                    ) : (
                      <ListGroup>
                        {mensajesEnviados.map((mensaje) => (
                          <ListGroup.Item
                            key={mensaje.id}
                            action
                            onClick={() => verMensaje(mensaje)}
                            className="d-flex justify-content-between align-items-start"
                          >
                            <div className="me-auto">
                              <div className="fw-bold">{mensaje.asunto}</div>
                              <small className="text-muted">
                                Para: {mensaje.receptor_nombre}{" "}
                                {mensaje.receptor_paterno} (
                                {mensaje.receptor_matricula})
                              </small>
                              <div className="mt-1">
                                <small
                                  className="text-truncate d-block"
                                  style={{ maxWidth: "300px" }}
                                >
                                  {mensaje.mensaje}
                                </small>
                              </div>
                            </div>
                            <small className="text-muted">
                              {formatearFecha(mensaje.fecha_envio)}
                            </small>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    )}
                  </div>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal para nuevo mensaje */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>✉️ Nuevo Mensaje</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={enviarMensaje}>
            <Form.Group className="mb-3">
              <Form.Label>Para:</Form.Label>
              <Form.Select
                value={nuevoMensaje.receptor_matricula}
                onChange={(e) =>
                  setNuevoMensaje({
                    ...nuevoMensaje,
                    receptor_matricula: e.target.value,
                  })
                }
                required
              >
                <option value="">Selecciona un usuario...</option>
                {usuarios.map((usuario) => (
                  <option key={usuario.matricula} value={usuario.matricula}>
                    {usuario.nombre} {usuario.aPaterno} {usuario.aMaterno} (
                    {usuario.matricula})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Asunto:</Form.Label>
              <Form.Control
                type="text"
                value={nuevoMensaje.asunto}
                onChange={(e) =>
                  setNuevoMensaje({ ...nuevoMensaje, asunto: e.target.value })
                }
                placeholder="Escribe el asunto del mensaje"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Mensaje:</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                value={nuevoMensaje.mensaje}
                onChange={(e) =>
                  setNuevoMensaje({ ...nuevoMensaje, mensaje: e.target.value })
                }
                placeholder="Escribe tu mensaje aquí..."
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={enviarMensaje} disabled={enviando}>
            {enviando ? "Enviando..." : "📤 Enviar Mensaje"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para ver mensaje completo */}
      <Modal
        show={showMensajeModal}
        onHide={() => setShowMensajeModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>📨 {mensajeSeleccionado?.asunto}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {mensajeSeleccionado && (
            <>
              <div className="mb-3">
                <strong>De:</strong> {mensajeSeleccionado.emisor_nombre}{" "}
                {mensajeSeleccionado.emisor_paterno} (
                {mensajeSeleccionado.emisor_matricula})
              </div>
              <div className="mb-3">
                <strong>Para:</strong> {mensajeSeleccionado.receptor_nombre}{" "}
                {mensajeSeleccionado.receptor_paterno} (
                {mensajeSeleccionado.receptor_matricula})
              </div>
              <div className="mb-3">
                <strong>Fecha:</strong>{" "}
                {formatearFecha(mensajeSeleccionado.fecha_envio)}
              </div>
              <hr />
              <div style={{ whiteSpace: "pre-wrap" }}>
                {mensajeSeleccionado.mensaje}
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowMensajeModal(false)}
          >
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Mensajes;
