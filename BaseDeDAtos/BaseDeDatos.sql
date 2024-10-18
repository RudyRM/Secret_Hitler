-- Crear la base de datos
CREATE DATABASE hitlerElSecreto;


-- Crear la tabla 'partida'
CREATE TABLE partida (
    id_partida SERIAL PRIMARY KEY,           -- ID de la partida, clave primaria auto incrementada
    jugadores_equipo TEXT NOT NULL,          -- Lista de jugadores o equipos
    duracion INTERVAL NOT NULL,              -- Duración de la partida
    equipo_ganador TEXT NOT NULL,            -- Equipo o jugador ganador
    fecha DATE NOT NULL                      -- Fecha de la partida
);
