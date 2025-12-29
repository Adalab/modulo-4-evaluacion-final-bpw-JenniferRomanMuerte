// Importamos los dos módulos de NPM necesarios para trabajar
const express = require("express");
const cors = require("cors");
const path = require("path");

// Importar la biblioteca de MySQL

const mysql = require("mysql2/promise");

// Importamos la biblioteca de variables de entorno

require("dotenv").config();

// Importamos la biblioteca de contraseñas

const bcrypt = require("bcrypt");
const saltRounds = 10;

// Importamos la biblioteca de tokens
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

// ----------  SECCION DE CONFIGURACIÓN DE EXPRESS  ----------

// Creamos el servidor
const server = express();

// Configuramos el servidor
server.use(cors());
server.use(express.json({ limit: "25mb" }));

// Arrancamos el servidor en el puerto 3000
const serverPort = 3000;
server.listen(serverPort, () => {
  console.log(`Server listening at http://localhost:${serverPort}`);
});

// Configuracion servidor estático
server.use(express.static(path.join(__dirname, '..', 'public')));

// Conexion a la BBDD
async function getConnection() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || "127.0.0.1",
    port: process.env.MYSQL_PORT || 3307,
    user: process.env.MYSQL_USER || "jennifer",
    password: process.env.MYSQL_PASSWORD || "Simba&Nala82",
    database: process.env.MYSQL_SCHEMA || "music_manager",
  });
  await connection.connect();

  return connection;
}

/******************
ENDPOINTS
*******************/

// RECUPERAR UNA  CANCIÓN
server.get("/api/songs/:songId", async (req, res) => {
  if (isNaN(parseInt(req.params.songId))) {
    return res.status(400).json({
      success: false,
      error: "No es un ID válido",
    });
  }
  let queryOneSong =
    "SELECT s.*, a.id AS author_id, a.name, a.lastname, a.age FROM songs AS s JOIN authors_songs AS au_so ON au_so.song_id = s.id JOIN authors AS a ON a.id = au_so.author_id WHERE s.id = ?;";
  let connection;
  try {
    connection = await getConnection();
    const [results] = await connection.query(queryOneSong, [req.params.songId]);

    if (results.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Esa canción no existe" });
    }

    const song = {
      id: results[0].id,
      title: results[0].title,
      release_year: results[0].release_year,
      authors: results.map((author) => ({
        id: author.author_id,
        name: author.name,
        lastname: author.lastname,
        age: author.age,
      })),
    };
    return res.json(song);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Error al recuperar la canción.",
    });
  } finally {
    if (connection) await connection.end();
  }
});

// RECUPERAR TODAS LAS CANCIONES
server.get("/api/songs", async (req, res) => {
  let queryAllSongs = "SELECT * FROM songs;";

  let connection;

  try {
    connection = await getConnection();
    const [results] = await connection.query(queryAllSongs);
    return res.json(results);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Error al recuperar las canciones.",
    });
  } finally {
    if (connection) await connection.end();
  }
});

// INSERTAR UNA CANCION
server.post("/api/songs", async (req, res) => {
  if (!req.body.title) {
    return res.status(400).json({
      success: false,
      error: "El campo 'title' es obligatorio",
    });
  }

  if (isNaN(parseInt(req.body.release_year))) {
    return res.status(400).json({
      success: false,
      error: "El campo del año debe ser un entero",
    });
  }

  let queryInsertSong = "INSERT INTO songs (title, release_year) VALUES (?,?);";

  let connection;

  try {
    connection = await getConnection();
    const [result] = await connection.query(queryInsertSong, [
      req.body.title,
      req.body.release_year,
    ]);

    return res.json({
      success: true,
      id: result.insertId,
      msg: "La canción se ha insertado correctamente",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Error al insertar la canción en la base de datos.",
    });
  } finally {
    if (connection) await connection.end();
  }
});

// ACTUALIZAR UNA CANCIÓN
server.put("/api/songs/:songId", async (req, res) => {
  if (isNaN(parseInt(req.params.songId))) {
    return res.status(400).json({
      success: false,
      error: "No es un ID válido",
    });
  }

  if (!req.body.title) {
    return res.status(400).json({
      success: false,
      error: "El campo 'title' es obligatorio",
    });
  }

  if (isNaN(parseInt(req.body.release_year))) {
    return res.status(400).json({
      success: false,
      error: "El campo del año debe ser un entero",
    });
  }

  let queryUpdatetSong =
    "UPDATE songs  SET title = ?, release_year= ? WHERE id = ?;";

  let connection;

  try {
    connection = await getConnection();
    const [result] = await connection.query(queryUpdatetSong, [
      req.body.title,
      req.body.release_year,
      req.params.songId,
    ]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, error: "La cancion no existe" });
    }

    return res.json({
      success: true,
      msg: "La canción se ha actualizado correctamente",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Error al actualizar la canción en la base de datos.",
    });
  } finally {
    if (connection) await connection.end();
  }
});

