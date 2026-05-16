const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middlewares para procesar datos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Servir tus archivos HTML e imágenes de forma estática
app.use(express.static(__dirname));

// ==========================================
// 1. CONEXIÓN A MONGO ATLAS (FORMATO CLÁSICO ESTABLE)
// ==========================================
const MONGO_URI = "mongodb://alanperez:1234@ac-tw1ak1a-shard-00-00.neixm1k.mongodb.net:27017,ac-tw1ak1a-shard-00-01.neixm1k.mongodb.net:27017,ac-tw1ak1a-shard-00-02.neixm1k.mongodb.net:27017/?ssl=true&replicaSet=atlas-g2xmor-shard-0&authSource=admin&appName=Cluster0";

mongoose.connect(MONGO_URI)
    .then(() => console.log(">>> ¡Conexión exitosa a MongoDB Atlas! <<<"))
    .catch(err => console.error("Error conectando a la base de datos:", err));

// ==========================================
// 2. MODELOS DE LA BASE DE DATOS
// ==========================================
const UsuarioSchema = new mongoose.Schema({
    nombre: String,
    apellido: String,
    genero: String,
    pais: String,
    tipoUso: String,
    correo: { type: String, unique: true, required: true },
    telefono: String,
    pass: String
});
const Usuario = mongoose.model('Usuario', UsuarioSchema);

// ==========================================
// 3. RUTAS DEL BACKEND (APIs)
// ==========================================

// Registrar usuario (Insert / Create)
app.post('/api/auth/registro', async (req, res) => {
    try {
        const nuevoUsuario = new Usuario(req.body);
        await nuevoUsuario.save();
        res.status(201).json({ success: true, mensaje: "¡Usuario registrado en la BD con éxito!" });
    } catch (error) {
        res.status(400).json({ success: false, mensaje: "El correo ya está registrado en la BD." });
    }
});

// Iniciar sesión (Select / Read)
app.post('/api/auth/login', async (req, res) => {
    const { usuario, password } = req.body;
    const user = await Usuario.findOne({ correo: usuario, pass: password });
    
    if (user) {
        res.json({ login: true, mensaje: `¡Bienvenido de nuevo, ${user.nombre}!` });
    } else {
        res.status(401).json({ login: false, mensaje: "Usuario o contraseña incorrectos en la BD." });
    }
});

// Redirección inicial por defecto
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Regis.html'));
});

// Puerto dinámico para servidores en la nube (Render)
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`==================================================`);
    console.log(` Servidor levantado en el puerto: ${PORT}`);
    console.log(`==================================================`);
});