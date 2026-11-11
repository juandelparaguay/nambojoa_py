# Ñambojo'a 🏆 - Backend

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)

Ñambojo'a es una plataforma de desafíos deportivos 1 vs 1. Este repositorio contiene el backend desarrollado en un monorepo, utilizando Node.js + TypeScript + Express, con Prisma como ORM y PostgreSQL como base de datos relacional.

## 🛠️ Tecnologías Utilizadas

*   **Runtime:** Node.js (v18+)
*   **Lenguaje:** TypeScript
*   **Framework Web:** Express.js
*   **Base de Datos:** PostgreSQL (v15)
*   **ORM:** Prisma
*   **Contenedores:** Docker & Docker Compose
*   **Seguridad:** JWT, Bcrypt, Zod (validación)

---

## 📋 Requisitos Previos

Antes de empezar, asegurate de tener instalado en tu computadora:
1.  [Node.js](https://nodejs.org/es/) (versión 18 o superior).
2.  [Docker Desktop](https://www.docker.com/products/docker-desktop/) (necesario para levantar la base de datos).
3.  [Git](https://git-scm.com/) (para clonar el repositorio y control de versiones).

---

## 🚀 Guía de Instalación y Configuración (Paso a Paso)

Seguí estos pasos en orden desde tu terminal, ubicándote en la raíz del proyecto (`nambojoa/`):

### Paso 1: Levantar la Base de Datos (Docker)
El proyecto incluye un archivo `docker-compose.yml` que levanta un contenedor de PostgreSQL de forma aislada.
*Nota: El puerto expuesto está configurado en el **5431** para evitar conflictos con instalaciones locales de PostgreSQL.*
```bash
docker compose up -d
```
### Paso 2: Instalar Dependencias

El proyecto utiliza **npm workspaces** (monorepo). Este único comando instalará las dependencias de la raíz y las del backend (`apps/api`) al mismo tiempo.

```bash
npm install
```

### Paso 3: Configurar .env

El proyecto necesita variables de entorno para funcionar. Copiá el archivo de ejemplo y renombralo:

```bash
cp apps/api/.env.example apps/api/.env
```

Luego, abrí el archivo `apps/api/.env` y verificá que tenga el siguiente contenido (ajustá el puerto `5431` si es necesario):

```env
# Base de Datos (coincide con docker-compose.yml)
DATABASE_URL="postgresql://nambojoa_admin:nambojoa_password@localhost:5431/nambojoa_db?schema=public"

# Servidor
PORT=3000
NODE_ENV=development

# Seguridad
JWT_SECRET="nambojoa_secreto_super_seguro_cambiar_en_produccion"

# Configuración de la App
WHATSAPP_NUMBER="+595994706705"
```

### Paso 4: Generar el Cliente de Prisma y Migrar la Base de Datos

Este comando leerá el archivo schema.prisma, creará todas las tablas en PostgreSQL y generará el cliente tipado para TypeScript.

```bash
npm run db:migrate
```
(Si la terminal te pregunta por un nombre para la migración, escribí init y presioná Enter).

## Ejecución del Proyecto

### Iniciar el Servidor Backend

Para levantar el servidor en modo desarrollo (se reinicia automáticamente al guardar cambios):
```bash
npm run dev:api
```
El servidor estará disponible en: (http://localhost:3000)

### Probar que el servidor funciona

Abrí tu navegador y andá a: (http://localhost:3000/api/health)
Deberías ver un JSON de respuesta confirmando que todo está OK.
Visualizar la Base de Datos (Prisma Studio)

Si querés ver los datos guardados en las tablas (usuarios, duelos, etc.) de forma gráfica y amigable:

```bash
npm run db:studio
```
Se abrirá una interfaz web en `http://localhost:5555`.
🧪 Cómo probar la API (Módulo de Autenticación)

Para probar los endpoints, podés usar Postman, Insomnia o la extensión Thunder Client en VS Code.
1. Registrar un Usuario (Register)

* Método: `POST`

* URL: `http://localhost:3000/api/auth/register`

* Body (JSON):

```json

{
  "username": "carlos",
  "password": "1234"
}
```

 **Respuesta Esperada**: Código `201` Created con un JSON que incluye un token de acceso.

2. Iniciar Sesión (Login)

* Método: POST

* URL: http://localhost:3000/api/auth/login

* Body (JSON):

```json

{
  "username": "carlos",
  "password": "1234"
}
```
**Respuesta Esperada:** Código `200` OK con el token de acceso y los datos básicos del usuario.

### Configuración del Administrador

En esta etapa inicial, nadie es administrador por defecto. Para poder acceder al panel de admin en el futuro, necesitás darle permisos a un usuario:

1. Asegurate de tener el servidor y Docker corriendo.
2. Ejecutá npm run db:studio en una nueva terminal.
3. Abrí la pestaña User en la interfaz web que se abre.
4. Buscá el usuario que registraste (ej: "carlos").
5. En la columna isAdmin, cambiá el valor a true.
6. Guardá los cambios (botón Save 1 change).

**¡Listo!** Ese usuario ahora tiene permisos de administrador para las futuras rutas.