const webpush = require("web-push");
const { readFileSync } = require("fs");
const path = require("path");
const { error } = require("console");   

// Configuración de Web Push con variables de entorno
const keysPath = path.resolve("keys.json");
const keys = JSON.parse(readFileSync(keysPath, "utf-8"));


webpush.setVapidDetails(
  'mailto:sergio.reyes.21m@utzmg.edu.mx',
  keys.publicKey,
  keys.privateKey
);

// Función para enviar una notificación push
function sendPush(subscription, userEmail) {
  const payload = `¡Hola ${userEmail}, tienes una nueva notificación!`;

  return webpush.sendNotification(subscription, payload)
    .then(() => {
      console.log("Notificación enviada con éxito");
    })
    .catch(error => {
      if (error.statusCode === 410 && error.body && error.body.includes('expired')) {
        console.log('Suscripción expiró y debe ser eliminada.');
      } else {
        console.error('Error al enviar la notificación:', error.message);
      }
    });
}

// Función para enviar una notificación con un mensaje personalizado
async function sends(sub, mensaje) {
  try {
    await webpush.sendNotification(sub, mensaje);
    return { mensaje: "ok" }; // Retorna un objeto, pero no usa `res.json()`
  } catch (error) {
    if (error.body.includes('expired') && error.statusCode == 410) {
      console.log('Sub expirada:',error);
    }
    return { mensaje: "error", error: error.message }; // Retorna error sin usar `res.json()`
  }
}

module.exports = { sendPush, sends };
