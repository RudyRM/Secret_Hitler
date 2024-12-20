import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Juego.css'; // Importamos los estilos

const Juego = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const username = location.state?.username;
  const sala = location.state?.salaId;

  const [conectados, setConectados] = useState([]); // Inicializamos como un arreglo vacío

  // Función para manejar el evento de salir de la sala
  const SalirSala = async () => {
    try {
      const response = await fetch('http://localhost:3001/leave-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salaId: sala, username }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || 'Error al salir de la sala.');
        return;
      }

      // Redirigir al usuario después de abandonar la sala
      navigate('/pantalla-seleccion', { state: { username } });
    } catch (error) {
      console.error('Error al salir de la sala:', error);
      alert('Hubo un problema al salir de la sala.');
    }
  };

  // Función para obtener la lista de conectados
  const obtenerConectados = async () => {
    try {
      const response = await fetch(`http://localhost:3001/room/${sala}`);
      if (response.ok) {
        const data = await response.json();
        setConectados(data.users || []); // Ahora usamos 'users' en lugar de 'conectados'
        console.log(data.users)
      } else {
        alert('No se pudo obtener la lista de usuarios conectados.');
      }
    } catch (error) {
      console.error('Error al obtener usuarios conectados:', error);
    }
  };

  // Usamos useEffect para obtener la lista de usuarios conectados cuando el componente se monte
  useEffect(() => {
    obtenerConectados();
  }, [sala]);

  return (
    <div className="juego-container">
      {/* Contenedor de botones */}
      <div className="botones-container">
        <button className="salir-btn" onClick={SalirSala}>
          Salir de la sala
        </button>
        <button className="salir-btn" onClick={obtenerConectados}>
          Sincronizar usuarios
        </button>
      </div>
  
      {/* Texto grande de Usuarios */}
      <div className="titulo-usuarios">Usuarios</div>
  
      {/* Grilla de usuarios conectados */}
      <div className="grilla-conectados">
        {conectados.length > 0 ? (
          conectados.map((usuario, index) => (
            <div className="usuario" key={index}>
              {usuario}
            </div>
          ))
        ) : (
          <div>No hay usuarios conectados en este momento.</div>
        )}
      </div>
    </div>
  );
};

export default Juego;
