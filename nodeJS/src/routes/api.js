const express = require('express');
const router = express.Router();
const redisClient = require('../config/redis');

router.get('/get/:key', (req, res) => {
    const { key } = req.params;

    redisClient.get(key, (err, reply) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener el valor' });
        }
        if (reply) {
            return res.json({ key, value: reply });
        } else {
            return res.status(404).json({ error: 'Clave no encontrada' });
        }
    });
});

router.post('/set', (req, res) => {
    const { key, value } = req.body;

    redisClient.set(key, value, (err, reply) => {
        if (err) {
            return res.status(500).json({ error: 'Error al guardar el valor' });
        }
        res.json({ success: true, message: `Valor almacenado para ${key}` });
    });
});

module.exports = router;
