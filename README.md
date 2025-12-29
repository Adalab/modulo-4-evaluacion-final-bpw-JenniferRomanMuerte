# Music Manager API

API REST en Node.js (Express) para gestionar canciones y autenticación de usuarias (registro/login), usando MySQL.

## Requisitos

- Node.js + npm
- MySQL/MariaDB

## Instalación

```bash
npm install
```

## Base de datos

1. Crea una base de datos llamada `music_manager`.
2. Importa el dump incluido en `BBDD/music_manager.sql`.

Ejemplo (ajusta host/puerto/usuario según tu entorno):

```bash
mysql -h 127.0.0.1 -P 3307 -u jennifer -p music_manager < BBDD/music_manager.sql
```

## Variables de entorno

Este proyecto usa `.env` (ver `.env` en la raíz). Variables:

- `MYSQL_HOST`
- `MYSQL_PORT`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `MYSQL_SCHEMA`
- `JWT_SECRET`

## Arrancar el servidor

```bash
npm start
```

Servidor en `http://localhost:3000`.

## Frontend (archivos estáticos)

La app sirve el frontend (HTML/CSS/JS) como archivos estáticos desde la carpeta `public/` usando Express.

- Local: abre `http://localhost:3000` (la API queda bajo `/api/...`)
- Producción (Render): `https://modulo-4-evaluacion-final-bpw-b1ee.onrender.com`

## Endpoints

### Songs

- `GET /api/songs` → lista de canciones
- `GET /api/songs/:songId` → detalle de una canción con autoras
- `POST /api/songs` → crear canción (`title`, `release_year`)
- `PUT /api/songs/:songId` → actualizar canción (`title`, `release_year`)
- `DELETE /api/songs/:songId` → borrar canción

### Auth

- `POST /api/user/register` → registro (`email`, `pass`, opcional `name`, `lastname`)
- `POST /api/user/login` → login (`email`, `pass`) devuelve `{ token }`

## Swagger / OpenAPI

La especificación OpenAPI está en `swagger.json`.

- Puedes abrirla en Swagger Editor (importando el JSON).
- Si quieres servirla con Swagger UI, puedes montarla en Express (la dependencia `swagger-ui-express` ya está en `package.json`).
