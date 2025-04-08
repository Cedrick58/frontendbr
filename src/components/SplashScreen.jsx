// src/components/SplashScreen.js
import React, { useEffect, useState } from 'react';
import './SplashScreen.css';

const SplashScreen = ({ onLoaded }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Establece el tiempo que se mostrará el splash screen
    const timer = setTimeout(() => {
      setIsVisible(false);
      onLoaded(); // Llama a la función para mostrar el contenido principal
    }, 3000); // 3 segundos de espera

    return () => clearTimeout(timer);
  }, [onLoaded]);

  return (
    <div className={`splash-screen ${isVisible ? 'visible' : ''}`}>
      <h1>Zona futbolera</h1>
      <p>Cargando...</p>
    </div>
  );
};

export default SplashScreen;
