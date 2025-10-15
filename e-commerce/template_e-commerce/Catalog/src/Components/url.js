// Detecta si la URL tiene 'www.' o no y devuelve la base correcta
const getBaseURL = () => {
    // ✅ VARIABLE DE ENTORNO (máxima flexibilidad)
    if (process.env.REACT_APP_API_URL) {
        console.log('🎯 Usando URL desde variable de entorno:', process.env.REACT_APP_API_URL);
        return process.env.REACT_APP_API_URL;
    }

    const currentHost = window.location.hostname;

    // ✅ DETECCIÓN AUTOMÁTICA (fallback)
    if (currentHost === 'localhost' || currentHost === 'catalogo_jc.docker') {
        return "http://catalogo_jc.docker:8080";
    
    }

    if (currentHost === 'catalogo_jc.test') {
        return "http://catalogo_jc.test";
    }

    // ✅ PRODUCCIÓN (default)
    return "https://catalogo.mercadoyepes.co";
};


const baseURL = getBaseURL(); // Obtiene la URL base correcta

export default baseURL;