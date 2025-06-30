# 🎓 Sistema de Gestión de Alumnos - Fullstack

Un sistema completo de gestión de alumnos desarrollado con **React**, **Node.js/Express** y **MySQL**, incluyendo autenticación JWT, Google OAuth, reCAPTCHA y sistema de mensajería interna.

## 🚀 Características Principales

### 🔐 **Seguridad Avanzada**

- ✅ **Autenticación JWT** con tokens hasheados y cifrados
- ✅ **Google OAuth** integrado
- ✅ **Google reCAPTCHA** para protección contra bots
- ✅ **Almacenamiento seguro** con cifrado AES-256 + SHA-256
- ✅ **Contraseñas hasheadas** con bcrypt
- ✅ **Rutas protegidas** en frontend y backend

### 👥 **Gestión de Alumnos**

- ✅ **CRUD completo** (Crear, Leer, Actualizar, Eliminar)
- ✅ **Validación de formularios**
- ✅ **Búsqueda y filtrado**
- ✅ **Interfaz responsiva** con React Bootstrap

### 💬 **Sistema de Mensajería**

- ✅ **Mensajes internos** entre usuarios
- ✅ **Bandeja de entrada y enviados**
- ✅ **Notificaciones** de mensajes no leídos
- ✅ **Interfaz intuitiva** con modales y pestañas

### 🛠️ **Tecnologías Utilizadas**

#### **Frontend**

- React 18 + TypeScript
- React Bootstrap
- React Router
- Axios
- CryptoJS (para cifrado)
- Google reCAPTCHA

#### **Backend**

- Node.js + Express
- MySQL con mysql2
- JWT (jsonwebtoken)
- bcryptjs
- Google OAuth
- CORS

## 📦 Instalación y Configuración

### **Prerrequisitos**

- Node.js (v16+)
- MySQL (v8+)
- npm o yarn

### **1. Clonar el repositorio**

```bash
git clone [URL_DEL_REPOSITORIO]
cd Proy_Ra
```

### **2. Configurar la base de datos**

```sql
CREATE DATABASE alumnos;
USE alumnos;

-- Crear tabla de alumnos
CREATE TABLE alumnos (
    matricula VARCHAR(20) PRIMARY KEY,
    aPaterno VARCHAR(50),
    aMaterno VARCHAR(50),
    nombre VARCHAR(50),
    sexo ENUM('M', 'F'),
    dCalle VARCHAR(100),
    dNumero VARCHAR(10),
    dColonia VARCHAR(50),
    dCodigoPostal VARCHAR(10),
    aTelefono VARCHAR(15),
    aCorreo VARCHAR(100),
    aFacebook VARCHAR(100),
    aInstagram VARCHAR(100),
    aTipoSangre ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
    nombreContacto VARCHAR(100),
    telefonoContacto VARCHAR(15),
    contrasenha VARCHAR(255),
    foto LONGBLOB
);

-- Crear tabla de mensajes
CREATE TABLE mensajes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    remitente VARCHAR(20),
    destinatario VARCHAR(20),
    asunto VARCHAR(255),
    mensaje TEXT,
    leido BOOLEAN DEFAULT FALSE,
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (remitente) REFERENCES alumnos(matricula),
    FOREIGN KEY (destinatario) REFERENCES alumnos(matricula)
);
```

### **3. Configurar Backend**

```bash
cd back
npm install
```

Crear archivo `.env` en `/back/`:

```env
# Base de datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password_mysql
DB_NAME=alumnos

# JWT
JWT_SECRET=tu_clave_secreta_super_segura_2024

# Google reCAPTCHA
RECAPTCHA_SECRET_KEY=tu_clave_secreta_recaptcha

# Servidor
PORT=5000
```

### **4. Configurar Frontend**

```bash
cd front
npm install
```

Crear archivo `.env` en `/front/`:

```env
# Google reCAPTCHA (claves de prueba)
REACT_APP_RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI

# Google OAuth (opcional)
REACT_APP_GOOGLE_CLIENT_ID=tu_google_client_id

# API Backend
REACT_APP_API_URL=http://localhost:5000

# Cifrado de tokens
REACT_APP_ENCRYPTION_KEY=SecureJWT2024_MundoAlumnos_CryptoKey_HashSalt_AES256
```

## 🚀 Ejecutar el Proyecto

### **Opción 1: Ejecutar por separado**

```bash
# Terminal 1 - Backend
cd back
npm start

# Terminal 2 - Frontend
cd front
npm start
```

### **Opción 2: Usuario de prueba**

Insertar usuario de prueba en la base de datos:

```sql
INSERT INTO alumnos (matricula, nombre, aPaterno, contrasenha)
VALUES ('123456', 'Usuario', 'Prueba', '$2b$10$hashedPasswordHere');
```

## 🔧 Uso del Sistema

### **Login**

- **Matrícula**: `123456`
- **Contraseña**: `password123`
- **reCAPTCHA**: Completar para acceder

### **Funcionalidades Disponibles**

1. **Gestión de Alumnos**: Agregar, consultar, modificar, eliminar
2. **Mensajería**: Enviar/recibir mensajes internos
3. **Panel de Debug**: Monitorear seguridad del token (esquina inferior derecha)

## 🔒 Características de Seguridad

### **Almacenamiento Seguro de Tokens**

- **Cifrado AES-256** del token JWT
- **Hash SHA-256** para verificación de integridad
- **sessionStorage** en lugar de localStorage
- **Expiración automática** (24 horas)
- **Detección de tokens comprometidos**

### **Contraseñas**

- **Hashing con bcrypt** (saltRounds: 10)
- **Verificación dual** (bcrypt + fallback)
- **Actualización automática** de contraseñas no hasheadas

## 📁 Estructura del Proyecto

```
Proy_Ra/
├── back/                 # Backend (Node.js + Express)
│   ├── index.js         # Servidor principal
│   ├── package.json     # Dependencias backend
│   └── .env             # Variables de entorno (NO SUBIR)
│
├── front/               # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── components/  # Componentes React
│   │   ├── contexts/    # Context API (Auth)
│   │   ├── screens/     # Pantallas principales
│   │   ├── utils/       # Utilidades (almacenamiento seguro)
│   │   └── App.tsx      # Componente principal
│   ├── package.json     # Dependencias frontend
│   └── .env             # Variables de entorno (NO SUBIR)
│
└── README.md            # Este archivo
```

## 🛡️ Seguridad Implementada

- ✅ **Tokens JWT cifrados** - Imposibles de robar o usar
- ✅ **Contraseñas hasheadas** - Protección contra filtraciones
- ✅ **reCAPTCHA** - Protección contra bots
- ✅ **Rutas protegidas** - Acceso controlado
- ✅ **Validación backend** - Verificación en servidor
- ✅ **Headers de seguridad** - CORS configurado

## 📝 Notas de Desarrollo

- Las **claves de reCAPTCHA de prueba** funcionan solo en desarrollo
- El **Google OAuth** requiere configuración adicional para producción
- Los **archivos .env** nunca deben subirse al repositorio
- El **panel de debug** solo aparece en desarrollo

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para detalles.

## 👨‍💻 Autor

**Edmundo** - Sistema de Gestión de Alumnos con Seguridad Avanzada

---

⭐ **¡Si te gusta este proyecto, dale una estrella!** ⭐
