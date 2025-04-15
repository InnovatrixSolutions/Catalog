import React, { useState, useEffect } from 'react';
import './Main.css'
import Header from '../Header/Header'
import HeaderDash from '../../Components/Admin/HeaderDash/HeaderDash'
import ProductosMain from '../../Components/Admin/ProductosMain/ProductosMain'
import ProductosMain2 from '../../Components/Admin/ProductosMain/ProductosMain2'
import PedidosMain from '../../Components/Admin/PedidosMain/PedidosMain'
import UsuariosMain from '../../Components/Admin/UsuariosMain/UsuariosMain'
import CardsCantidad from '../../Components/Admin/CardsCantidad/CardsCantidad'
import InfoUserMain from '../../Components/Admin/InfoUserMain/InfoUserMain'
import GraficoPedidos from '../../Components/Admin/Graficos/GraficoPedidos'
import GraficoProductos from '../../Components/Admin/Graficos/GraficoProductos'
import { fetchUsuario, getUsuario } from '../../Components/user';
export default function Main() {
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

                {loading ? (
                    < ></>
                ) : usuarioLegued?.idUsuario ? (
                    <>
                        {usuarioLegued?.rol === 'admin' ? (
                            <>
                                <div className='containerMain'>
                                    <div className='deFLexMain'>
                                        <CardsCantidad />
                                        <UsuariosMain />
                                    </div>
                                    <div className='graficosFlex'>
                                        <GraficoPedidos />
                                        <GraficoProductos />
                                    </div>
                                    <div className='deFLexMain'>
                                        <ProductosMain />
                                        <InfoUserMain />
                                    </div>

                                </div>
                                <PedidosMain />

                            </>
                        ) : usuarioLegued?.rol === 'colaborador' ? (
                            <>
                                <div className='containerMain'>
                                    <div className='deFLexMain'>
                                        <CardsCantidad />
                                        <ProductosMain2 />
                                    </div>

                                    <div className='deFLexMain'>
                                        <PedidosMain />
                                        <InfoUserMain />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className='containerMain'>
                                <div className='deFLexMain'>
                                    <PedidosMain />
                                    <InfoUserMain />
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <div className='containerMain'>
                            <div className='deFLexMain'>
                                <CardsCantidad />
                                <UsuariosMain />
                            </div>
                            <div className='graficosFlex'>
                                <GraficoPedidos />
                                <GraficoProductos />
                            </div>
                            <div className='deFLexMain'>
                                <ProductosMain />
                                <InfoUserMain />
                            </div>

                        </div>
                        <PedidosMain />

                    </>
                )}


                <div>

                </div>
            </section>
        </div>
    )
}
