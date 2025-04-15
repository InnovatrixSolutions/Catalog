import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faCheck } from '@fortawesome/free-solid-svg-icons';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import baseURL from '../../url';
import './BannerData.css';
import NewBanner from '../NewBanner/NewBanner';
import { fetchUsuario, getUsuario } from '../../user';

export default function BannerData() {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const usuarioLegued = getUsuario();

    useEffect(() => {
        cargarBanners();
        const fetchData = async () => {
            await fetchUsuario();
            setLoading(false);
        };
        fetchData();
    }, []);

    const cargarBanners = () => {
        fetch(`${baseURL}/bannersGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setBanners(data.banner || []);
                console.log(data.banner);
            })
            .catch(error => console.error('Error al cargar banners:', error));
    };

    const eliminarBanner = (idBanner) => {
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
                fetch(`${baseURL}/bannerDelete.php?idBanner=${idBanner}`, {
                    method: 'DELETE',
                })
                    .then(response => response.json())
                    .then(data => {
                        Swal.fire('¡Eliminado!', data.mensaje, 'success');
                        window.location.reload();
                        cargarBanners();
                    })
                    .catch(error => {
                        console.error('Error al eliminar el banner:', error);
                    });
            }
        });
    };

    const editarSeleccion = (idBanner) => {
        Swal.fire({
            title: 'Mostrar en el menu principal',
            text: 'Seleccione "Si" o "No" para el campo seleccion:',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí',
            cancelButtonText: 'No',
        }).then((result) => {
            // Solo actualiza si se confirma o se selecciona "No"
            if (result.isConfirmed || result.dismiss === Swal.DismissReason.cancel) {
                const nuevaSeleccion = result.isConfirmed ? 'Si' : 'No';
                fetch(`${baseURL}/bannersPut.php?idBanner=${idBanner}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ seleccion: nuevaSeleccion }),
                })
                    .then(response => response.json())
                    .then(data => {
                        Swal.fire('Actualizado', data.mensaje, 'success');
                        cargarBanners();
                    })
                    .catch(error => {
                        console.error('Error al actualizar el banner:', error);
                    });
            }
        });
    };


    const alertPermiso = () => {
        Swal.fire('¡Error!', '¡No tienes permisos!', 'error');
    };

    return (
        <div className='BannerContainer'>
            <NewBanner />
            <div className='BannerWrap'>
                {banners.map(item => (
                    <div className='cardBanner' key={item.idBanner}>
                        <img src={item.imagen} alt="banner" />
                        {
                            item.seleccion === 'Si' &&
                            <span className='spanBanner' style={{ color: '#008000' }}>Seleccionado</span>
                        }
                        {loading ? null : usuarioLegued?.idUsuario ? (
                            <>
                                {usuarioLegued?.rol === 'admin' ? (
                                    <div className='btnsBanner'>
                                        <button className='btnBannerDelete' onClick={() => eliminarBanner(item.idBanner)}>
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                        <button
                                            className='btnBannerEdit'
                                            onClick={() => editarSeleccion(item.idBanner)}
                                        >
                                            <FontAwesomeIcon icon={faCheck} />
                                        </button>

                                    </div>
                                ) : usuarioLegued?.rol === 'colaborador' ? (

                                    <div className='btnsBanner'>
                                        <button className='btnBannerDelete' onClick={alertPermiso}>
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                        <button
                                            className='btnBannerEdit'
                                            onClick={alertPermiso}
                                        >
                                            <FontAwesomeIcon icon={faCheck} />
                                        </button>

                                    </div>
                                ) : null}
                            </>
                        ) : (
                            <div className='btnsBanner'>
                                <button className='btnBannerDelete' onClick={() => eliminarBanner(item.idBanner)}>
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                                <button
                                    className='btnBannerEdit'
                                    onClick={() => editarSeleccion(item.idBanner)}
                                >
                                    <FontAwesomeIcon icon={faCheck} />
                                </button>

                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
