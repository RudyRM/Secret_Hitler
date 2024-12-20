import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PantallaLogin from './pages/PantallaLogin';
import PantallaSeleccion from './pages/PantallaSeleccion';
import PantallaJuego from './pages/PantallaJuego'; // Asegúrate de que este componente exista

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PantallaLogin />} />
        <Route path="/pantalla-seleccion" element={<PantallaSeleccion />} />
        <Route path="/pantalla-juego/:salaId" element={<PantallaJuego />} />
      </Routes>
    </Router>
  );
};

export default App;
