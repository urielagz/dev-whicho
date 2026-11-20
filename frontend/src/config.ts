// Único lugar donde se define a qué backend se conecta el frontend.
//  1. VITE_API_URL, si se definió al compilar (ver .env.example).
//  2. En localhost -> backend local en el puerto 7000.
//  3. En cualquier otro origen (GitHub Pages) -> backend en Render.
const esLocal = ["localhost", "127.0.0.1"].includes(window.location.hostname);

export const config = Object.freeze({
  APP_NAME: "Dev Whicho",
  API_URL:
    import.meta.env.VITE_API_URL ??
    (esLocal ? "http://localhost:7000" : "https://miztontli-backend.onrender.com"),
  CHAT_POLLING_MS: 8000,
  MAX_ARCHIVOS: 5,
});
