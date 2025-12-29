// Importamos los dos módulos de NPM necesarios para trabajar
const express = require("express");
const cors = require("cors");

const mysql = require("mysql2/promise");

require("dotenv").config();

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

  console.log(
    `Conexión establecida con la base de datos (identificador=${connection.threadId})`
  );

  return connection;
}

/******************
ENDPOINTS
*******************/

// RECUPERAR UNA  CANCIÓN
server.get("/api/songs/:songId", async (req, res) => {
  const songId = Number(req.params.songId);

  if (!Number.isInteger(songId)) {
    return res.status(400).json({
      success: false,
      error: "No es un ID válido",
    });
  }
  let queryOneSong = "SELECT * FROM songs where id = ?;";
  let connection;
  try {
    connection = await getConnection();
    const [results] = await connection.query(queryOneSong, [req.params.songId]);

    if (results.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Esa canción no existe" });
    }

    return res.json(results[0]);
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

  if (!Number.isInteger(Number(req.body.release_year))) {
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
