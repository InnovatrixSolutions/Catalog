import React, { useState, useEffect } from 'react';
import './NewBanner.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import baseURL from '../../url';
import imageIcon from '../../../images/imageIcon.png';
import Swal from 'sweetalert2';
import { fetchUsuario, getUsuario } from '../../user';
import planes from '../../planes';
export default function NewBanner() {
    const [mensaje, setMensaje] = useState('');
    const [imagenPreview, setImagenPreview] = useState(null);
    const [isImageSelected, setIsImageSelected] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    const toggleModal = () => {
        setModalOpen(!modalOpen);
    };

    const handleImagenChange = (event) => {
        const file = event.target.files[0];

        if (file) {
            const previewURL = URL.createObjectURL(file);
            setImagenPreview(previewURL);
            setIsImageSelected(true);
        }
    };

    const eliminarImagen = () => {
        setImagenPreview(null);
        setIsImageSelected(false);
    };

    const crear = async () => {
        const form = document.getElementById("crearForm");
        const formData = new FormData(form);
        const resetForm = () => {
            form.reset();
            setImagenPreview(null);
            setIsImageSelected(false);
        };
        setMensaje('');

        if (!formData.get('imagen')) {
            toast.error('Por favor, seleccione una imagen.');
            return;
        }

        setMensaje('Procesando...');

        try {
            const response = await fetch(`${baseURL}/bannersPost.php`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.mensaje) {
                setMensaje('');
                resetForm();
                toast.success(data.mensaje);
                window.location.reload();
            } else if (data.error) {
                setMensaje('');
                toast.error(data.error);
            }
        } catch (error) {
            console.error('Error:', error);
            setMensaje('');
            toast.error('Error de conexión. Por favor, inténtelo de nuevo.');
        }
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

    //Calcular limite de Plan-----------------------------
    const plan = planes[0]?.plan
    const limitePlan = planes[0]?.limiteBanner
    const mensagePlan = `¡Alcanzaste el límite del plan ${plan}! <br/>Tu límite son ${limitePlan} banners`
    const [banners, setBanners] = useState([]);
    const alertPlan = () => {
        cargarBanners();
        Swal.fire(
            '¡Error!',
            mensagePlan,
            'error'
        );
    };
    useEffect(() => {
        cargarBanners();

    }, []);
    const cargarBanners = () => {
        fetch(`${baseURL}/bannersGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setBanners(data.banner);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error al cargar banners:', error)

            });
    };
    return (
        <div className='NewContain'>
            <ToastContainer />
            {loading ? (
                <></>
            ) : usuarioLegued?.idUsuario ? (
                <>
                    {usuarioLegued?.rol === 'admin' ? (
                        <>
                            {
                                banners?.length < limitePlan ? (
                                    <button onClick={toggleModal} className='btnSave'>
                                        <span>+</span> Agregar
                                    </button>

                                ) : (
                                    <button onClick={alertPlan} className='btnSave'>
                                        <span>+</span> Agregar
                                    </button>
                                )
                            }
                        </>
                    ) : usuarioLegued?.rol === 'colaborador' ? (
                        <>
                            {
                                banners?.length < limitePlan ? (
                                    <button onClick={toggleModal} className='btnSave'>
                                        <span>+</span> Agregar
                                    </button>

                                ) : (
                                    <button onClick={alertPlan} className='btnSave'>
                                        <span>+</span> Agregar
                                    </button>
                                )
                            }
                        </>
                    ) : (
                        <></>
                    )}
                </>
            ) : (
                <>
                    {
                        banners?.length < limitePlan ? (
                            <button onClick={toggleModal} className='btnSave'>
                                <span>+</span> Agregar
                            </button>

                        ) : (
                            <button onClick={alertPlan} className='btnSave'>
                                <span>+</span> Agregar
                            </button>
                        )
                    }
                </>
            )}
            {modalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <div className='deFlexBtnsModal'>
                            <button className='selected'>Agregar Banner</button>
                            <span className="close" onClick={toggleModal}>&times;</span>
                        </div>
                        <legend className='legenda'>Para obtener una mejor calidad de visualización, sugerimos que las imágenes tengan una resolución de aproximadamente 1600 x 900 píxeles y se guarden en formatos .JPG o .PNG.</legend>
                        <form id="crearForm">
                            <div className="flexGrap">
                                <input
                                    type="file"
                                    id="imagen"
                                    name="imagen"
                                    accept="image/*"
                                    onChange={handleImagenChange}
                                    style={{ display: 'none' }} // Ocultar input file
                                    required
                                />
                                <label htmlFor="imagen" className={`image-banner-label ${isImageSelected ? 'selectedImage' : ''}`}>
                                    {isImageSelected ? (
                                        <img src={imagenPreview} alt="Vista previa" className='image-banner-prev' />
                                    ) : (
                                        <img src={imageIcon} alt="Seleccionar imagen" className='image-banner' />
                                    )}
                                </label>
                                {/* {isImageSelected && (
                                    <button type="button" onClick={eliminarImagen} className='eliminar-imagen'>
                                        Eliminar
                                    </button>
                                )} */}
                            </div>
                            {mensaje ? (
                                <button type="button" className='btnLoading' disabled>
                                    {mensaje}
                                </button>
                            ) : (
                                <button type="button" onClick={crear} className='btnPost'>
                                    Agregar
                                </button>
                            )}
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
