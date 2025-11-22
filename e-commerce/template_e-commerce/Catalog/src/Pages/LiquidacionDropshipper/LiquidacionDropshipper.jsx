
import React from 'react'
import Header from '../Header/Header'
import HeaderDash from '../../Components/Admin/HeaderDash/HeaderDash'
import LiquidacionData from './LiquidacionData'
export default function LiquidacionDropshipper() {
    return (
        <div className='containerGrid'>
            <Header />

            <section className='containerSection'>

                <HeaderDash />
                <div className='container'>
                    
                    <LiquidacionData /> 
                </div>
            </section>
        </div>
    )
}
