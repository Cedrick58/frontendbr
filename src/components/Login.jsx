import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Main() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();


  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('https://backend-5it1.onrender.com/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Respuesta del servidor:", data); // Asegúrate de que `data.user._Id` y `data.user.role` estén presentes.
      
        // Verifica si los valores son correctos antes de guardarlos
        
          localStorage.setItem('userId', data.user._id); // Asegúrate de que esto sea correcto
          localStorage.setItem('userRole', data.user.role); // Asegúrate de que esto sea correcto
          console.log("ID del usuario guardado:", data.user._id);
          console.log("Rol del usuario guardado:", data.user.role);
      
          alert('✅ Login exitoso');
          navigate('/main');
        
      } else {
        throw new Error(data.message || 'Error al iniciar sesión.');
      }
    } catch (err) {
      setError(err.message || 'No se pudo conectar al servidor. Inténtalo nuevamente más tarde.');
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleLogin} style={styles.form}>
        <h2 style={styles.heading}>Iniciar Sesión</h2>
        {error && <div style={styles.error}>{error}</div>}
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          required
        />
        <button type="submit" style={styles.button}>Iniciar Sesión</button>
      </form>
    </div>
  );
}

// Estilos en línea
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f4f4f9',
  },
  form: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    width: '300px',
    textAlign: 'center',
  },
  heading: {
    fontSize: '2rem',
    color: '#4CAF50',
    marginBottom: '20px',
  },
  input: {
    width: '100%',
    padding: '10px',
    marginBottom: '15px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.3s',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '1.2rem',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  error: {
    color: '#f44336',
    marginBottom: '10px',
  },
};

export default Main;
