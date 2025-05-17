import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit, faCamera, faArrowDown, faSync, faEye } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import imageIcon from '../../../images/camera.png';
import 'jspdf-autotable';
import baseURL from '../../url';
import NewTienda from '../NewTienda/NewTienda';
import './TiendaData.css'
import { Link as Anchor } from "react-router-dom";
import { fetchUsuario, getUsuario } from '../../user';

export default function TiendaData() {
    const [tienda, setTienda] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [nuevoNombre, setNuevoNombre] = useState('');
    const [nuevoTelefono, setNuevoTelefono] = useState(0);
    const [nuevoEmail, setNuevoEmail] = useState('');
    const [nuevaDireccion, setNuevaDireccion] = useState('');
    const [nuevoFacebook, setNuevoFacebook] = useState('');
    const [nuevoInstagram, setNuevoInstagram] = useState('');
    const [modalImagenVisible, setModalImagenVisible] = useState(false);
    const [imagenSeleccionada, setImagenSeleccionada] = useState('');
    const [imagenPreview, setImagenPreview] = useState(null);
    const [nuevaImagen, setNuevaImagen] = useState(null);
    const [selectedSection, setSelectedSection] = useState('texto');
    const [nuevoEslogan, setNuevoEslogan] = useState('');

    useEffect(() => {
        cargarTiendaPrincipal();
    }, []);

    const cargarTiendaPrincipal = () => {
        fetch(`${baseURL}/tiendaGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                const tiendaPrincipal = data.tienda?.[0];
                if (tiendaPrincipal) {
                    setTienda(tiendaPrincipal);
                    setNuevoNombre(tiendaPrincipal.nombre);
                    setNuevoTelefono(tiendaPrincipal.telefono);
                    setNuevoEmail(tiendaPrincipal.email);
                    setNuevoEslogan(tiendaPrincipal.eslogan);
                    setNuevoInstagram(tiendaPrincipal.instagram);
                    setNuevoFacebook(tiendaPrincipal.facebook);
                    setNuevaDireccion(tiendaPrincipal.direccion);
                    setModalVisible(true);  // Abre el modal al cargar la tienda principal
                }
            })
            .catch(error => console.error('Error al cargar datos:', error));
    };
    const abrirModalImagenSeleccionada = (imagen) => {
        setImagenSeleccionada(imagen);
        setModalImagenVisible(true);
    };
    const cerrarModal = () => {
        setModalVisible(false);
    };

    const handleFileChange = (event, setFile, setPreview) => {
        const file = event.target.files[0];

        if (file) {
            // Crear una URL de objeto para la imagen seleccionada
            const previewURL = URL.createObjectURL(file);
            setFile(file);
            setPreview(previewURL);
        }
    };

    const handleUpdateText = async (idTienda) => {
        const payload = {
            nuevoNombre: nuevoNombre !== '' ? nuevoNombre : tienda.nombre,
            nuevoTelefono: nuevoTelefono !== '' ? nuevoTelefono : tienda.telefono,
            nuevoEmail: nuevoEmail !== undefined ? nuevoEmail : tienda.email,
            nuevoEslogan: nuevoEslogan !== undefined ? nuevoEslogan : tienda.eslogan,
            nuevaDireccion: nuevaDireccion !== '' ? nuevaDireccion : tienda.direccion,
            nuevoInstagram: nuevoInstagram !== undefined ? nuevoInstagram : tienda.instagram,
            nuevoFacebook: nuevoFacebook !== undefined ? nuevoFacebook : tienda.facebook,
        };

        fetch(`${baseURL}/tiendaTextPut.php?idTienda=${idTienda}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    Swal.fire('Error!', data.error, 'error');
                } else {
                    Swal.fire('Editado!', data.mensaje, 'success');
                    setModalVisible(false);
                    cargarTiendaPrincipal();  // Recargar la tienda principal
                }
            })
            .catch(error => {
                console.log(error.message);
                toast.error(error.message);
            });
    };

    const handleEditarImagenBanner = async (idTienda) => {
        const formData = new FormData();
        formData.append('idTienda', idTienda);
        formData.append('updateAction', 'update'); // Campo adicional para indicar que es una actualización

        if (nuevaImagen) {
            formData.append('imagen1', nuevaImagen);
        }


        fetch(`${baseURL}/tiendaImagePut.php`, {
            method: 'POST',  // Cambiado a POST
            body: formData
        })
            .then(response => {
                // Manejar el caso cuando la respuesta no es un JSON válido o está vacía
                if (!response.ok) {
                    throw new Error('La solicitud no fue exitosa');

                }

                return response.json();
            })
            .then(data => {
                if (data.error) {

                    toast.error(data.error);
                    console.log(formData)
                } else {

                    toast.success(data.mensaje);
                    window.location.reload();
                }
            })
            .catch(error => {
                console.log(error)
                toast.error(error.message);
                console.log(formData)
                console.log(idTienda)
            });
    };
    const eliminar = (idTienda) => {
        // Reemplaza el window.confirm con SweetAlert2
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
                fetch(`${baseURL}/tiendaDelete.php?idTienda=${idTienda}`, {
                    method: 'DELETE',
                })
                    .then(response => response.json())
                    .then(data => {
                        Swal.fire(
                            '¡Eliminado!',
                            data.mensaje,
                            'success'
                        );
                        cargarTiendaPrincipal();
                        window.location.reload();
                    })
                    .catch(error => {
                        console.error('Error al eliminar la Producto:', error);
                        toast.error(error);
                    });
            }
        });
    };
    async function guardarCambios(idTienda) {
        try {
            await handleEditarImagenBanner(idTienda);
            await handleUpdateText(idTienda);
            Swal.fire('¡Éxito!', 'Los cambios se han guardado correctamente.', 'success');
        } catch (error) {
            console.error('Error al guardar los cambios:', error);
            toast.error('Error al guardar los cambios');
        }
    }
    return (
        <div>
            <ToastContainer />
            <h1 className='titles-text-heading'>Datos de la tienda</h1>
            <div className='deFlexContent'>
                {
                    !tienda &&
                    <NewTienda />
                }
            </div>
            {tienda && (
                <div className='sectiontextTienda' style={{ display: selectedSection === 'texto' ? 'flex' : 'none' }}>

                    <div id='previevImagesLogoBanner'>
                        {imagenPreview ? (
                            <img src={imagenPreview} alt="Vista previa de la imagen" onClick={() => abrirModalImagenSeleccionada(tienda.imagen1)} id='previevImagesLogo' />
                        ) : (
                            <>
                                {tienda.imagen1 ? (
                                    <img src={tienda.imagen1} alt="imagen" onClick={() => abrirModalImagenSeleccionada(tienda.imagen1)} id='previevImagesLogo' />

                                ) : (
                                    <span className='imgNone'>
                                        No hay imagen

                                    </span>
                                )}
                            </>
                        )}
                        <div className='image-input'>
                            <div>
                                <img
                                    src={imageIcon}
                                    alt="Imagen de ejemplo"
                                    id='previevImagesLogoIcon'
                                    onClick={() => document.getElementById('fileInput1').click()} // Al hacer clic, simula un clic en el input
                                />
                                <input
                                    id="fileInput1"
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }} // Oculta el input
                                    onChange={(e) => handleFileChange(e, setNuevaImagen, setImagenPreview)}
                                />
                            </div>
                        </div>
                    </div>
                    <div className='flexGrap'>
                        <fieldset>
                            <legend>Nombre  (*)</legend>
                            <input
                                type="text"
                                value={nuevoNombre}
                                onChange={(e) => setNuevoNombre(e.target.value)}
                            />
                        </fieldset>
                        <fieldset>
                            <legend>Telefono  (*)</legend>
                            <input
                                type="number"
                                value={nuevoTelefono}
                                onChange={(e) => setNuevoTelefono(e.target.value)}
                            />
                        </fieldset>
                        <fieldset>
                            <legend>Direccíon  (*)</legend>
                            <input
                                type="text"
                                value={nuevaDireccion}
                                onChange={(e) => setNuevaDireccion(e.target.value)}
                            />
                        </fieldset>


                        <fieldset>
                            <legend>Email  </legend>
                            <input
                                type="email"
                                value={nuevoEmail}
                                onChange={(e) => setNuevoEmail(e.target.value)}
                            />
                        </fieldset>
                        <fieldset>
                            <legend>Eslogan </legend>
                            <input
                                type="text"
                                value={nuevoEslogan}
                                onChange={(e) => setNuevoEslogan(e.target.value)}
                            />
                        </fieldset>
                        <fieldset>
                            <legend>Facebook </legend>
                            <input
                                type="text"
                                value={nuevoFacebook}
                                onChange={(e) => setNuevoFacebook(e.target.value)}
                            />
                        </fieldset>
                        <fieldset>
                            <legend>Instagram  </legend>
                            <input
                                type="text"
                                value={nuevoInstagram}
                                onChange={(e) => setNuevoInstagram(e.target.value)}
                            />
                        </fieldset>


                    </div>
                    <div className='deFlexBtnTienda'>
                        <button className='btnPost' onClick={() => guardarCambios(tienda.idTienda)} >Guardar </button>

                        <button className='eliminarBtn' onClick={() => eliminar(tienda.idTienda)}>
                            <FontAwesomeIcon icon={faTrash} />
                        </button>

                    </div>

                </div>
            )}
        </div>
    );
}
