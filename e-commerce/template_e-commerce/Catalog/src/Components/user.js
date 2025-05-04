import baseURL from './url'; // Asegúrate de importar tu URL base

let usuario = null;

export const fetchUsuario = async () => {
    try {
        const response = await fetch(`${baseURL}userLogued.php`);
        console.log('response', response);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        usuario = await response.json();
        console.log('usuarioJSON', usuario);
    } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
        usuario = null; // Restablecer usuario si hay error
    }
};



export const getUsuario = () => {
    //  return {
        
    //      idUsuario: 3,
    //     nombre: "Nubia Velasquez",
    //     email:"ventas@mercadoyepes.co",
    //     rol: 'admin',
    //  };
    
    console.log('usuario', usuario);
    return usuario; // Devuelve los datos del usuario
    
};


// export const fetchUsuario = async () => {
//     try {
//         // Paso 1: Revisa si ya lo tienes cacheado
//         const storedUser = sessionStorage.getItem('usuario');
//         if (storedUser) {
//             usuario = JSON.parse(storedUser);
//             console.log('Usuario desde sessionStorage');
//             return usuario;
//         }

//         // Paso 2: Intenta pedirlo al backend
//         const response = await fetch(`${baseURL}userLogued.php`, {
//             credentials: 'include', // Importante para mantener sesión PHP
//         });

//         if (!response.ok) throw new Error('Network response was not ok');

//         const result = await response.json();

//         // Paso 3: Analiza si trae el campo `usuario` dentro del JSON
//         const fetchedUsuario = result.usuario || result;

//         // Paso 4: Cachea en sessionStorage
//         sessionStorage.setItem('usuario', JSON.stringify(fetchedUsuario));
//         usuario = fetchedUsuario;

//         return usuario;

//     } catch (error) {
//         console.error('Error al obtener datos del usuario:', error);

//         // Paso 5: En desarrollo, usar MOCK
//         if (process.env.NODE_ENV === 'development') {
//             usuario = {
//                 idUsuario: 3,
//                 nombre: "Nubia Velasquez",
//                 email: "ventas@mercadoyepes.co",
//                 rol: "admin"
//             };
//             sessionStorage.setItem('usuario', JSON.stringify(usuario));
//             console.warn('⚠️ Usuario falso cargado para entorno de desarrollo.');
//             return usuario;
//         }

//         // Paso 6: Si todo falla, borra cache y devuelve null
//         sessionStorage.removeItem('usuario');
//         usuario = null;
//         return null;
//     }
// };

// export const getUsuario = () => {
//     if (!usuario && sessionStorage.getItem('usuario')) {
//         usuario = JSON.parse(sessionStorage.getItem('usuario'));
//     }
//     return usuario;
// };