import mysql from "mysql2";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import axios from "axios";
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Clave secreta para JWT
const JWT_SECRET =
  process.env.JWT_SECRET || "tu_clave_secreta_super_segura_2024";

const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "Edmundo1996",
  database: process.env.DB_NAME || "alumnos",
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});
app.use(bodyParser.json());
app.use(cors());

//Rutas
app.get("/", (req, res) => {
  res.send("¡Hola, mundoo!");
});

// Middleware para verificar token JWT
const verificarToken = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({
      status: 401,
      mensaje: "Acceso denegado. Token requerido.",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    res.status(400).json({
      status: 400,
      mensaje: "Token inválido.",
    });
  }
};

// Ruta de login
app.post("/login", async (req, res) => {
  const { matricula, contraseña, captcha } = req.body;

  console.log("Datos recibidos:", {
    matricula,
    contraseña: "***",
    captcha: captcha ? "presente" : "ausente",
  });

  if (!matricula || !contraseña) {
    return res.status(400).json({
      status: 400,
      mensaje: "Matrícula y contraseña son requeridos",
    });
  }

  // Validar captcha (opcional - puedes comentar esta validación si usas clave de prueba)
  if (captcha && process.env.RECAPTCHA_SECRET_KEY) {
    try {
      const captchaResponse = await axios.post(
        "https://www.google.com/recaptcha/api/siteverify",
        null,
        {
          params: {
            secret: process.env.RECAPTCHA_SECRET_KEY,
            response: captcha,
          },
        }
      );

      if (!captchaResponse.data.success) {
        return res.status(400).json({
          status: 400,
          mensaje: "Captcha inválido",
        });
      }
    } catch (error) {
      console.log("Error validando captcha:", error.message);
      // En desarrollo, puedes continuar sin validar captcha
    }
  }

  const sql =
    "SELECT matricula, nombre, aPaterno, aMaterno, contrasenha FROM alumnos WHERE matricula = ?";

  console.log("Ejecutando query para matrícula:", matricula);

  db.query(sql, [matricula], async (err, result) => {
    if (err) {
      console.log("Error en query:", err.message);
      return res.status(500).json({
        status: 500,
        mensaje: "Error en el servidor",
        error: err.message,
      });
    }

    console.log(
      "Resultado de query:",
      result.length > 0 ? "Usuario encontrado" : "Usuario no encontrado"
    );

    if (result.length === 0) {
      return res.status(401).json({
        status: 401,
        mensaje: "Credenciales inválidas",
      });
    }

    const usuario = result[0];
    console.log("Usuario obtenido:", {
      matricula: usuario.matricula,
      nombre: usuario.nombre,
    });

    // Verificar contraseña (si está hasheada usar bcrypt, si no, comparación directa)
    let contraseñaValida = false;

    try {
      // Intentar verificar con bcrypt primero
      contraseñaValida = await bcrypt.compare(contraseña, usuario.contrasenha);
      console.log("Verificación bcrypt:", contraseñaValida);

      // Si bcrypt devuelve false, podría ser que la contraseña no esté hasheada
      if (!contraseñaValida) {
        console.log("Bcrypt falló, intentando comparación directa");
        contraseñaValida = contraseña === usuario.contrasenha;
        console.log("Comparación directa:", contraseñaValida);
      }
    } catch (bcryptError) {
      console.log("Error en bcrypt, usando comparación directa");
      // Si falla bcrypt, comparar directamente (para contraseñas no hasheadas)
      contraseñaValida = contraseña === usuario.contrasenha;
      console.log("Comparación directa tras error:", contraseñaValida);
    }

    if (!contraseñaValida) {
      console.log("Contraseña inválida");
      return res.status(401).json({
        status: 401,
        mensaje: "Credenciales inválidas",
      });
    }

    console.log("Login exitoso para usuario:", usuario.matricula);

    // Generar token JWT
    const token = jwt.sign(
      {
        matricula: usuario.matricula,
        nombre: usuario.nombre,
        aPaterno: usuario.aPaterno,
        aMaterno: usuario.aMaterno,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      status: 200,
      mensaje: "Login exitoso",
      token,
      usuario: {
        matricula: usuario.matricula,
        nombre: usuario.nombre,
        aPaterno: usuario.aPaterno,
        aMaterno: usuario.aMaterno,
      },
    });
  });
});

// Ruta para verificar si el token es válido
app.get("/verificar-token", verificarToken, (req, res) => {
  res.json({
    status: 200,
    mensaje: "Token válido",
    usuario: req.usuario,
  });
});

