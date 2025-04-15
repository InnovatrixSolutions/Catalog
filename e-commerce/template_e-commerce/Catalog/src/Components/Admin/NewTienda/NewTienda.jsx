import React, { useState } from 'react';
import './NewTienda.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import baseURL from '../../url';
import imageIcon from '../../../images/camera.png';

export default function NewTienda() {
    const [mensaje, setMensaje] = useState('');
    const [imagenPreview, setImagenPreview] = useState([null]);
    const [isImageSelected, setIsImageSelected] = useState([false]);
    const [nombre, setNombre] = useState('');
    const [telefono, setTelefono] = useState('');
    const [email, setEmail] = useState('');
    const [eslogan, setEslogan] = useState('');
    const [direccion, setDireccion] = useState('');
    const [facebook, setFacebook] = useState('');
    const [instagram, setInstagram] = useState('');
    const [modalOpen, setModalOpen] = useState(false);

    const toggleModal = () => {
        setModalOpen(!modalOpen);
    };

    const handleImagenChange = (event, index) => {
        const file = event.target.files[0];
        if (file) {
            const previewURL = URL.createObjectURL(file);
            setImagenPreview(prev => {
                const newPreviews = [...prev];
                newPreviews[index] = previewURL;
                return newPreviews;
            });
            setIsImageSelected(prev => {
                const newSelection = [...prev];
                newSelection[index] = true;
                return newSelection;
            });
        }
    };

    const eliminarImagen = (index) => {
        setImagenPreview(prev => {
            const newPreviews = [...prev];
            newPreviews[index] = null;
            return newPreviews;
        });
        setIsImageSelected(prev => {
            const newSelection = [...prev];
            newSelection[index] = false;
            return newSelection;
        });
    };

    const crear = async () => {
        const form = document.getElementById("crearForm");
        const formData = new FormData(form);

        formData.append('direccion', direccion);
        formData.append('facebook', facebook);
        formData.append('instagram', instagram);

        const resetForm = () => {
            form.reset();
            setImagenPreview([null]);
            setIsImageSelected([false]);
            setDireccion('');
            setFacebook('');
            setInstagram('');
        };

        setMensaje('');

        if (!formData.get('nombre') || !formData.get('telefono') || !formData.get('imagen1')) {
            toast.error('Por favor, complete todos los campos correctamente.');
            return;
        }

        setMensaje('Procesando...');

        try {
            const response = await fetch(`${baseURL}/tiendaPost.php`, {
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
                console.log(data.error);
            }
        } catch (error) {
            console.error('Error:', error);
            setMensaje('');
            toast.error('Error de conexión. Por favor, inténtelo de nuevo.');
        }
    };

    return (
        <div className='NewContain'>
            <ToastContainer />
            <button onClick={toggleModal} className='btnSave'>
                <span> +</span> Agregar
            </button>
            {modalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <div className='deFlexBtnsModal'>
                            <button className='selected'>Agregar Tienda</button>
                            <span className="close" onClick={toggleModal}>&times;</span>
                        </div>
                        <form id="crearForm">
                            <div className='flexGrap'>
                                <div id='previevImagesLogoBanner'>
                                    {[...Array(1)].map((_, index) => (
                                        <div key={index} className='image-input'>
                                            <input
                                                type="file"
                                                id={`imagen${index + 1}`}
                                                name={`imagen${index + 1}`}
                                                accept="image/*"
                                                onChange={(e) => handleImagenChange(e, index)}
                                                style={{ display: 'none' }}
                                                required
                                            />
                                            <label htmlFor={`imagen${index + 1}`} className={`image-label ${isImageSelected[index] ? 'selectedImage' : ''}`}>
                                                {isImageSelected[index] ? (
                                                    <img src={imagenPreview[index]} alt={`Vista previa ${index + 1}`} id='previevImagesLogo' />
                                                ) : (
                                                    <img src={imageIcon} alt="Seleccionar imagen" id='previevImagesLogoIconNew' />
                                                )}
                                            </label>
                                            {isImageSelected[index] && (
                                                <button type="button" onClick={() => eliminarImagen(index)} className='eliminar-imagen'>
                                                    Eliminar
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <fieldset>
                                    <legend>Nombre (*)</legend>
                                    <input
                                        type="text"
                                        id="nombre"
                                        name="nombre"
                                        required
                                        value={nombre}
                                        onChange={(e) => setNombre(e.target.value)}
                                    />
                                </fieldset>
                                <fieldset>
                                    <legend>Telefono (*)</legend>
                                    <input
                                        type="text"
                                        id="telefono"
                                        name="telefono"
                                        required
                                        value={telefono}
                                        onChange={(e) => setTelefono(e.target.value)}
                                    />
                                </fieldset>
                                <fieldset>
                                    <legend>Dirección (*)</legend>
                                    <input
                                        type="text"
                                        id="direccion"
                                        name="direccion"
                                        value={direccion}
                                        onChange={(e) => setDireccion(e.target.value)}
                                    />
                                </fieldset>
                                <fieldset>
                                    <legend>Eslogan </legend>
                                    <input
                                        type="text"
                                        id="eslogan"
                                        name="eslogan"
                                        value={eslogan}
                                        onChange={(e) => setEslogan(e.target.value)}
                                    />
                                </fieldset>

                                <fieldset>
                                    <legend>Email </legend>
                                    <input
                                        type="text"
                                        id="email"
                                        name="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </fieldset>

                                <fieldset>
                                    <legend>Facebook </legend>
                                    <input
                                        type="text"
                                        id="facebook"
                                        name="facebook"
                                        value={facebook}
                                        onChange={(e) => setFacebook(e.target.value)}
                                    />
                                </fieldset>
                                <fieldset>
                                    <legend>Instagram </legend>
                                    <input
                                        type="text"
                                        id="instagram"
                                        name="instagram"
                                        value={instagram}
                                        onChange={(e) => setInstagram(e.target.value)}
                                    />
                                </fieldset>
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
