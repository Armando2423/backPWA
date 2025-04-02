const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  suscripcion: {
    endpoint: {
      type: String,
      required: true // Asegura que siempre haya un endpoint válido
    },
    expireTime: {
      type: Date  
    },
    keys: {
      p256dh: {
        type: String,
        required: true  
      },
      auth: {
        type: String,
        required: true
      }
    }
  }
});

module.exports = mongoose.model('Subscription', SubscriptionSchema , 'suscripciones');
