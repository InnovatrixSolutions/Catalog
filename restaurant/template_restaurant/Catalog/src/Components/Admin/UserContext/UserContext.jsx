import React, { createContext, useContext, useState, useEffect } from 'react';
import baseURL from '../../url'; // Ajusta la ruta según tu estructura

// Crear el contexto
const UserContext = createContext();

// Hook personalizado para acceder al contexto del usuario
export const useUser = () => useContext(UserContext);

// Proveedor de contexto para envolver componentes
export const UserProvider = ({ children }) => {
    const [usuario, setUsuario] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${baseURL}/userLogued.php`);
                if (!response.ok) {
                    throw new Error('Error en la respuesta de la red');
                }
                const data = await response.json();
                setUsuario(data);
                setLoading(false);
            } catch (error) {
                console.error('Error al obtener datos:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <UserContext.Provider value={{ usuario, loading }}>
            {children}
        </UserContext.Provider>
    );
};
