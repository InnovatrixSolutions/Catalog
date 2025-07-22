import React from 'react'
import Banners from '../../Components/Banners/Banners'
import Products from '../../Components/Products/ProductsPrimeReact'
import './Demo.css'
import Footer from '../../Components/Footer/Footer'
import BtnWhatsapp from '../../Components/BtnWhatsapp/BtnWhatsapp'
import Cart from '../../Components/Cart/Cart'
import Developer from '../../Components/Developer/Developer'
export default function Demo() {
    return (
        <section className='demo'>
            <Banners />
            <Products />
            <Footer />
            <Developer />
            <BtnWhatsapp />
            <Cart />
        </section>
    )
}
