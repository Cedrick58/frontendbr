// src/components/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Bienvenido a la Página Principal</h1>
      <p style={styles.description}>¡Gracias por visitar nuestra aplicación! Elige una opción para continuar.</p>
      
      <div style={styles.buttonContainer}>
        <Link to="/login" style={styles.button}>Iniciar sesión</Link>
        <Link to="/register" style={styles.button}>Registrarse</Link>
      </div>
    </div>
  );
};

// Estilos en línea
const styles = {
  container: {
    textAlign: 'center',
    padding: '50px',
    backgroundColor: '#f4f4f9',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    boxSizing: 'border-box', 
  },
  heading: {
    fontSize: '2.5rem',
    color: '#4CAF50',
    marginBottom: '20px',
  },
  description: {
    fontSize: '1.2rem',
    color: '#555',
    marginBottom: '30px',
  },
  buttonContainer: {
    display: 'flex',
    gap: '20px',
  },
  button: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '15px 25px',
    textDecoration: 'none',
    borderRadius: '5px',
    fontSize: '1rem',
    transition: 'background-color 0.3s ease',
  },
};

export default HomePage;
