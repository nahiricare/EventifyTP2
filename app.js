import express from "express";
import mongoose from "mongoose";
import "./src/config/database.js"; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "src/views"));

// NAHIR -> Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));

// NAHIR -> Middleware personalizado para logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// NAHIR -> Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("error", {
    titulo: "Error del Servidor",
    mensaje:
      process.env.NODE_ENV !== "production"
        ? err.message
        : "Ha ocurrido un error interno",
  });
});

// NAHIR -> Middleware para rutas no encontradas
app.use((req, res) => {
  res.status(404).render("error", {
    titulo: "Página no encontrada",
    mensaje: "La página que buscas no existe",
  });
});


const server = app.listen(PORT, () => {
  console.log(` Servidor de Eventify corriendo en http://localhost:${PORT}`);
});

/*
 * apagado ordenado del servidor
 */
const gracefulShutdown = () => {
  console.log("...Recibida señal de apagado (SIGINT/SIGTERM), cerrando servidor ordenadamente...");

  // 1. Dejar de aceptar nuevas conexiones
  server.close(() => {
    console.log("Servidor Express cerrado.");

    // 2. Cerrar la conexión de Mongoose 
    mongoose.connection.close(false, () => {
      console.log("Conexión de Mongoose cerrada.");
      process.exit(0);
    });
  });
};

process.on("SIGTERM", gracefulShutdown); // Señal de apagado 
process.on("SIGINT", gracefulShutdown); // Señal de interrupción 

export default app;