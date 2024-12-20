const { spawn } = require('child_process');
const express = require(`express`);
const cors = require(`cors`);
const redis = require(`redis`);
const bodyParser = require(`body-parser`);
const app = express();

// Habilitar CORS para todas las rutas y dominios
app.use(cors());

app.use(bodyParser.json());
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: `Error interno inesperado.` });
});
const client = redis.createClient({
    url: `redis://localhost:6379`, // Cambia si usas otra configuración
});

client.on(`error`, (err) => {
    console.error(`Error conectando a Redis:`, err);
});

client.connect().then(() => {
    console.log(`Conectado a Redis`);
});

  
// Endpoint para enviar un mensaje
app.post(`/messages`, async (req, res) => {
    const { salaId, message, username, timestamp } = req.body;

    if (!salaId || !message || !username || !timestamp) {
        return res.status(400).json({ error: `salaId, message, username y timestamp son requeridos.` });
    }

    const messageTuple = [timestamp, username, message];

    try {
        // Agregar el mensaje al hash de la sala en Redis
        await client.rPush(`room:${salaId}:messages`, JSON.stringify(messageTuple)); // Usamos rPush para agregar el mensaje a la lista

        console.log(`Mensaje agregado a la sala ${salaId}`);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error(`Error al agregar el mensaje a Redis:`, error);
        res.status(500).json({ error: `Error al agregar el mensaje a Redis.` });
    }
});

app.get(`/room/:salaId`, async (req, res) => {
    const { salaId } = req.params;

    if (!salaId) {
        return res.status(400).json({ error: `salaId es requerido.` });
    }

    try {
        // Verificar si la sala existe en Redis
        const roomData = await client.hGetAll(`room:${salaId}`);

        if (Object.keys(roomData).length === 0) {
            return res.status(404).json({ error: `Sala no encontrada.` });
        }

        // Obtener los usuarios conectados de la sala
        const users = await client.sMembers(`room:${salaId}:users`);

        // Devolver la información de la sala y los usuarios conectados
        res.status(200).json({ 
            salaId,
            roomName: roomData.roomName, 
            users,
            userCount: users.length // Número de jugadores conectados
        });
    } catch (error) {
        console.error(`Error al verificar la existencia de la sala:`, error);
        res.status(500).json({ error: `Error al verificar la sala.` });
    }
});
// Endpoint para unirse a una sala y registrar el usuario
app.post(`/join-room`, async (req, res) => {
    const { salaId, username } = req.body;

    if (!salaId || !username) {
        return res.status(400).json({ error: `salaId y username son requeridos.` });
    }

    try {
        // Agregar el usuario a la lista de usuarios activos en la sala
        await client.sAdd(`room:${salaId}:users`, username);

        // Obtener la lista actualizada de usuarios en la sala
        const users = await client.sMembers(`room:${salaId}:users`);

        // Actualizar la cantidad de usuarios en la sala
        const roomData = await client.hGetAll(`room:${salaId}`);
        await client.hSet(`room:${salaId}`, `userCount`, users.length);  // Actualizamos el contador de usuarios en Redis

        // Devolver la respuesta con éxito y la lista de usuarios
        res.status(200).json({ 
            success: true,
            users, // Devolvemos la lista de usuarios conectados
            userCount: users.length // Devolvemos el número total de usuarios conectados
        });
    } catch (error) {
        console.error(`Error al agregar el usuario:`, error);
        res.status(500).json({ error: `Error al agregar el usuario a la sala.` });
    }
});

function ejecutarTransferenciaDatos(salaId) {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python3', ['./src/movimiento_datos.py', salaId]); // Cambia a la ruta real del script

        pythonProcess.stdout.on('data', (data) => {
            console.log(`Salida del script: ${data}`);
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`Error del script: ${data}`);
        });

        pythonProcess.on('close', (code) => {
            if (code === 0) {
                console.log('El script de transferencia de datos se ejecutó correctamente.');
                resolve();
            } else {
                reject(new Error(`El script terminó con el código ${code}`));
            }
        });
    });
}

