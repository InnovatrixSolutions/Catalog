import React from 'react'
import './SinPermisos.css'
import img from '../../images/no-permiso.webp'
export default function SinPermisos() {
    return (
        <div className='SinPermisos'>
            <img src={img} alt="imagen sin permisos" />
            <h1>No tienes permisos para esta ruta web</h1>
        </div>
    )
}
