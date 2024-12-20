const redis = require('redis');

const client = redis.createClient({
    host: 'localhost',
    port: 6379,
});

// Maneja la conexión
client.on('connect', () => {
    console.log('Conectado a Redis');
});

client.on('error', (err) => {
    console.error('Error de conexión a Redis:', err);
});

client.set(salaId, JSON.stringify({ roomName, username, mensajes: [] }), (err, reply) => {
    if (err) {
        console.error('Error al guardar la sala en Redis:', err);
    } else {
        console.log('Sala guardada en Redis:', reply);
    }
});

module.exports = client;
