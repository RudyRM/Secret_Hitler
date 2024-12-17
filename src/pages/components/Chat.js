import React, { useState, useEffect } from 'react';
import './Chat.css';

const Chat = ({ username, salaId }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const SERVER_URL = 'http://localhost:3001';

  // Función para enviar el mensaje al servidor
  const handleSend = async () => {
    if (message.trim()) {
      try {
        // Obtenemos la fecha y hora actual
        const timestamp = new Date().toISOString();

        // Enviar la tupla con fecha, username y mensaje
        const response = await fetch(`${SERVER_URL}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ salaId, message, username, timestamp }), // Enviar el mensaje con la fecha
        });

        if (response.ok) {
          console.log('Mensaje enviado al servidor:', message);
          setMessage(''); // Limpiar el campo de entrada
          handleRetrieve();
          // Agregar el nuevo mensaje directamente al estado sin invertir
          setMessages(prevMessages => [
            ...prevMessages,
            { timestamp, username, message }
          ]);
        } else {
          console.error('Error al enviar el mensaje');
        }
      } catch (error) {
        console.error('Error al conectar con el servidor:', error);
      }
    }
  };
  // Recuperar mensajes del servidor
  const handleRetrieve = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/messages?salaId=${salaId}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Mensajes recuperados:', data);
        setMessages(data); // Actualizar la lista de mensajes
      } else {
        console.error('Error al recuperar los mensajes');
      }
    } catch (error) {
      console.error('Error al conectar con el servidor:', error);
    }
  };
  // Usar useEffect para recuperar los mensajes cuando el componente se monta
  useEffect(() => {
    handleRetrieve();
  }, [salaId]);

  return (
    <div className="chat">
      <div className="messages">
        {messages
          .slice() // Crea una copia del arreglo para evitar modificar el original
          .map((msg, index) => (
            <div
              key={index}
              className="message"
              style={{
                backgroundColor: msg.username === username ? '#ff4d4d' : '#3c464a',
              }}
            >
              <span>{new Date(msg.timestamp).toLocaleString()}</span>
              <div>{msg.username}: {msg.message}</div>
            </div>
          ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Escribe un mensaje"
        />
        <button onClick={handleSend}>Enviar</button>
        <button onClick={handleRetrieve}>Sincronizar</button>
      </div>
    </div>
  );
};

export default Chat;