// Ruta de login con Google OAuth
app.post("/google-login", async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({
      status: 400,
      mensaje: "Token de Google requerido",
    });
  }

  try {
    // Verificar el token de Google
    const response = await axios.get(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${credential}`
    );
    const googleUser = response.data;

    if (!googleUser.email_verified) {
      return res.status(401).json({
        status: 401,
        mensaje: "Email no verificado por Google",
      });
    }

    // Buscar o crear usuario basado en el email de Google
    const email = googleUser.email;
    const nombre = googleUser.given_name || "";
    const apellido = googleUser.family_name || "";

    // Primero verificar si el usuario existe por email
    const sqlBuscar = "SELECT * FROM alumnos WHERE aCorreo = ?";

    db.query(sqlBuscar, [email], (err, result) => {
      if (err) {
        return res.status(500).json({
          status: 500,
          mensaje: "Error en el servidor",
          error: err.message,
        });
      }

      let usuario;

      if (result.length > 0) {
        // Usuario existe
        usuario = result[0];
      } else {
        // Crear nuevo usuario con datos de Google
        const matriculaGoogle = `GOOGLE_${Date.now()}`;
        const sqlCrear = `INSERT INTO alumnos (matricula, nombre, aPaterno, aCorreo, contrasenha) VALUES (?, ?, ?, ?, ?)`;

        db.query(
          sqlCrear,
          [matriculaGoogle, nombre, apellido, email, "GOOGLE_AUTH"],
          (errCrear, resultCrear) => {
            if (errCrear) {
              return res.status(500).json({
                status: 500,
                mensaje: "Error al crear usuario",
                error: errCrear.message,
              });
            }

            usuario = {
              matricula: matriculaGoogle,
              nombre: nombre,
              aPaterno: apellido,
              aMaterno: "",
              aCorreo: email,
            };

            generarTokenYResponder(usuario, res);
          }
        );
        return;
      }

      generarTokenYResponder(usuario, res);
    });
  } catch (error) {
    console.error("Error verificando token de Google:", error);
    return res.status(401).json({
      status: 401,
      mensaje: "Token de Google inválido",
    });
  }
});

// Función auxiliar para generar token y enviar respuesta
function generarTokenYResponder(usuario, res) {
  const token = jwt.sign(
    {
      matricula: usuario.matricula,
      nombre: usuario.nombre,
      aPaterno: usuario.aPaterno,
      aMaterno: usuario.aMaterno || "",
    },
    JWT_SECRET,
    { expiresIn: "24h" }
  );

  res.json({
    status: 200,
    mensaje: "Login con Google exitoso",
    token,
    usuario: {
      matricula: usuario.matricula,
      nombre: usuario.nombre,
      aPaterno: usuario.aPaterno,
      aMaterno: usuario.aMaterno || "",
    },
  });
}

// Ruta para obtener todos los alumnos (protegida)
app.get("/alumno", verificarToken, (req, res) => {
  const sql = "SELECT * FROM alumnos";
  db.query(sql, (err, result, fields) => {
    if (!err) {
      res.send({
        status: 200,
        result,
      });
    } else {
      res.send({
        status: 100,
        err,
      });
    }
  });
});

// Ruta para obtener un alumno por matrícula
app.get("/alumno/traer/:matricula", verificarToken, (req, res) => {
  const { matricula } = req.params;
  const sqlGet = "SELECT * FROM alumnos WHERE matricula = ?";
  db.query(sqlGet, [matricula], (err, result) => {
    if (!err) {
      res.send({
        status: 200,
        result,
      });
    } else {
      res.send({
        status: 100,
        errNo: err.errno,
        mensaje: err.message,
        codigo: err.code,
      });
    }
  });
});

//Ruta para traer alumnos por nombre
app.get("/alumnos/traer/:nombre", verificarToken, (req, res) => {
  const nombre = req.params.nombre.trim();
  const sqlGet = "SELECT * FROM alumnos WHERE nombre LIKE ?";
  db.query(sqlGet, [`%${nombre}%`], (err, result) => {
    if (!err) {
      res.send({
        status: 200,
        result,
      });
    } else {
      res.send({
        status: 100,
        err,
      });
    }
  });
});

// Ruta para agregar un nuevo alumno
app.post("/alumno/agregar", verificarToken, async (req, res) => {
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
    foto = null, // Asignar null por defecto si no se proporciona
  } = req.body;

  try {
    // Hashear la contraseña antes de guardarla
    console.log("🔐 Hasheando contraseña...");
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(contraseña, saltRounds);
    console.log("✅ Contraseña hasheada exitosamente");

    const sql = `INSERT INTO alumnos (matricula, aPaterno, aMaterno, nombre, sexo, dCalle, dNumero, dColonia, dCodigoPostal, aTelefono, aCorreo, aFacebook, aInstagram, tipoSangre, nombreContacto, telefonoContacto, contrasenha, foto) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

    db.query(
      sql,
      [
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
        hashedPassword, // Usar la contraseña hasheada
        foto,
      ],
      (err, result) => {
        if (err) {
          console.error("Error al insertar el alumno:", err);
          res.send({
            status: 100,
            errNo: err.errno,
            mensaje: err.message,
            codigo: err.code,
          });
        } else {
          console.log("✅ Alumno agregado con contraseña hasheada");
          res.send({
            status: 200,
            result,
          });
        }
      }
    );
  } catch (error) {
    console.error("❌ Error al hashear contraseña:", error);
    res.status(500).send({
      status: 500,
      mensaje: "Error interno del servidor",
      error: error.message,
    });
  }
});

