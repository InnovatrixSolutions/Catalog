import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import baseURL from '../../url';
import Swal from 'sweetalert2';
import { fetchUsuario, getUsuario } from '../../user';
export default function NewSubCategoria() {
    const [mensaje, setMensaje] = useState('');
    const [subcategoria, setSubCategoria] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [categorias, setCategoras] = useState([]);
    const [categoria, setCategoria] = useState('');
    const toggleModal = () => {
        setSubCategoria('');
        setMensaje('');
        setModalOpen(!modalOpen);
    };
    const handleCategoriaChange = (e) => {
        setCategoria(e.target.value);
    };

    useEffect(() => {
        cargarCategoria();
    }, []);

    const cargarCategoria = () => {
        fetch(`${baseURL}/categoriasGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setCategoras(data.categorias || []);
                console.log(data.categorias);
            })
            .catch(error => console.error('Error al cargar contactos:', error));
    };

    const crear = async () => {
        const formData = new FormData();
        formData.append('subcategoria', subcategoria);
        formData.append('idCategoria', categoria);
        setMensaje('Procesando...');

        try {
            const response = await fetch(`${baseURL}/subCategoriaPost.php`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.mensaje) {
                setMensaje('');
                toast.success(data.mensaje);
                toggleModal();
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
    return (
        <div className='NewContain'>
            <ToastContainer />
            {loading ? (
                <></>
            ) : usuarioLegued?.idUsuario ? (
                <>
                    {usuarioLegued?.rol === 'admin' ? (
                        <button onClick={toggleModal} className='btnSave'>
                            <span>+</span> SubCategoria
                        </button>
                    ) : usuarioLegued?.rol === 'colaborador' ? (
                        <button onClick={toggleModal} className='btnSave'>
                            <span>+</span> SubCategoria
                        </button>
                    ) : (
                        <></>
                    )}
                </>
            ) : (
                <button onClick={toggleModal} className='btnSave'>
                    <span>+</span> SubCategoria
                </button>
            )}
            {modalOpen && (
                <div className='modal'>
                    <div className='modal-content'>
                        <div className='deFlexBtnsModal'>
                            <button className='selected'>Agregar SubCategoria</button>
                            <span className="close" onClick={toggleModal}>&times;</span>
                        </div>
                        <form id="crearForm">
                            <div className='flexGrap'>
                                <fieldset>
                                    <legend>Categoría (*)</legend>
                                    <select
                                        id="idCategoria"
                                        name="idCategoria"
                                        value={categoria}
                                        onChange={handleCategoriaChange}
                                    >
                                        <option value="">Selecciona una categoría</option>
                                        {categorias.map(item => (
                                            <option key={item.idCategoria} value={item.idCategoria}>{item.categoria}</option>
                                        ))}
                                    </select>
                                </fieldset>
                                <fieldset>
                                    <legend>Subcategoria  (*)</legend>
                                    <input
                                        type='text'
                                        name='subcategoria'
                                        value={subcategoria}
                                        onChange={(e) => setSubCategoria(e.target.value)}
                                    />
                                </fieldset>
                            </div>
                            {mensaje ? (
                                <button type='button' className='btnLoading' disabled>
                                    {mensaje}
                                </button>
                            ) : (
                                <button type='button' onClick={crear} className='btnPost'>
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