// Endpoint para que el usuario abandone la sala y se elimine si está vacía
app.post(`/leave-room`, async (req, res) => {
    const { salaId, username } = req.body;

    if (!salaId || !username) {
        return res.status(400).json({ error: `salaId y username son requeridos.` });
    }

    try {
        // Eliminar el usuario de la lista de usuarios activos
        await client.sRem(`room:${salaId}:users`, username);

        // Verificar si no hay más usuarios en la sala
        const activeUsers = await client.sMembers(`room:${salaId}:users`);
        if (activeUsers.length === 0) {
            // Si no hay usuarios activos, eliminar la sala completamente
            await ejecutarTransferenciaDatos(salaId);

            await client.del(`room:${salaId}`);
            await client.del(`${salaId}:messages`);
            console.log(`Sala ${salaId} eliminada porque no hay usuarios activos.`);
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error(`Error al eliminar el usuario de la sala:`, error);
        res.status(500).json({ error: `Error al eliminar el usuario de la sala.` });
    }
});
// Endpoint para recuperar los mensajes
app.get(`/messages`, async (req, res) => {
    const { salaId } = req.query;

    if (!salaId) {
        return res.status(400).json({ error: `salaId es requerido.` });
    }

    try {
        // Recuperar todos los mensajes de la sala desde Redis
        const messages = await client.lRange(`room:${salaId}:messages`, 0, -1);

        // Convertir los mensajes a un formato legible (deserializar los JSON)
        const formattedMessages = messages.map((msg) => {
            const [timestamp, username, message] = JSON.parse(msg); // Aseguramos que el mensaje sea una tupla JSON
            return { timestamp, username, message }; // Devolver como un objeto con los tres campos
        });

        res.status(200).json(formattedMessages); // Enviar los mensajes al cliente
    } catch (error) {
        console.error(`Error al recuperar mensajes de Redis:`, error);
        res.status(500).json({ error: `Error al recuperar los mensajes de Redis.` });
    }
});

app.post(`/create-room`, async (req, res) => {
    const { roomName, username } = req.body;

    // Validar entrada
    if (!roomName || !username) {
        return res.status(400).json({ error: `roomName y username son requeridos.` });
    }

    const salaId = `sala_${Date.now()}`;

    // Estructura a guardar en Redis
    const roomData = {
        roomName,
        username,
        mensajes: JSON.stringify([]), // Serializamos la lista de mensajes vacía
    };

    try {
        // Guardar la información de la sala en Redis
        await client.hSet(`room:${salaId}`, roomData);

        // Agregar al creador de la sala a la lista de usuarios activos
        await client.sAdd(`room:${salaId}:users`, username);

        // Obtener la lista actualizada de usuarios (solo tendrá al creador inicialmente)
        const users = await client.sMembers(`room:${salaId}:users`);

        // Actualizar el contador de usuarios en la sala
        await client.hSet(`room:${salaId}`, `userCount`, users.length);

        console.log(`Sala creada en Redis con salaId: ${salaId}`);

        // Responder con éxito y la información de la sala
        res.status(201).json({ 
            salaId,
            users, // Devolvemos la lista de usuarios en la sala
            userCount: users.length // Número de usuarios en la sala
        });
    } catch (error) {
        console.error(`Error al guardar en Redis:`, error);
        res.status(500).json({ error: `Error al guardar en Redis.` });
    }
});


// Ruta para inicializar la estructura de la sala con mensajes vacíos
app.post(`/rooms/:salaId`, async (req, res) => {
    try {
        const { salaId } = req.params;

        if (!salaId) {
            return res.status(400).send({ error: `salaId es requerido.` });
        }

        const salaData = { mensajes: [] }; // Inicializa la lista vacía
        await client.setAsync(salaId, JSON.stringify(salaData)); // Actualiza Redis

        res.status(201).send({ success: true });
    } catch (error) {
        console.error(`Error en /rooms/:salaId:`, error);
        res.status(500).send({ error: `Error interno del servidor.` });
    }
});

app.post(`/login`, (req, res) => {
  const { username, ip } = req.body;
  
  console.log(`Usuario ${username} inició sesión desde la IP: ${ip}`);

  // Responde con un estado 200 (OK) si todo va bien
  res.status(200).json({ message: `Login successful` });
});

app.listen(3001, () => {
  console.log(`Servidor corriendo en http://localhost:3001`);
});