app.post("/alumno/modificar", verificarToken, async (req, res) => {
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
  } = req.body;

  try {
    // Si se proporciona una nueva contraseña, hashearla
    let hashedPassword = null;
    if (contraseña && contraseña.trim() !== "") {
      console.log("🔐 Hasheando nueva contraseña para modificar alumno...");
      const saltRounds = 10;
      hashedPassword = await bcrypt.hash(contraseña, saltRounds);
      console.log("✅ Nueva contraseña hasheada exitosamente");
    }

    // Si se proporciona nueva contraseña, actualizar todo incluyendo contraseña
    // Si no, actualizar todo excepto contraseña
    let sql, values;

    if (hashedPassword) {
      sql = `UPDATE alumnos SET aPaterno = ?, aMaterno = ?, nombre = ?, sexo = ?, dCalle = ?, dNumero = ?, dColonia = ?, dCodigoPostal = ?, aTelefono = ?, aCorreo = ?, aFacebook = ?, aInstagram = ?, aTipoSangre = ?, nombreContacto = ?, telefonoContacto = ?, contrasenha = ? WHERE matricula = ?`;
      values = [
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
        hashedPassword,
        matricula,
      ];
    } else {
      sql = `UPDATE alumnos SET aPaterno = ?, aMaterno = ?, nombre = ?, sexo = ?, dCalle = ?, dNumero = ?, dColonia = ?, dCodigoPostal = ?, aTelefono = ?, aCorreo = ?, aFacebook = ?, aInstagram = ?, aTipoSangre = ?, nombreContacto = ?, telefonoContacto = ? WHERE matricula = ?`;
      values = [
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
        matricula,
      ];
    }

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("Error al modificar el alumno:", err);
        res.send({
          status: 100,
          errNo: err.errno,
          mensaje: err.message,
          codigo: err.code,
        });
      } else {
        console.log("✅ Alumno modificado exitosamente");
        res.send({
          status: 200,
          result,
        });
      }
    });
  } catch (error) {
    console.error("❌ Error al hashear contraseña en modificar:", error);
    res.status(500).send({
      status: 500,
      mensaje: "Error interno del servidor",
      error: error.message,
    });
  }
});

// Ruta para eliminar un alumno por matrícula
app.delete("/alumno/eliminar", verificarToken, (req, res) => {
  const { matricula } = req.body;
  const sql = "DELETE FROM alumnos WHERE matricula = ?";
  db.query(sql, [matricula], (err, result) => {
    if (!err) {
      res.send({
        status: 200,
        result,
      });
    } else {
      res.send({
        status: 100,
        errNo: err.errno,
        mensaje: err.message,
        codigo: err.code,
      });
    }
  });
});

// ==================== ENDPOINTS DE MENSAJES ====================

// Ruta para obtener todos los mensajes de un usuario (recibidos)
app.get("/mensajes/recibidos", verificarToken, (req, res) => {
  const matricula = req.usuario.matricula;

  const sql = `
    SELECT m.*,
           e.nombre as emisor_nombre,
           e.aPaterno as emisor_paterno,
           e.aMaterno as emisor_materno
    FROM mensajes m
    JOIN alumnos e ON m.emisor_matricula = e.matricula
    WHERE m.receptor_matricula = ?
    ORDER BY m.fecha_envio DESC
  `;

  db.query(sql, [matricula], (err, result) => {
    if (err) {
      console.error("Error al obtener mensajes recibidos:", err);
      res.status(500).send({
        status: 500,
        mensaje: "Error al obtener mensajes",
        error: err.message,
      });
    } else {
      res.send({
        status: 200,
        mensajes: result,
      });
    }
  });
});

// Ruta para obtener mensajes enviados por un usuario
app.get("/mensajes/enviados", verificarToken, (req, res) => {
  const matricula = req.usuario.matricula;

  const sql = `
    SELECT m.*,
           r.nombre as receptor_nombre,
           r.aPaterno as receptor_paterno,
           r.aMaterno as receptor_materno
    FROM mensajes m
    JOIN alumnos r ON m.receptor_matricula = r.matricula
    WHERE m.emisor_matricula = ?
    ORDER BY m.fecha_envio DESC
  `;

  db.query(sql, [matricula], (err, result) => {
    if (err) {
      console.error("Error al obtener mensajes enviados:", err);
      res.status(500).send({
        status: 500,
        mensaje: "Error al obtener mensajes enviados",
        error: err.message,
      });
    } else {
      res.send({
        status: 200,
        mensajes: result,
      });
    }
  });
});

