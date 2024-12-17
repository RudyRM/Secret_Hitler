import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Perfil from './components/Perfil';
import Chat from './components/Chat';
import Juego from './components/Juego';
import './PantallaJuego.css';

const PantallaJuego = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const username = location.state?.username;
  const image = location.state?.selected;
  const sala = location.state?.salaId;
  console.log(username, image, sala);



  return (
    <div className="contenedor">
      <div className="lado-izquierdo">
        <div className="chat">
          <Chat username={username} salaId={sala} />
        </div>
        <div className="perfil">
          <Perfil username={username} image={image} salaId={sala} />
        </div>
      </div>
      <div className="lado-derecho">
        <Juego salaId={sala} username={username}/>
      </div>
    </div>
  );
};

export default PantallaJuego;
