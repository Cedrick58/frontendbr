const APP_SHELL_CACHE = 'AppShellv1';
const DYNAMIC_CACHE = 'DynamicCacheV1';
const DB_NAME = 'database';
const STORE_NAME = 'Usuarios';

// Archivos esenciales para precache
const APP_SHELL_FILES = [
  '/', 
  '/index.html', 
  '/offline.html',
  '/index.css', 
  '/App.css',
  '/App.jsx',
  '/main.jsx',
  '/components/Home.jsx',
  '/components/Login.jsx',
  '/components/Register.jsx',
  '/icons/fut1.png',
  '/icons/carga.png',
];

// Precaching
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then(cache => cache.addAll(APP_SHELL_FILES))
  );
  self.skipWaiting();
});

// Activación: borrar caché vieja
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== APP_SHELL_CACHE && key !== DYNAMIC_CACHE) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// Guardar en IndexedDB
function saveToIndexedDB(data) {
  const request = indexedDB.open(DB_NAME, 1);

  request.onupgradeneeded = e => {
    const db = e.target.result;
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
    }
  };

  request.onsuccess = e => {
    const db = e.target.result;
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.add(data);
    tx.oncomplete = () => {
      console.log("Usuario guardado offline");
      // Verificar si Background Sync está disponible y registrar
      if ('SyncManager' in self) {
        self.registration.sync.register('syncUsuarios')
          .then(() => {
            console.log("Sincronización registrada con éxito");
          })
          .catch(err => {
            console.error("Error al registrar la sincronización:", err);
          });
      } else {
        console.warn("⚠️ Background Sync no es soportado en este navegador.");
      }
    };
  };

  request.onerror = e => console.error("Error en IndexedDB:", e.target.error);
}

// Interceptar requests
self.addEventListener('fetch', event => {
  if (!event.request.url.startsWith('http')) return;

  if (event.request.method === 'POST' && event.request.url.includes('/auth/register')) {
    event.respondWith(
      event.request.clone().json()
        .then(body =>
          fetch(event.request).catch(() => {
            saveToIndexedDB(body);
            return new Response(JSON.stringify({ message: 'Guardado offline' }), {
              headers: { 'Content-Type': 'application/json' }
            });
          })
        )
    );
  } else {
    event.respondWith(
      fetch(event.request)
        .then(res => {
          const resClone = res.clone();
          caches.open(DYNAMIC_CACHE).then(cache => cache.put(event.request, resClone));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
  }
});

// Sync Background
self.addEventListener('sync', event => {
  if (event.tag === 'syncUsuarios') {
    event.waitUntil(
      new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);

        request.onsuccess = e => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) return resolve();

          const tx = db.transaction(STORE_NAME, 'readonly');
          const store = tx.objectStore(STORE_NAME);
          const getAll = store.getAll();

          getAll.onsuccess = () => {
            const usuarios = getAll.result;
            if (usuarios.length === 0) return resolve();

            const postPromises = usuarios.map(user =>
              fetch('https://backend-5it1.onrender.com/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user)
              })
            );

            Promise.all(postPromises).then(responses => {
              if (responses.every(res => res.ok)) {
                const delTx = db.transaction(STORE_NAME, 'readwrite');
                delTx.objectStore(STORE_NAME).clear().onsuccess = () =>
                  console.log("Usuarios sincronizados y eliminados.");
              } else {
                console.error("Algunas respuestas fallaron:", responses);
              }
              resolve();
            }).catch(err => reject(err));
          };
        };

        request.onerror = e => reject(e.target.error);
      })
    );
  }
});
