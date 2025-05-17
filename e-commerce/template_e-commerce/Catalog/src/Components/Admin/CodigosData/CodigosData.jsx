import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import baseURL from '../../url';
import NewCodigo from '../NewCodigo/NewCodigo';
import moneda from '../../moneda';
import { fetchUsuario, getUsuario } from '../../user';
export default function CodigosData() {
    const [codigos, setCodigos] = useState([]);
    const [categorias, setCategoras] = useState([]);
    useEffect(() => {
        cargarCodigos();
        cargarCategoria();
    }, []);

    const cargarCodigos = () => {
        fetch(`${baseURL}/codigosGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setCodigos(data.codigos || []);
            })
            .catch(error => console.error('Error al cargar códigos:', error));
    };
    const cargarCategoria = () => {
        fetch(`${baseURL}/categoriasGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setCategoras(data.categorias || []);
                console.log(data.categorias)
            })
            .catch(error => console.error('Error al cargar contactos:', error));
    };
    const eliminar = (idCodigo) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: '¡No podrás revertir esto!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${baseURL}/codigosDelete.php?idCodigo=${idCodigo}`, {
                    method: 'DELETE',
                })
                    .then(response => response.json())
                    .then(data => {
                        Swal.fire(
                            '¡Eliminado!',
                            data.mensaje,
                            'success'
                        );
                        window.location.reload();
                        cargarCodigos();
                    })
                    .catch(error => {
                        console.error('Error al eliminar código:', error);
                        toast.error(error);
                    });
            }
        });
    };

    //Trae usuario logueado-----------------------------
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchData = async () => {
            await fetchUsuario();
            setLoading(false);
        };

        fetchData();
    }, []);
    const usuarioLegued = getUsuario();
    const alertPermiso = () => {
        Swal.fire(
            '¡Error!',
            '¡No tienes permisos!',
            'error'
        );
    }


    return (
        <div>
            <h1 className='titles-text-heading'>Códigos promocionales</h1>
            <ToastContainer />
            <NewCodigo />


            <div className='table-container'>
                <table className='table'>
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Descuento</th>
                            <th>Tipo de cupón</th>
                            <th>Límite de uso</th>
                            <th>Oferta sobre</th>
                            <th>Desde</th>
                            <th>Hasta</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {codigos.map(item => (
                            <tr key={item.idCodigo}>
                                <td>{item.codigo}</td>


                                {
                                    item?.tipo === 'fijo' ? (
                                        <td style={{ color: 'green' }}>{moneda} {item.descuento}</td>
                                    ) : item?.tipo === 'porcentaje' ? (
                                        <td style={{ color: 'green' }}>% {item.descuento}</td>
                                    ) : (
                                        <td></td>
                                    )
                                }
                                {
                                    item?.tipo === 'fijo' ? (
                                        <td>Monto fijo</td>
                                    ) : item?.tipo === 'porcentaje' ? (
                                        <td>Porcentaje de descuento</td>
                                    ) : (
                                        <td></td>
                                    )
                                }

                                {
                                    item?.limite === 0 ? (
                                        <td>Sin límite de uso</td>
                                    ) : item?.limite >= 1 ? (
                                        <td>Cantidad de usos ({item.limite})</td>
                                    ) : (
                                        <td></td>
                                    )
                                }

                                {
                                    categorias
                                        ?.filter(categoriaFiltrada => categoriaFiltrada.idCategoria === item.idCategoria)
                                        ?.length > 0 ? (
                                        categorias
                                            ?.filter(categoriaFiltrada => categoriaFiltrada.idCategoria === item.idCategoria)
                                            ?.map(categoriaFiltrada => (
                                                <td
                                                    key={categoriaFiltrada.idCategoria}
                                                    style={{ color: '#DAA520' }}
                                                >
                                                    {categoriaFiltrada.categoria}
                                                </td>
                                            ))
                                    ) : (
                                        <td style={{ color: '#DAA520' }}>
                                            {JSON.parse(item.productos).map(producto => (
                                                <>{producto.titulo} </>
                                            ))}
                                        </td>
                                    )
                                }

                                <td> {new Date(item?.desde)?.toLocaleString('es-ES', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                })}</td>
                                <td> {new Date(item?.hasta)?.toLocaleString('es-ES', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                })}</td>

                                <td>
                                    {loading ? (
                                        <></>
                                    ) : usuarioLegued?.idUsuario ? (
                                        <>
                                            {usuarioLegued?.rol === 'admin' ? (
                                                <>
                                                    <button className='eliminar' onClick={() => eliminar(item.idCodigo)}>
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                </>
                                            ) : usuarioLegued?.rol === 'colaborador' ? (
                                                <>
                                                    <button className='eliminar' onClick={alertPermiso}>
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                </>
                                            ) : (
                                                <></>
                                            )}
                                        </>
                                    ) : (
                                        <button className='eliminar' onClick={() => eliminar(item.idCodigo)}>
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    )}


                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
