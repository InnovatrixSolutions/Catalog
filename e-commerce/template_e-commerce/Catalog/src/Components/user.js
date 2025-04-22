import baseURL from './url'; // Asegúrate de importar tu URL base

let usuario = null;

export const fetchUsuario = async () => {
    try {
        const response = await fetch(`${baseURL}/userLogued.php`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        usuario = await response.json();
    } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
        usuario = null; // Restablecer usuario si hay error
    }
};

export const getUsuario = () => {
    return {
        idUsuario: 1,
        rol: 'admin',
        nombre: 'Usuario Falso'
    };
    //return usuario; // Devuelve los datos del usuario
    
};
