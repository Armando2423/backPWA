const express = require('express');
const bcrypt = require('bcrypt');
const { sendPush, sends } = require('../sendPush.js');
const suscription = require('../models/suscription.js');
const User = require('../models/User');

const router = express.Router();
// web push
const webpush = require("web-push");
const keysPath = path.resolve("../keys.json");
const keys = JSON.parse(readFileSync(keysPath, "utf-8"));

webpush.setVapidDetails(
  'mailto:sergio.reyes.21m@utzmg.edu.mx',
  keys.publicKey,
  keys.privateKey
);



// 📌 Función auxiliar para buscar usuario por email
const findUserByEmail = async (email) => {
  return await User.findOne({ email });
};


// Registrar usuario
router.post('/register', async (req, res) => {
  const { nombre, email, password } = req.body;

  try {
    if (!nombre || !email || !password) {
      return res.status(400).json({ message: 'Nombre, correo y contraseña son requeridos' });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'El correo ya está registrado' });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ nombre, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: 'Usuario registrado exitosamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al registrar usuario', error: err.message });
  }
});


// Iniciar sesión
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Usuario no encontrado' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Contraseña incorrecta' });

    res.json({ message: 'Login exitoso', user});
  } catch (err) {
    res.status(500).json({ message: 'Error en el servidor', error: err.message });
  }
});

// Obtener lista de usuarios
router.get('/users', async (req, res) => {
  try {
    const userList = await User.find({}, 'id email nombre suscripcion');
    res.status(200).json(userList);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los usuarios', error: error.message });
  }
});

// Actualizar la suscripción del usuario
router.post('/suscripcion', async (req, res) => {
  console.log('Solicitud para /suscripcion recibida');
  const { userId, suscripcion } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      userId, 
      { suscripcion},
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Enviar notificación de prueba
    await sendPush(suscripcion, user.email);

    res.status(200).json({ message: 'Suscripción actualizada en el usuario', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 📌 Enviar notificación PUSH a un usuario por email
router.post('/send_subscription', async (req, res) => {
  const { email, title, body } = req.body;

  try {
    // 🔍 Buscar usuario en la BD
    const user = await findUserByEmail(email);
    if (!user || !user.suscripcion) {
      return res.status(404).json({ error: "Usuario no encontrado o sin suscripción" });
    }

    const payload = JSON.stringify({ title, body });

    await webpush.sendNotification(user.suscripcion, payload);

    res.status(200).json({ success: true, message: "Notificación enviada" });
  } catch (err) {
    res.status(500).json({ error: "Error al enviar la notificación", details: err.message });
  }
});


// Enviar notificación con la suscripción del usuario
router.post('/suscripcionMod', async (req, res) => {
  const { suscripcion, mensaje } = req.body;

  try {
    await sends(suscripcion, mensaje);

    res.status(200).json({ message: 'Mensaje enviado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
