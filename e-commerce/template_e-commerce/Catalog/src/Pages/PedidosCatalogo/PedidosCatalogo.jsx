
import React from 'react'
import Header from '../Header/Header'
import PedidosData from '../../Components/Admin/PedidosData/PedidosData'
import HeaderDash from '../../Components/Admin/HeaderDash/HeaderDash'
export default function PedidosCatalogo() {
    return (
        <div className='containerGrid'>
            <Header />

            <section className='containerSection'>

                <HeaderDash />
                <div className='container'>
                    {/* <PedidosData /> */}
                    <h1>Pedidos Catalogo</h1>
                </div>
            </section>
        </div>
    )
}
