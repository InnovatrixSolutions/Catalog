// Detecta si la URL tiene 'www.' o no y devuelve la base correcta
const getBaseURL = () => {
    const currentHost = window.location.hostname; // Obtiene el host actual
    if (currentHost.startsWith('www.')) {
        return 'https://www.catalogo.mercadoyepes.co/';
    } else {
        return 'https://catalogo.mercadoyepes.co/';
        //return "http://localhost:3000/"; // Cambia esto a la URL base correcta para tu entorno local
    }
};

const baseURL = getBaseURL(); // Obtiene la URL base correcta

export default baseURL;
