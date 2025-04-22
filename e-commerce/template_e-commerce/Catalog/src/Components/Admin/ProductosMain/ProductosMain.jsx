import React, { useEffect, useState } from 'react';
import { Link as Anchor } from "react-router-dom";
import './ProductosMain.css'
import baseURL from '../../url';
import moneda from '../../moneda';
export default function ProductosMain() {
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    useEffect(() => {
        cargarProductos();
        cargarCategoria()
    }, []);


    const cargarCategoria = () => {
        fetch(`${baseURL}/categoriasGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setCategorias(data.categorias || []);
                console.log(data.categorias)
            })
            .catch(error => console.error('Error al cargar contactos:', error));
    };


    const cargarProductos = () => {
        fetch(`${baseURL}/productosGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setProductos(data.productos.reverse().slice(0, 5) || []);
                console.log(data.productos)
            })
            .catch(error => console.error('Error al cargar productos:', error));
    };


    return (


        <div className='table-containerProductos'>
            <div className='deFlexMore'>
                <h3>Ultimos {productos?.length} productos</h3>
                <Anchor to={`/dashboard/productos`} className='logo'>
                    Ver más
                </Anchor>
            </div>
            <table className='table'>
                <thead>
                    <tr>
                        <th>Imagenx</th>
                        <th>Titulo</th>
                        <th>Precio</th>
                        <th>Categoria</th>
                    </tr>
                </thead>
                <tbody>
                    {productos.map(item => (
                        <tr key={item.idProducto}>
                            <td>
                                {item.imagen1 ? (
                                    <img src={item.imagen1} alt="imagen1" />
                                ) : (
                                    <span className='imgNonetd'>
                                        Sin imagen
                                    </span>
                                )}
                            </td>
                            <td>{item.titulo}</td>
                            <td style={{
                                color: '#008000',
                            }}>
                                {moneda} {`${item?.precio}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                            </td>

                            {categorias
                                .filter(categoriaFiltrada => categoriaFiltrada.idCategoria === item.idCategoria)
                                .map(categoriaFiltrada => (
                                    <td key={categoriaFiltrada.idCategoria} style={{ color: '#DAA520' }}>
                                        {categoriaFiltrada.categoria}
                                    </td>
                                ))
                            }



                        </tr>
                    ))}
                </tbody>

            </table>
        </div>

    );
};
