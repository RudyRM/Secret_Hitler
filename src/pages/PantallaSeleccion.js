import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './PantallaSeleccion.css';

const PantallaSeleccion = () => {
    const [selected, setSelected] = useState(null);
    const navigate = useNavigate();

    const location = useLocation();
    const username = location.state?.username;
    const [roomName, setRoomName] = useState(`Sala de ${username}`);
    
    const images = Array.from({ length: 18 }, (_, i) => require(`../assets/images/image${i + 1}.png`));

    const handleSelect = (index) => {
        setSelected(index);
    };

    const crearSala = async () => {
        if (!roomName || !username) {
            alert('roomName o username no pueden estar vacíos.');
            return;
        }
    
        try {
            const response = await fetch('http://localhost:3001/create-room', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roomName, username }),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error del servidor:', errorData);
                alert(errorData.error || 'Error al crear la sala.');
                return;
            }
    
            const data = await response.json();
            const { salaId } = data;
            navigate(`/pantalla-juego/${salaId}`, { state: { username, selected, salaId } });
        } catch (error) {
            console.error('Error al crear la sala:', error);
            alert('Hubo un problema al crear la sala.');
        }
    };

    const ingresarSala = async () => {
        if (!roomName) {
            alert('Por favor ingrese un ID de sala.');
            return;
        }
      
        try {
            // Verificar si la sala existe en el servidor
            const response = await fetch(`http://localhost:3001/room/${roomName}`);
            if (response.ok) {
                const data = await response.json();
                const { salaId } = data;
    
                // Registrar al usuario en la sala activa en el servidor
                const joinResponse = await fetch(`http://localhost:3001/join-room`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ salaId, username }),
                });
    
                if (!joinResponse.ok) {
                    const errorData = await joinResponse.json();
                    alert(errorData.error || 'Error al unirse a la sala.');
                    return;
                }
    
                navigate(`/pantalla-juego/${salaId}`, { state: { username, selected, salaId } });
            } else {
                alert('Sala no encontrada o inválida.');
            }
        } catch (error) {
            console.error('Error al ingresar a la sala:', error);
            alert('Hubo un problema al ingresar a la sala.');
        }
    };

    return (
        <div className="pantalla-seleccion">
            <div className="grid-container">
                {images.map((image, index) => (
                    <div
                        key={index}
                        className={`grid-item ${selected === index ? 'selected' : ''}`}
                        onClick={() => handleSelect(index)}
                    >
                        <div className="image-wrapper">
                            <img src={image} alt={`Imagen ${index + 1}`} />
                        </div>
                    </div>
                ))}
            </div>
            <div className="input-container">
                <input 
                    type="text" 
                    placeholder="Ingresa ID de sala" 
                    className="text-input small-width" 
                    value={roomName} 
                    onChange={(e) => setRoomName(e.target.value)} 
                />
                <button className="btn-secondary" onClick={ingresarSala}>Ingresar sala</button>
                <button className="btn-primary" onClick={crearSala}>Crear sala</button>
            </div>
        </div>
    );
};

export default PantallaSeleccion;
