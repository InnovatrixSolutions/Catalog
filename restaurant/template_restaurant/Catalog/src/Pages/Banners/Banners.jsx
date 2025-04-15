import React, { useState, useEffect } from 'react';
import './Banners.css'
import Header from '../Header/Header'
import HeaderDash from '../../Components/Admin/HeaderDash/HeaderDash'
import BannerData from '../../Components/Admin/BannerData/BannerData'
import SinPermisos from '../../Components/SinPermisos/SinPermisos';
import { fetchUsuario, getUsuario } from '../../Components/user';
export default function Banners() {
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
                                <BannerData />
                            ) : usuarioLegued?.rol === 'colaborador' ? (
                                <SinPermisos />
                            ) : (
                                <SinPermisos />
                            )}
                        </>
                    ) : (
                        <BannerData />
                    )}

                </div>
            </section>
        </div>
    )
}

