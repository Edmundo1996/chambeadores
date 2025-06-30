import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";
import {
  storeSecureToken,
  getSecureToken,
  hasValidSecureToken,
  clearSecureStorage,
  migrateToSecureStorage,
  getStorageDebugInfo,
} from "../utils/secureStorage";

interface Usuario {
  matricula: string;
  nombre: string;
  aPaterno: string;
  aMaterno: string;
}

interface AuthContextType {
  token: string | null;
  usuario: Usuario | null;
  isAuthenticated: boolean;
  login: (token: string, usuario: Usuario) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  // Función comentada para modo desarrollo
  /*
  const verificarToken = async (tokenAVerificar: string) => {
    try {
      await axios.get("http://localhost:5000/verificar-token", {
        headers: {
          Authorization: `Bearer ${tokenAVerificar}`,
        },
      });
      setLoading(false);
    } catch (error) {
      console.error("Token inválido:", error);
      logout();
    }
  };
  */

  useEffect(() => {
    console.log("🔄 Inicializando AuthContext con almacenamiento seguro...");

    // Intentar migrar desde almacenamiento inseguro si existe
    migrateToSecureStorage();

    // Verificar si hay token seguro
    if (hasValidSecureToken()) {
      const { token: tokenSeguro, usuario: usuarioSeguro } = getSecureToken();

      if (tokenSeguro && usuarioSeguro) {
        console.log("✅ Token seguro encontrado y válido");
        setToken(tokenSeguro);
        setUsuario(usuarioSeguro);

        // Configurar axios para usar el token
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${tokenSeguro}`;

        // Opcional: Verificar token con el servidor
        // verificarToken(tokenSeguro);
      }
    } else {
      console.log("ℹ️ No se encontró token seguro válido");
    }

    // Mostrar información de debug
    const debugInfo = getStorageDebugInfo();
    console.log("📊 Info de almacenamiento:", debugInfo);

    setLoading(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = (nuevoToken: string, nuevoUsuario: Usuario) => {
    console.log("🔐 Realizando login seguro...");

    // Almacenar de forma segura
    const almacenadoExitoso = storeSecureToken(nuevoToken, nuevoUsuario);

    if (almacenadoExitoso) {
      setToken(nuevoToken);
      setUsuario(nuevoUsuario);
      axios.defaults.headers.common["Authorization"] = `Bearer ${nuevoToken}`;
      console.log("✅ Login seguro completado");
    } else {
      console.error("❌ Error al almacenar token de forma segura");
    }
  };

  const logout = () => {
    console.log("🚪 Realizando logout seguro...");
    setToken(null);
    setUsuario(null);
    clearSecureStorage();
    delete axios.defaults.headers.common["Authorization"];
    setLoading(false);
    console.log("✅ Logout seguro completado");
  };

  const value: AuthContextType = {
    token,
    usuario,
    isAuthenticated: !!token,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
