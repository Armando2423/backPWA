const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

dotenv.config();

// Middleware
app.use(express.json());  // Para manejar peticiones JSON
app.use(cors());          // Permitir solicitudes desde diferentes orígenes


// Conectar a MongoDB
mongoose.connect(process.env.MONGO_URI).then(() => console.log('✅ Conectado a MongoDB Atlas...'))
  .catch(err => console.error('❌ Error de conexión:', err));

// Rutas
app.use('/auth', authRoutes); 

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor en el puerto ${PORT}`);
});
