// utils/baseURL.js
// - CRA (react-scripts): usa process.env.REACT_APP_*
// - Normaliza www
// - Permite override por ?api=...
// - Seguro si en algún momento ejecutas fuera del browser

const normalize = (url) => url.replace(/\/+$/, ''); // quita trailing slash
const stripWWW = (h) => h.replace(/^www\./i, '');

const pickEnvUrl = () => {
  // CRA solo expone variables que empiezan por REACT_APP_
  if (typeof process !== 'undefined' && process.env?.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  return undefined;
};

export const getBaseURL = () => {
  // 1) .env tiene prioridad
  const envUrl = pickEnvUrl();
  if (envUrl) {
    console.log('🎯 Usando API_URL desde .env:', envUrl);
    return normalize(envUrl);
  }

  // 2) Si (por lo que sea) no hay window disponible, usa prod por defecto
  if (typeof window === 'undefined') {
    return 'https://mercadoyepes.co';
  }

  // 3) Override manual por query param ?api=https://miapi.test
  try {
    const qp = new URLSearchParams(window.location.search).get('api');
    if (qp) {
      console.log('🛠️ Override API por query param:', qp);
      return normalize(qp);
    }
  } catch { /* noop */ }

  // 4) Detección por host actual (con/sin www)
  const host = stripWWW(window.location.hostname || '');

  // Mapa de dominios -> URL base de la API
  const map = {
    // Desarrollo / Docker local
    'localhost': 'http://catalogo_jc.docker:8080',
    'catalogo_jc.docker': 'http://catalogo_jc.docker:8080',

    // QA / Staging
    'catalogo_jc.test': 'http://catalogo_jc.test',

    // Producción
    'mercadoyepes.co': 'https://mercadoyepes.co',
  };

  // Coincidencia directa
  if (map[host]) return normalize(map[host]);

  // Subdominios → usa coincidencia por sufijo
  const entry = Object.entries(map).find(([key]) => host === key || host.endsWith(`.${key}`));
  if (entry) return normalize(entry[1]);

  console.warn(`⚠️ Host no mapeado (${host}). Usando producción por defecto.`);
  return 'https://mercadoyepes.co';
};

// Instancia única
const baseURL = getBaseURL();
export default baseURL;
