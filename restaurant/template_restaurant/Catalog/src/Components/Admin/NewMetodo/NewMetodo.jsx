import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import baseURL from '../../url';
import Swal from 'sweetalert2';
import { fetchUsuario, getUsuario } from '../../user';

export default function NewMetodo() {
    const [mensaje, setMensaje] = useState('');
    const [datos, setDatos] = useState('');
    const [tipo, setTipo] = useState('');
    const [estado, setEstado] = useState('');
    const [modalOpen, setModalOpen] = useState(false);

    const toggleModal = () => {
        setDatos('');
        setEstado('');
        setTipo('');
        setMensaje('');
        setModalOpen(!modalOpen);
    };

    const crear = async () => {
        const formData = new FormData();
        formData.append('tipo', tipo);
        formData.append('estado', estado);
        formData.append('datos', datos);

        setMensaje('Procesando...');

        try {
            const response = await fetch(`${baseURL}/metodoPost.php`, {
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
    const handleEstado = (e) => {
        setEstado(e.target.value);
    };
    const handleTipo = (e) => {
        setTipo(e.target.value);
    };
    // Trae usuario logueado
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
                            <span>+</span> Agregar
                        </button>
                    ) : usuarioLegued?.rol === 'colaborador' ? (
                        <button onClick={alertPermiso} className='btnSave'>
                            <span>  +</span>   Agregar
                        </button>
                    ) : (
                        <></>
                    )}
                </>
            ) : (
                <button onClick={toggleModal} className='btnSave'>
                    <span>+</span> Agregar
                </button>
            )}

            {modalOpen && (
                <div className='modal'>
                    <div className='modal-content'>
                        <div className='deFlexBtnsModal'>
                            <button className='selected'>Agregar Datos Bancarios</button>
                            <span className="close" onClick={toggleModal}>&times;</span>
                        </div>
                        <form >
                            <div className='flexGrap'>


                                <fieldset>
                                    <legend>Tipo (*)</legend>
                                    <select
                                        id="tipo"
                                        name="tipo"
                                        value={tipo}
                                        onChange={handleTipo}
                                    >
                                        <option value="">Selecciona opcion</option>
                                        <option value="Efectivo">Efectivo</option>
                                        <option value="Transferencia">Transferencia</option>
                                        <option value="Billetera Virtual">Billetera Virtual</option>
                                        <option value="Tarjeta credito / debito">Tarjeta credito / debito</option>
                                    </select>
                                </fieldset>
                                <fieldset>
                                    <legend>Estado (*)</legend>
                                    <select
                                        id="estado"
                                        name="estado"
                                        value={estado}
                                        onChange={handleEstado}
                                    >
                                        <option value="">Selecciona opcion</option>
                                        <option value="Activo">Activo</option>
                                        <option value="Inactivo">Inactivo</option>
                                    </select>
                                </fieldset>
                                <fieldset id='titulo'>
                                    <legend>Datos bancarios (Opcionales)</legend>
                                    <textarea
                                        name='datos'
                                        value={datos}
                                        onChange={(e) => setDatos(e.target.value)}
                                        rows="12" // Puedes ajustar el tamaño
                                        required
                                        placeholder={`CUENTA\nMercado Pago\n\nTITULAR\nJuan QuickOrder\n\nCVU\n00000011111111111111111\n\nAlias\njuan.2024.mp`}
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