// Ruta para enviar un nuevo mensaje
app.post("/mensajes/enviar", verificarToken, (req, res) => {
  const { receptor_matricula, asunto, mensaje } = req.body;
  const emisor_matricula = req.usuario.matricula;

  if (!receptor_matricula || !asunto || !mensaje) {
    return res.status(400).json({
      status: 400,
      mensaje: "Receptor, asunto y mensaje son requeridos",
    });
  }

  // Verificar que el receptor existe
  const verificarReceptor = "SELECT matricula FROM alumnos WHERE matricula = ?";
  db.query(verificarReceptor, [receptor_matricula], (err, result) => {
    if (err) {
      console.error("Error al verificar receptor:", err);
      return res.status(500).send({
        status: 500,
        mensaje: "Error del servidor",
        error: err.message,
      });
    }

    if (result.length === 0) {
      return res.status(404).json({
        status: 404,
        mensaje: "El usuario receptor no existe",
      });
    }

    // Insertar el mensaje
    const insertarMensaje = `
      INSERT INTO mensajes (emisor_matricula, receptor_matricula, asunto, mensaje)
      VALUES (?, ?, ?, ?)
    `;

    db.query(
      insertarMensaje,
      [emisor_matricula, receptor_matricula, asunto, mensaje],
      (err, result) => {
        if (err) {
          console.error("Error al enviar mensaje:", err);
          res.status(500).send({
            status: 500,
            mensaje: "Error al enviar mensaje",
            error: err.message,
          });
        } else {
          res.send({
            status: 200,
            mensaje: "Mensaje enviado exitosamente",
            id_mensaje: result.insertId,
          });
        }
      }
    );
  });
});

// Ruta para marcar un mensaje como leído
app.put("/mensajes/:id/marcar-leido", verificarToken, (req, res) => {
  const mensajeId = req.params.id;
  const matricula = req.usuario.matricula;

  const sql = `
    UPDATE mensajes
    SET leido = TRUE
    WHERE id = ? AND receptor_matricula = ?
  `;

  db.query(sql, [mensajeId, matricula], (err, result) => {
    if (err) {
      console.error("Error al marcar mensaje como leído:", err);
      res.status(500).send({
        status: 500,
        mensaje: "Error al actualizar mensaje",
        error: err.message,
      });
    } else {
      if (result.affectedRows === 0) {
        res.status(404).send({
          status: 404,
          mensaje: "Mensaje no encontrado o no autorizado",
        });
      } else {
        res.send({
          status: 200,
          mensaje: "Mensaje marcado como leído",
        });
      }
    }
  });
});

// Ruta para obtener lista de usuarios para enviar mensajes
app.get("/usuarios/lista", verificarToken, (req, res) => {
  const matriculaActual = req.usuario.matricula;

  const sql = `
    SELECT matricula, nombre, aPaterno, aMaterno
    FROM alumnos
    WHERE matricula != ?
    ORDER BY nombre, aPaterno
  `;

  db.query(sql, [matriculaActual], (err, result) => {
    if (err) {
      console.error("Error al obtener lista de usuarios:", err);
      res.status(500).send({
        status: 500,
        mensaje: "Error al obtener usuarios",
        error: err.message,
      });
    } else {
      res.send({
        status: 200,
        usuarios: result,
      });
    }
  });
});

// Ruta para obtener el conteo de mensajes no leídos
app.get("/mensajes/no-leidos/count", verificarToken, (req, res) => {
  const matricula = req.usuario.matricula;

  const sql =
    "SELECT COUNT(*) as count FROM mensajes WHERE receptor_matricula = ? AND leido = FALSE";

  db.query(sql, [matricula], (err, result) => {
    if (err) {
      console.error("Error al contar mensajes no leídos:", err);
      res.status(500).send({
        status: 500,
        mensaje: "Error al contar mensajes",
        error: err.message,
      });
    } else {
      res.send({
        status: 200,
        count: result[0].count,
      });
    }
  });
});

app.all("/*splat", (req, res) => {
  res.send("La ruta no existe");
});

//Iniciar servidor
app.listen(port, () => {
  db.getConnection((err, connection) => {
    if (err) {
      console.error("❌ Error al obtener conexión del pool:", err.message);
    } else {
      console.log("✅ Conexión establecida exitosamente.");
      connection.release(); // ¡Siempre libera la conexión!
    }
  });

  console.log(`Servidor escuchando en http://localhost:${port}`);
});
