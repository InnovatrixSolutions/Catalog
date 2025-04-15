import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import 'jspdf-autotable';
import baseURL from '../../url';
import NewMetodo from '../NewMetodo/NewMetodo';
import { fetchUsuario, getUsuario } from '../../user';
import './MetodosData.css'
export default function MetodosData() {
    const [metodos, setMetodos] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [nuevoDatos, setNuevoDatos] = useState('');
    const [nuevoEstado, setNuevoEstado] = useState('');
    const [nuevoTipo, setNuevoTipo] = useState('');
    const [datos, setDatos] = useState({});
    const [selectedSection, setSelectedSection] = useState('texto');
    const [detallesVisibles, setDetallesVisibles] = useState({});
    useEffect(() => {
        cargarMetodos();
    }, []);

    const cargarMetodos = () => {
        fetch(`${baseURL}/metodoGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setMetodos(data.metodos || []);
                console.log(data.metodos);
            })
            .catch(error => console.error('Error al cargar datos bancarios:', error));
    };

    const editar = (idMetodo) => {
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
                fetch(`${baseURL}/metodoDelete.php?idMetodo=${idMetodo}`, {
                    method: 'DELETE',
                })
                    .then(response => response.json())
                    .then(data => {
                        Swal.fire('¡Eliminado!', data.mensaje, 'success');
                        cargarMetodos();
                    })
                    .catch(error => {
                        console.error('Error al eliminar datos bancarios:', error);
                        toast.error(error);
                    });
            }
        });
    };

    const abrirModal = (item) => {
        setDatos(item);
        setNuevoDatos(item.datos);
        setNuevoTipo(item.tipo);
        setNuevoEstado(item.estado);
        setModalVisible(true);
    };

    const cerrarModal = () => {
        setModalVisible(false);
    };

    const handleUpdateDatos = (idMetodo) => {
        const payload = {
            datos: nuevoDatos !== undefined ? nuevoDatos : datos.datos,
            tipo: nuevoTipo !== '' ? nuevoTipo : datos.tipo,
            estado: nuevoEstado !== '' ? nuevoEstado : datos.estado,
        };

        fetch(`${baseURL}/metodoPut.php?idMetodo=${idMetodo}`, {
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
                    cargarMetodos();
                    cerrarModal();
                }
            })
            .catch(error => {
                console.log(error.message);
                toast.error(error.message);
            });
    };

    const handleSectionChange = (section) => {
        setSelectedSection(section);
    };

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
        Swal.fire('¡Error!', '¡No tienes permisos!', 'error');
    };
    const toggleDetalles = (idMetodo) => {
        setDetallesVisibles((prev) => ({
            ...prev,
            [idMetodo]: !prev[idMetodo],
        }));
    };
    return (
        <div>
            <ToastContainer />
            <NewMetodo />

            {modalVisible && (
                <div className="modal">
                    <div className="modal-content">
                        <div className='deFlexBtnsModal'>
                            <div className='deFlexBtnsModal'>
                                <button
                                    className={selectedSection === 'texto' ? 'selected' : ''}
                                    onClick={() => handleSectionChange('texto')}
                                >
                                    Editar Datos
                                </button>
                            </div>
                            <span className="close" onClick={cerrarModal}>&times;</span>
                        </div>
                        <div className='sectiontext' style={{ display: selectedSection === 'texto' ? 'flex' : 'none' }}>
                            <div className='flexGrap'>
                                <fieldset>
                                    <legend>Tipo (*)</legend>
                                    <select
                                        name="tipo"
                                        value={nuevoTipo}
                                        onChange={(e) => setNuevoTipo(e.target.value)}
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
                                        name="estado"
                                        value={nuevoEstado}
                                        onChange={(e) => setNuevoEstado(e.target.value)}
                                    >
                                        <option value="">Selecciona opcion</option>
                                        <option value="Activo">Activo</option>
                                        <option value="Inactivo">Inactivo</option>
                                    </select>
                                </fieldset>
                            </div>

                            <fieldset id='titulo'>
                                <legend>Datos bancarios (Opcionales)</legend>
                                <textarea
                                    rows="12"
                                    value={nuevoDatos}
                                    onChange={(e) => setNuevoDatos(e.target.value)}
                                    placeholder={`CUENTA\nMercado Pago\n\nTITULAR\nJuan QuickOrder\n\nCVU\n00000011111111111111111\n\nAlias\njuan.2024.mp`}
                                />
                            </fieldset>
                            <button className='btnPost' onClick={() => handleUpdateDatos(datos.idMetodo)} >Guardar </button>
                        </div>
                    </div>
                </div>
            )}
            <div >
                <div className='cardsMetodos'>
                    {metodos.map(item => (
                        <div key={item.idMetodo} className='card'>
                            <h3>{item.tipo}</h3>
                            <span key={item.idMetodo} style={{
                                color: item.estado === 'Activo' ? '#008000' :
                                    item.estado === 'Inactivo' ? '#FF0000' :
                                        '#000000'
                            }}>
                                {item.estado}
                            </span>
                            {/* {
                                item?.datos && (
                                    <button onClick={() => toggleDetalles(item.idMetodo)} className='moreBtn'>
                                        {detallesVisibles[item.idMetodo] ? 'Mostrar menos' : `Mostrar más`}
                                    </button>
                                )
                            }
                            {detallesVisibles[item.idMetodo] && (
                                <span>{item.datos}</span>
                            )} */}
                            <td>
                                {loading ? (
                                    <></>
                                ) : usuarioLegued?.idUsuario ? (
                                    <>
                                        {usuarioLegued?.rol === 'admin' ? (
                                            <div className='card-actions'>
                                                <button className='eliminar' onClick={() => editar(item.idMetodo)}>
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                                <button className='editar' onClick={() => abrirModal(item)}>
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </button>
                                            </div>
                                        ) : usuarioLegued?.rol === 'colaborador' ? (
                                            <div className='card-actions'>
                                                <button className='eliminar' onClick={alertPermiso}>
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                                <button className='editar' onClick={alertPermiso}>
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </button>
                                            </div>
                                        ) : (
                                            <></>
                                        )}
                                    </>
                                ) : (
                                    <div className='card-actions'>
                                        <button className='eliminar' onClick={() => editar(item.idMetodo)}>
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                        <button className='editar' onClick={() => abrirModal(item)}>
                                            <FontAwesomeIcon icon={faEdit} />
                                        </button>
                                    </div>
                                )}
                            </td>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
