import React, { useState, useEffect } from 'react';
import Header from '../Header/Header'
import HeaderDash from '../../Components/Admin/HeaderDash/HeaderDash'
import SinPermisos from '../../Components/SinPermisos/SinPermisos';
import { fetchUsuario, getUsuario } from '../../Components/user';
import MetodosData from '../../Components/Admin/MetodosData/MetodosData';
export default function MetodosDePago() {
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
        <div className='containerGrid'>
            <Header />

            <section className='containerSection'>

                <HeaderDash />
                <div className='container'>
                    {loading ? (
                        <></>
                    ) : usuarioLegued?.idUsuario ? (
                        <>
                            {usuarioLegued?.rol === 'admin' ? (
                                <MetodosData />
                            ) : usuarioLegued?.rol === 'colaborador' ? (
                                <SinPermisos />
                            ) : (
                                <SinPermisos />
                            )}
                        </>
                    ) : (
                        <MetodosData />
                    )}

                </div>
            </section>
        </div>
    )
}

