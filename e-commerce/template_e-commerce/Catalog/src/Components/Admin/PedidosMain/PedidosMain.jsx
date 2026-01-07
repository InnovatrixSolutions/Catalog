import React, { useEffect, useState } from 'react';
import { Link as Anchor } from "react-router-dom";
import baseURL from '../../url';
import moneda from '../../moneda';
export default function PedidosMain() {
    const [pedidos, setPedidos] = useState([]);

    useEffect(() => {
        cargarPedidos();
    }, []);





    const cargarPedidos = () => {
        fetch(`${baseURL}/pedidoGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setPedidos(data.pedidos.reverse().slice(0, 5) || []);
                console.log(data.productos)
            })
            .catch(error => console.error('Error al cargar pedidos:', error));
    };


    return (


        <div className='table-containerProductos'>  
        
            <div className='deFlexMore'>
                <h3>Ultimos pedidos</h3>
                <Anchor to={`/dashboard/pedidos`} className='logo'>
                    Ver más
                </Anchor>
            </div>
            <table className='table'>
                <thead>
                    <tr>
                        <th>Id Pedido</th>
                        <th>Estado</th>
                        <th>Nombre</th>
                        <th>Telefono</th>
                        <th>Entrega</th>
                        <th>Lista de precio</th>
                        <th>Pago</th>
                        <th>Comisión</th>
                        <th>Envio</th>
                        <th>Valor envío</th>
                        <th>Total</th>
                        <th>Fecha</th>
                    </tr>
                </thead>
                <tbody>
                    {pedidos.map(item => (
                        <tr key={item.idProducto}>
                            <td>{item.idPedido}</td>

                            <td style={{
                                color: item.estado === 'Pendiente' ? '#DAA520' :
                                    item.estado === 'Preparacion' ? '#0000FF' :
                                        item.estado === 'Rechazado' ? '#FF0000' :
                                            item.estado === 'Entregado' ? '#008000' :
                                                '#3366FF'
                            }}>
                                {item?.estado}
                            </td>
                            <td>{item.nombre}</td>
                            <td>{item.telefono}</td>
                            <td>{item.entrega}</td>
                            <td>{item.listaPrecio}</td>
                            <td>{item.pago}</td>
                            <td>{item.comision}</td>
                            <td>{item.envio}</td>
                            <td>{item.valorEnvio}</td>
                            <td style={{ color: '#008000', }}>{moneda} {item.total}</td>
                            <td> {new Date(item?.createdAt)?.toLocaleString('es-ES', {
                                hour: '2-digit',
                                minute: '2-digit',
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                            })}</td>


                        </tr>
                    ))}
                </tbody>

            </table>
        </div>

    );
};
