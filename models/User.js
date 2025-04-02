const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  suscripcion: {
    type: Object,
    default: {} // Asegura que el campo siempre exista aunque esté vacío
  }
});

module.exports = mongoose.model('users', UserSchema, 'Users');
