// Importamos los dos módulos de NPM necesarios para trabajar
const express = require("express");
const cors = require("cors");

const mysql = require("mysql2/promise");

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
    host: "127.0.0.1",
    database: "music_manager",
    user: "jennifer",
    password: "Simba&Nala82",
    port: 3307,
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

// RECUPERAR UN  USUARIO
server.get("/api/songs/:songId", async (req, res) => {
  let queryOneSong = "SELECT * FROM songs where id = ?";

  const connection = await getConnection();
  const [results] = await connection.query(queryOneSong, [req.params.songId]);

  await connection.end();
  if (results.length === 0) return res.status(404).json({ error: "No existe" });
  return res.json(results[0]);
});

// RECUPERAR TODOS LOS USUARIOS
server.get("/api/songs", async (req, res) => {
  let queryAllSongs = "SELECT * FROM songs";

  const connection = await getConnection();
  const [results] = await connection.query(queryAllSongs);
  await connection.end();

  res.json(results);
});
