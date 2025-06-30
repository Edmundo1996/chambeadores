import React, { useState, useEffect } from "react";
import { Card, Badge, Button, Row, Col } from "react-bootstrap";
import {
  getStorageDebugInfo,
  clearSecureStorage,
  hasValidSecureToken,
} from "../utils/secureStorage";

const SecurityDebugPanel: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showPanel, setShowPanel] = useState(false);

  const updateDebugInfo = () => {
    const info = getStorageDebugInfo();
    setDebugInfo(info);
  };

  useEffect(() => {
    updateDebugInfo();
    // Actualizar cada 5 segundos
    const interval = setInterval(updateDebugInfo, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleClearStorage = () => {
    clearSecureStorage();
    updateDebugInfo();
    alert("Almacenamiento seguro limpiado");
  };

  const formatTokenAge = (age: number | null) => {
    if (!age) return "N/A";
    const minutes = Math.floor(age / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  if (!showPanel) {
    return (
      <Button
        variant="outline-secondary"
        size="sm"
        className="position-fixed"
        style={{ bottom: "20px", right: "20px", zIndex: 1000 }}
        onClick={() => setShowPanel(true)}
      >
        🔒 Debug
      </Button>
    );
  }

  return (
    <Card
      className="position-fixed"
      style={{
        bottom: "20px",
        right: "20px",
        width: "300px",
        zIndex: 1000,
        fontSize: "0.85rem",
      }}
    >
      <Card.Header className="d-flex justify-content-between align-items-center py-2">
        <span>🔒 Almacenamiento Seguro</span>
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => setShowPanel(false)}
        >
          ✕
        </Button>
      </Card.Header>
      <Card.Body className="py-2">
        {debugInfo && (
          <>
            <Row className="mb-2">
              <Col xs={6}>Token Seguro:</Col>
              <Col xs={6}>
                <Badge bg={debugInfo.hasSecureToken ? "success" : "danger"}>
                  {debugInfo.hasSecureToken ? "✅ Sí" : "❌ No"}
                </Badge>
              </Col>
            </Row>

            <Row className="mb-2">
              <Col xs={6}>Token Antiguo:</Col>
              <Col xs={6}>
                <Badge bg={debugInfo.hasOldToken ? "warning" : "secondary"}>
                  {debugInfo.hasOldToken ? "⚠️ Sí" : "✅ No"}
                </Badge>
              </Col>
            </Row>

            <Row className="mb-2">
              <Col xs={6}>Edad del Token:</Col>
              <Col xs={6}>
                <small>{formatTokenAge(debugInfo.tokenAge)}</small>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col xs={12}>
                <small className="text-muted">
                  Tipo: {debugInfo.storageType}
                </small>
              </Col>
            </Row>

            <Row>
              <Col xs={12}>
                <Button
                  variant="outline-danger"
                  size="sm"
                  className="w-100"
                  onClick={handleClearStorage}
                >
                  🧹 Limpiar Storage
                </Button>
              </Col>
            </Row>
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default SecurityDebugPanel;
