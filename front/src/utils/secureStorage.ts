import CryptoJS from "crypto-js";

/**
 * Módulo de almacenamiento seguro para tokens JWT
 * Implementa cifrado, hash y almacenamiento en sessionStorage
 */

// Clave secreta para cifrado (en producción debe venir de variables de entorno)
const SECRET_KEY =
  process.env.REACT_APP_ENCRYPTION_KEY ||
  "clave_secreta_super_compleja_2024_jwt_security";

// Prefijos para identificar datos cifrados
const TOKEN_PREFIX = "sec_tkn_";
const USER_PREFIX = "sec_usr_";
const HASH_PREFIX = "sec_hsh_";

/**
 * Genera un hash SHA-256 del token para verificación de integridad
 */
const generateTokenHash = (token: string): string => {
  return CryptoJS.SHA256(token + SECRET_KEY).toString();
};

/**
 * Cifra un string usando AES
 */
const encrypt = (text: string): string => {
  const encrypted = CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
  return encrypted;
};

/**
 * Descifra un string usando AES
 */
const decrypt = (encryptedText: string): string => {
  const decrypted = CryptoJS.AES.decrypt(encryptedText, SECRET_KEY);
  return decrypted.toString(CryptoJS.enc.Utf8);
};

/**
 * Almacena el token de forma segura
 */
export const storeSecureToken = (token: string, usuario: any): boolean => {
  try {
    console.log("🔐 Almacenando token de forma segura...");

    // 1. Generar hash del token para verificación
    const tokenHash = generateTokenHash(token);

    // 2. Cifrar el token
    const encryptedToken = encrypt(token);

    // 3. Cifrar los datos del usuario
    const encryptedUser = encrypt(JSON.stringify(usuario));

    // 4. Almacenar en sessionStorage (más seguro que localStorage)
    sessionStorage.setItem(TOKEN_PREFIX + "data", encryptedToken);
    sessionStorage.setItem(USER_PREFIX + "data", encryptedUser);
    sessionStorage.setItem(HASH_PREFIX + "verify", tokenHash);

    // 5. Añadir timestamp para expiración
    const timestamp = Date.now();
    sessionStorage.setItem(TOKEN_PREFIX + "time", timestamp.toString());

    console.log("✅ Token almacenado y cifrado exitosamente");
    return true;
  } catch (error) {
    console.error("❌ Error al almacenar token seguro:", error);
    return false;
  }
};

/**
 * Recupera el token de forma segura
 */
export const getSecureToken = (): {
  token: string | null;
  usuario: any | null;
} => {
  try {
    console.log("🔍 Recuperando token seguro...");

    // 1. Obtener datos cifrados
    const encryptedToken = sessionStorage.getItem(TOKEN_PREFIX + "data");
    const encryptedUser = sessionStorage.getItem(USER_PREFIX + "data");
    const storedHash = sessionStorage.getItem(HASH_PREFIX + "verify");
    const timestamp = sessionStorage.getItem(TOKEN_PREFIX + "time");

    if (!encryptedToken || !encryptedUser || !storedHash || !timestamp) {
      console.log("⚠️ No se encontraron datos de token seguro");
      return { token: null, usuario: null };
    }

    // 2. Verificar si el token ha expirado (24 horas)
    const tokenAge = Date.now() - parseInt(timestamp);
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas

    if (tokenAge > maxAge) {
      console.log("⏰ Token expirado, limpiando almacenamiento");
      clearSecureStorage();
      return { token: null, usuario: null };
    }

    // 3. Descifrar el token
    const decryptedToken = decrypt(encryptedToken);

    // 4. Verificar integridad del token
    const calculatedHash = generateTokenHash(decryptedToken);

    if (calculatedHash !== storedHash) {
      console.error("🚨 Token comprometido - Hash no coincide");
      clearSecureStorage();
      return { token: null, usuario: null };
    }

    // 5. Descifrar datos del usuario
    const decryptedUser = decrypt(encryptedUser);
    const usuario = JSON.parse(decryptedUser);

    console.log("✅ Token recuperado y verificado exitosamente");
    return { token: decryptedToken, usuario };
  } catch (error) {
    console.error("❌ Error al recuperar token seguro:", error);
    clearSecureStorage();
    return { token: null, usuario: null };
  }
};

/**
 * Verifica si existe un token válido
 */
export const hasValidSecureToken = (): boolean => {
  const { token } = getSecureToken();
  return token !== null;
};

/**
 * Limpia todos los datos de almacenamiento seguro
 */
export const clearSecureStorage = (): void => {
  console.log("🧹 Limpiando almacenamiento seguro...");

  // Limpiar sessionStorage
  sessionStorage.removeItem(TOKEN_PREFIX + "data");
  sessionStorage.removeItem(USER_PREFIX + "data");
  sessionStorage.removeItem(HASH_PREFIX + "verify");
  sessionStorage.removeItem(TOKEN_PREFIX + "time");

  // Limpiar también localStorage por compatibilidad
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");

  console.log("✅ Almacenamiento seguro limpiado");
};

/**
 * Migra tokens del almacenamiento inseguro al seguro
 */
export const migrateToSecureStorage = (): boolean => {
  try {
    const oldToken = localStorage.getItem("token");
    const oldUser = localStorage.getItem("usuario");

    if (oldToken && oldUser) {
      console.log("🔄 Migrando a almacenamiento seguro...");
      const usuario = JSON.parse(oldUser);

      if (storeSecureToken(oldToken, usuario)) {
        // Limpiar almacenamiento inseguro
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        console.log("✅ Migración completada");
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error("❌ Error en migración:", error);
    return false;
  }
};

/**
 * Genera información de debug sobre el almacenamiento
 */
export const getStorageDebugInfo = () => {
  const hasSecure = hasValidSecureToken();
  const hasOld = localStorage.getItem("token") !== null;
  const timestamp = sessionStorage.getItem(TOKEN_PREFIX + "time");

  return {
    hasSecureToken: hasSecure,
    hasOldToken: hasOld,
    tokenAge: timestamp ? Date.now() - parseInt(timestamp) : null,
    storageType: "sessionStorage + AES encryption + SHA256 hash",
  };
};
