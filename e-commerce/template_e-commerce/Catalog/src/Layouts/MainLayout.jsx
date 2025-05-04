import React, { useState, useEffect } from 'react';
import Spiner from '../Components/Admin/Spiner/Spiner';
import { Outlet } from 'react-router-dom';
import Auth from '../Components/Admin/Auth/Auth';
import { fetchUsuario, getUsuario } from '../Components/user';
import TitleMeta from '../Components/TitleMeta/TitleMeta';
export default function MainLayout() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            await fetchUsuario(); // Llama a la función para obtener datos del usuario
            setLoading(false);
        };

        fetchData();
    }, []);

    const usuarioLegued = getUsuario();

    return (
        <div>
            <TitleMeta />
            {loading ? (
                <Spiner />
            ) : usuarioLegued?.idUsuario ? (
                <>
                    {usuarioLegued?.rol === 'admin' ? (
                        <Outlet />
                    ) : usuarioLegued?.rol === 'colaborador' ? (
                        <Outlet />
                    ) : (
                        <Outlet />
                    )}
                </>
            ) : (
                <Auth />
                // <Outlet />
            )}
        </div>
    );
}