// BORRAR UNA CANCIÓN
server.delete("/api/songs/:songId", async (req, res) => {
  if (isNaN(parseInt(req.params.songId))) {
    return res.status(400).json({
      success: false,
      error: "No es un ID válido",
    });
  }

  let queryDeletetSong = "DELETE FROM songs WHERE id = ? LIMIT 1;";

  let connection;

  try {
    connection = await getConnection();
    const [result] = await connection.query(queryDeletetSong, [
      req.params.songId,
    ]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, error: "La cancion no existe" });
    }

    return res.json({
      success: true,
      msg: "La canción se ha eliminado correctamente",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Error al eliminar la canción en la base de datos.",
    });
  } finally {
    if (connection) await connection.end();
  }
});

/*****************************
ENDPOINTS PARA REGISTRO Y LOGIN
*******************************/

server.post("/api/user/register", async (req, res) => {
  // Compobar los datos que me envían
  if (!req.body.email) {
    return res.status(401).json({
      success: false,
      error: "Falta el email",
    });
  }
  if (!req.body.pass) {
    return res.status(401).json({
      success: false,
      error: "Falta el pass",
    });
  }

  let connection;
  try {
    connection = await getConnection();

    // Comprobamos si ya existe una usuaria con ese email
    const queryIsEmail = `
    SELECT * FROM users WHERE email = ?
  `;

    const [resultsIsEmail] = await connection.query(queryIsEmail, [
      req.body.email,
    ]);

    // Si existe informamos
    if (resultsIsEmail.length > 0) {
      return res.status(401).json({
        success: false,
        error: "La usuaria ya existe",
      });
    }

    // Creamos la consulta
    const insertOneUser = `
    INSERT INTO users (name, lastname, email, password)
      VALUES (?, ?, ?, ?);`;

    // Creamos la contraseña encriptada
    const passEncrypted = await bcrypt.hash(req.body.pass, saltRounds);

    // Lanzamos la consulta con los datos
    const [result] = await connection.execute(insertOneUser, [
      req.body.name,
      req.body.lastname,
      req.body.email,
      passEncrypted,
    ]);

    // Si ha habido una columna afectada es correcto devolvemos el id
    if (result.affectedRows === 1) {
      return res.json({
        success: true,
        user_id: result.insertId,
      });
    }
    // Si falla informamos
    return res.json({
      success: false,
      error: "No se pudo añadir la usuaria a la bbdd",
    });
  } catch {
    return res.status(500).json({
      success: false,
      error: "Error al crear el usuario en la base de datos.",
    });
  } finally {
    if (connection) await connection.end();
  }
});

server.post("/api/user/login", async (req, res) => {
  // Compobar los datos que me envían
  if (!req.body.email) {
    return res.status(400).json({
      success: false,
      error: "Falta el email",
    });
  }
  if (!req.body.pass) {
    return res.status(400).json({
      success: false,
      error: "Falta el pass",
    });
  }

  let connection;

  try {
    connection = await getConnection();

    const queryVerifyUserByEmail = `
    SELECT *
      FROM users
      WHERE email = ?;`;

    const [resultsVerify] = await connection.query(queryVerifyUserByEmail, [
      req.body.email,
    ]);

    if (resultsVerify.length !== 1) {
      // No existe usuaria con el email que nos envían en el body

      return res.status(401).json({
        success: false,
        error: "Email o contraseña incorrectas",
      });
    }

    const userFind = resultsVerify[0];

    // usuariaEncontrada.contraseña === req.body.pass
    if (await bcrypt.compare(req.body.pass, userFind.password)) {
      // Las contraseñas coinciden

      const dataToken = {
        id: userFind.id,
        nombre: userFind.name,
        email: userFind.email,
      };

      const tokenJWT = jwt.sign(dataToken, jwtSecret);

      return res.json({
        success: true,
        token: tokenJWT,
      });
    }
    // Las contraseñas no coinciden
    return res.status(401).json({
      success: false,
      error: "Email o contraseña incorrectas",
    });
  } catch {
    return res.status(500).json({
      success: false,
      error: "Error al recuperar al usuario.",
    });
  } finally {
    if (connection) await connection.end();
  }
});



/*****************************
ENDPOINTS PARA RUTAS NO ENCONTRADAS
*******************************/
server.get(/.*/, (req,res)=>{
  const notFoundPageRelativePath = "../public/notFound.html";
  const notFoundPageAbsolutePath = path.join(__dirname, notFoundPageRelativePath);
  res.status(404).sendFile(notFoundPageAbsolutePath);

});