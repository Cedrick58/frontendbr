import React, { useEffect, useState } from "react";
import keys from "../../keys.json"; // Importa las llaves VAPID
import { useNavigate } from "react-router-dom";
import "./Main.css"; // Importamos el archivo CSS

function Main() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Estado de carga
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const userRole = localStorage.getItem("userRole");

  useEffect(() => {
    if (userRole === "admin") {
      fetch("https://backend-5it1.onrender.com/auth/users")
        .then((response) => {
          if (!response.ok) throw new Error("Error al obtener los usuarios");
          return response.json();
        })
        .then((data) => {
          console.log("Usuarios obtenidos:", data);
          const usersWithSubscription = data.filter(
            (user) => user.suscripcion !== null && user.suscripcion !== undefined
          );
          setUsers(usersWithSubscription);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error al cargar los usuarios:", error);
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [userRole]);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register("./sw.js", {
        type: "module",
      });
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) return;

      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: keys.publicKey,
      });

      if (!userId) return;

      const response = await fetch("https://backend-5it1.onrender.com/auth/suscripcion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, suscripcion: subscription.toJSON() }),
      });

      if (!response.ok) throw new Error(`Error en la solicitud: ${response.status}`);
      console.log("Suscripción guardada en la base de datos:", await response.json());
    } catch (error) {
      console.error("Error en el registro del Service Worker:", error);
    }
    if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js') // o la ruta correcta
    .then(reg => console.log('SW registrado:', reg))
    .catch(err => console.error('Error al registrar SW:', err));
}
  };

  useEffect(() => {
    registerServiceWorker();
  }, []);

  const handleSendMessage = async (user) => {
    try {
      const message = prompt(`Escribe un mensaje para ${user.email}:`);
      if (!message || !message.trim()) {
        alert("El mensaje no puede estar vacío.");
        return;
      }

      if (!user.suscripcion) {
        throw new Error(`El usuario ${user.email} no tiene una suscripción válida.`);
      }

      console.log("Enviando a suscripción:", user.suscripcion);

      const response = await fetch("https://backend-5it1.onrender.com/auth/suscripcionMod", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          suscripcion: user.suscripcion,
          mensaje: message,
        }),
      });

      if (!response.ok) throw new Error("Error al enviar el mensaje");

      const data = await response.json();
      console.log("Mensaje enviado:", data);
      alert("Mensaje enviado con éxito");
    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
      alert(error.message);
    }
  };

  return (
    <div className="page-container">
      <h2 className="page-title">Bienvenid@</h2>
      {userRole === "admin" ? (
        <div>
          <h2>📋 Usuarios Suscritos</h2>
          {isLoading ? (
            <p>⏳ Cargando usuarios...</p>
          ) : (
            <table className="user-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>📩 Email</th>
                  <th>✉️ Enviar Mensaje</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user, index) => (
                    <tr key={user._id || index}>
                      <td>{user._id}</td>
                      <td>{user.email}</td>
                      <td>
                        <button className="send-message-btn" onClick={() => handleSendMessage(user)}>
                          Enviar
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3">📭 Zona futbolera</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <p>⚠️ Calendario de la liga proximamente...</p>
      )}
    </div>
  );
}

export default Main;
