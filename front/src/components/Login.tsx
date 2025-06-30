import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
} from "react-bootstrap";
import ReCAPTCHA from "react-google-recaptcha";
import axios from "axios";
import { storeSecureToken } from "../utils/secureStorage";

// Declarar types para Google OAuth
declare global {
  interface Window {
    google: any;
  }
}

interface LoginProps {
  onLogin: (token: string, usuario: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [matricula, setMatricula] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [captchaValue, setCaptchaValue] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  // Configuración de reCAPTCHA - Usando claves de prueba
  const RECAPTCHA_SITE_KEY =
    process.env.REACT_APP_RECAPTCHA_SITE_KEY ||
    "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";

  // Configuración de Google OAuth - Necesitarás obtener tu Client ID de Google Console
  const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || ""; // Agregar tu Client ID aquí

  // Mostrar Google OAuth como demo (no funcional en localhost)
  const isGoogleEnabled =
    GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== "tu_client_id_aqui";
  const isGoogleDemo = GOOGLE_CLIENT_ID === "demo_client_id";

  const handleCaptchaChange = (value: string | null) => {
    setCaptchaValue(value);
  };

  // Función para manejar el login con Google
  const handleGoogleLogin = useCallback(
    async (response: any) => {
      try {
        setCargando(true);

        // Enviar el token de Google al backend
        const loginResponse = await axios.post(
          "http://localhost:5000/google-login",
          {
            credential: response.credential,
          }
        );

        if (loginResponse.data.status === 200) {
          console.log("🔐 Almacenando token de Google de forma segura...");

          // Almacenar de forma segura usando el sistema de cifrado
          const almacenadoExitoso = storeSecureToken(
            loginResponse.data.token,
            loginResponse.data.usuario
          );

          if (almacenadoExitoso) {
            // Configurar axios para usar el token en futuras peticiones
            axios.defaults.headers.common[
              "Authorization"
            ] = `Bearer ${loginResponse.data.token}`;

            // Llamar callback de login exitoso
            onLogin(loginResponse.data.token, loginResponse.data.usuario);
            console.log("✅ Login con Google seguro completado");
          } else {
            setError("Error al almacenar la sesión de forma segura.");
          }
        }
      } catch (error: any) {
        console.error("Error en Google login:", error);
        setError(
          error.response?.data?.mensaje || "Error al iniciar sesión con Google."
        );
      } finally {
        setCargando(false);
      }
    },
    [onLogin]
  );

  // Inicializar Google OAuth cuando el componente se monta
  useEffect(() => {
    if (window.google && GOOGLE_CLIENT_ID && isGoogleEnabled) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleLogin,
      });

      window.google.accounts.id.renderButton(
        document.getElementById("google-signin-button"),
        {
          theme: "outline",
          size: "large",
          width: "100%",
          text: "signin_with",
          shape: "rectangular",
        }
      );
    }
  }, [GOOGLE_CLIENT_ID, handleGoogleLogin, isGoogleEnabled]);

  const manejarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    console.log("🔍 Iniciando login...");
    console.log("📝 Datos:", { matricula, contraseña: "***", captchaValue });

    // Validar captcha
    if (!captchaValue) {
      setError("Por favor, completa el captcha.");
      console.log("❌ Error: Captcha no completado");
      return;
    }

    setCargando(true);
    console.log("⏳ Enviando petición al backend...");

    try {
      console.log("🚀 Haciendo petición POST a http://localhost:5000/login");
      const response = await axios.post("http://localhost:5000/login", {
        matricula,
        contraseña,
        captcha: captchaValue,
      });

      console.log("✅ Respuesta del servidor:", response.data);

      if (response.data.status === 200) {
        console.log("🎉 Login exitoso, almacenando de forma segura...");

        // Almacenar de forma segura usando cifrado y hash
        const almacenadoExitoso = storeSecureToken(
          response.data.token,
          response.data.usuario
        );

        if (almacenadoExitoso) {
          // Configurar axios para usar el token en futuras peticiones
          axios.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${response.data.token}`;

          // Llamar callback de login exitoso
          onLogin(response.data.token, response.data.usuario);
          console.log("✅ Token almacenado de forma segura");
        } else {
          setError("Error al almacenar la sesión de forma segura.");
        }
      }
    } catch (error: any) {
      console.error("❌ Error en login:", error);
      console.error("❌ Error response:", error.response?.data);
      setError(
        error.response?.data?.mensaje ||
          "Error al iniciar sesión. Verifica tus credenciales."
      );

      // Resetear captcha en caso de error
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
        setCaptchaValue(null);
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100">
      <Row className="w-100">
        <Col md={6} lg={4} className="mx-auto">
          <Card className="shadow">
            <Card.Body>
              <div className="text-center mb-4">
                <h2>Sistema de Alumnos</h2>
                <p className="text-muted">Inicia sesión para continuar</p>
              </div>

              {error && (
                <Alert variant="danger" className="mb-3">
                  {error}
                </Alert>
              )}

              <Form onSubmit={manejarSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Matrícula</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ingresa tu matrícula"
                    value={matricula}
                    onChange={(e) => setMatricula(e.target.value)}
                    required
                    disabled={cargando}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Ingresa tu contraseña"
                    value={contraseña}
                    onChange={(e) => setContraseña(e.target.value)}
                    required
                    disabled={cargando}
                  />
                </Form.Group>

                <Form.Group className="mb-3 d-flex justify-content-center">
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={RECAPTCHA_SITE_KEY}
                    onChange={handleCaptchaChange}
                  />
                </Form.Group>

                <div className="d-grid gap-2">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={cargando || !captchaValue}
                    size="lg"
                  >
                    {cargando ? "Iniciando sesión..." : "Iniciar Sesión"}
                  </Button>

                  <div className="text-center my-3">
                    <span className="text-muted">o</span>
                  </div>

                  {isGoogleEnabled ? (
                    isGoogleDemo ? (
                      <div>
                        <Button
                          variant="outline-danger"
                          size="lg"
                          disabled
                          className="w-100 d-flex align-items-center justify-content-center"
                          style={{ gap: "10px" }}
                          title="Google OAuth requiere dominio público para funcionar"
                        >
                          <svg width="18" height="18" viewBox="0 0 18 18">
                            <path
                              fill="#4285F4"
                              d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"
                            />
                            <path
                              fill="#34A853"
                              d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 0 1-7.18-2.53H1.83v2.07A8 8 0 0 0 8.98 17z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M4.5 10.49a4.8 4.8 0 0 1 0-3.07V5.35H1.83a8 8 0 0 0 0 7.17l2.67-2.03z"
                            />
                            <path
                              fill="#EA4335"
                              d="M8.98 3.5c1.15 0 2.19.4 3.01 1.18l2.26-2.26A7.93 7.93 0 0 0 8.98 1a8 8 0 0 0-7.15 4.42l2.67 2.03c.64-1.93 2.47-3.3 4.48-3.3z"
                            />
                          </svg>
                          Continuar con Google (Demo)
                        </Button>
                        <div className="text-center mt-2">
                          <small className="text-muted">
                            <i>
                              Google OAuth implementado - Requiere dominio
                              público
                            </i>
                          </small>
                        </div>
                      </div>
                    ) : (
                      <div
                        id="google-signin-button"
                        className="d-flex justify-content-center"
                      >
                        {/* El botón de Google se renderizará aquí */}
                      </div>
                    )
                  ) : (
                    <div className="text-center">
                      <small className="text-muted">
                        Google OAuth no configurado
                      </small>
                    </div>
                  )}
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
