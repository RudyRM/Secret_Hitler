import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./PantallaLogin.css";
import logo from '../assets/Secret_Hitler.png';
//import PantallaSeleccion from './PantallaSeleccion';

const PantallaLogin = () => {
  const [username, setUsername] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      // Obtener la IP pública del usuario
      const ipResponse = await fetch('https://api.ipify.org/?format=json');
      const { ip } = await ipResponse.json();
  
      // Enviar los datos de login al servidor
      const response = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, ip }), // Incluimos el username y la IP
      });
  
      if (response.ok) {
        // Si la respuesta es exitosa, marcamos al usuario como logueado
        setLoggedIn(true);
  
        // Navegamos a la siguiente pantalla pasando el username como estado
        navigate('/pantalla-seleccion', { state: { username } });
  
        // Aquí podrías agregar un log o mensaje para confirmar que se registró el login
        console.log(`Usuario ${username} inició sesión desde la IP: ${ip}`);
      } else {
        alert('Login failed.');
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert('An error occurred.');
    }
  };

  return (
    <div>
      {loggedIn ? (
        <div username={username}/>
      ) : (
        <div className="login-container">
          <div className="login-box">
            <img src={logo} alt="Title" className="login-title" />
            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="login-input"
            />
            <button onClick={handleLogin} className="login-button">
              Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PantallaLogin;
