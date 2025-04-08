import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [nombre, setNombre] = useState('');
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    window.addEventListener("online", () => setIsOnline(true));
    window.addEventListener("offline", () => setIsOnline(false));

    return () => {
      window.removeEventListener("online", () => setIsOnline(true));
      window.removeEventListener("offline", () => setIsOnline(false));
    };
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
  
    if (!isOnline) {
      setError('No estás conectado a Internet. Los datos se guardarán localmente.');
      insertIndexedDB({ email, nombre, password });
      return;
    }
  
    try {
      const response = await fetch('https://backend-5it1.onrender.com/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, nombre, password }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        alert('Registro exitoso. Ahora puedes iniciar sesión.');
        navigate('/login');
      } else {
        setError(data.message || 'Error al registrarte.');
      }
    } catch (err) {
      setError('No se pudo conectar al servidor. Inténtalo nuevamente.');
    }
  };

  function insertIndexedDB(data) {
    let dbRequest = window.indexedDB.open("database", 2); // Asegúrate de usar una versión específica
  
    dbRequest.onupgradeneeded = (event) => {
      const db = event.target.result;
  
      // Crear el object store 'Usuarios' si no existe
      if (!db.objectStoreNames.contains("Usuarios")) {
        db.createObjectStore("Usuarios", { keyPath: "email" });
        console.log("✅ 'Usuarios' object store creado.");
      } else {
        console.log("⚠️ 'Usuarios' object store ya existe.");
      }
    };
  
    dbRequest.onsuccess = (event) => {
      const db = event.target.result;
  
      // Verificar si el object store existe antes de insertar los datos
      if (db.objectStoreNames.contains("Usuarios")) {
        const transaction = db.transaction("Usuarios", "readwrite");
        const objStore = transaction.objectStore("Usuarios");
  
        const addRequest = objStore.add(data);
  
        addRequest.onsuccess = () => {
          console.log("✅ Datos insertados en IndexedDB:", addRequest.result);
  
          // Sincronizar datos si el navegador soporta Background Sync
          if ('serviceWorker' in navigator && 'SyncManager' in window) {
            navigator.serviceWorker.ready
              .then((registration) => {
                console.log("Intentando registrar la sincronización...");
                return registration.sync.register("syncUsuarios");
              })
              .then(() => {
                console.log("✅ Sincronización registrada con éxito");
              })
              .catch((err) => {
                console.error("❌ Error registrando la sincronización:", err);
              });
          } else {
            console.warn("⚠️ Background Sync no es soportado en este navegador.");
          }
        };
  
        addRequest.onerror = () => {
          console.error("❌ Error insertando en IndexedDB");
        };
      } else {
        console.error("❌ El object store 'Usuarios' no existe.");
      }
    };
  
    dbRequest.onerror = () => {
      console.error("❌ Error abriendo IndexedDB");
    };
  }
  

  return (
    <div style={styles.container}>
      <form style={styles.form} onSubmit={handleRegister}>
        <h2 style={styles.heading}>Registro</h2>
        {error && <div style={styles.error}>{error}</div>}
        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          style={styles.input}
        />
        <input
          type="email"
          placeholder="Correo Electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Registrar</button>
      </form>
    </div>
  );
};

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
    color: '#1612f8',
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
    backgroundColor: '#1612f8',
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

export default Register;
