import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit, faArrowUp, faArrowDown, faSync } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import 'jspdf-autotable';
import baseURL from '../../url';
import NewSubCategoria from '../NewSubCategoria/NewSubCategoria';
import { Link as Anchor } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { fetchUsuario, getUsuario } from '../../user';
export default function SubCategoriasData() {
    const [subcategorias, setSubCategorias] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [nuevaSubCategoria, setNuevaSubCategoria] = useState('');
    const [subcategoria, setSubCategoria] = useState({});
    const [selectedSection, setSelectedSection] = useState('texto');
    const [categorias, setCategoras] = useState([]);
    const location = useLocation();
    useEffect(() => {
        cargarSubCategoria();
        cargarCategoria();
    }, []);


    const cargarSubCategoria = () => {
        fetch(`${baseURL}/subCategoriaGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setSubCategorias(data.subcategorias || []);
                console.log(data.subcategorias)
            })
            .catch(error => console.error('Error al cargar contactos:', error));
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
    const deleted = (idSubCategoria) => {
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
                fetch(`${baseURL}/subCategoriaDelete.php?idSubCategoria=${idSubCategoria}`, {
                    method: 'DELETE',
                })
                    .then(response => {
                        // Manejo de errores HTTP
                        if (!response.ok) {
                            return response.json().then(data => {
                                throw new Error(data.error || 'Error desconocido');
                            });
                        }
                        return response.json();
                    })
                    .then(data => {
                        // Verifica que se recibió un mensaje de éxito
                        if (data.mensaje) {
                            // Mensaje de éxito solo si se eliminó
                            Swal.fire(
                                '¡Eliminado!',
                                data.mensaje,
                                'success'
                            );
                            cargarSubCategoria(); // Cargar nuevamente las subcategorías
                        } else {
                            // Si no hay mensaje de éxito, se muestra un error
                            Swal.fire(
                                'Error',
                                'No se puede eliminar la subcategoría porque hay productos asociados.',
                                'error'
                            );
                        }
                    })
                    .catch(error => {
                        console.error('Error al eliminar la subcategoría:', error);
                        Swal.fire(
                            'Error',
                            error.message || 'Ocurrió un error al eliminar la subcategoría.',
                            'error'
                        );
                    });
            }
        });
    };


    const abrirModal = (item) => {
        setSubCategoria(item);
        setNuevaSubCategoria(item.subcategoria);
        setModalVisible(true);
    };

    const cerrarModal = () => {
        setModalVisible(false);
    };



    const handleUpdateText = (idSubCategoria) => {
        const payload = {
            subcategoria: nuevaSubCategoria !== '' ? nuevaSubCategoria : subcategoria.subcategoria,

        };

        fetch(`${baseURL}/subCategoriaPut.php?idSubCategoria=${idSubCategoria}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    Swal.fire(
                        'Error!',
                        data.error,
                        'error'
                    );
                    console.log(nuevaSubCategoria)
                } else {
                    Swal.fire(
                        'Editado!',
                        data.mensaje,
                        'success'
                    );
                    cargarSubCategoria();
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
            <ToastContainer />
            <div className='deFlexContent'>
                <NewSubCategoria />
                <div className='deFlexLink'>
                    <Anchor to={`/dashboard/categorias`} className={location.pathname === '/dashboard/categorias' ? 'activeLin' : ''}>Categorias</Anchor>
                    <Anchor to={`/dashboard/categorias/subcategorias`} className={location.pathname === '/dashboard/categorias/subcategorias' ? 'activeLin' : ''}>Sub Categorias</Anchor>
                </div>
            </div>
            {modalVisible && (
                <div className="modal">
                    <div className="modal-content">
                        <div className='deFlexBtnsModal'>

                            <div className='deFlexBtnsModal'>
                                <button
                                    className={selectedSection === 'texto' ? 'selected' : ''}
                                    onClick={() => handleSectionChange('texto')}
                                >
                                    Editar Texto
                                </button>

                            </div>
                            <span className="close" onClick={cerrarModal}>
                                &times;
                            </span>
                        </div>
                        <div className='sectiontext' style={{ display: selectedSection === 'texto' ? 'flex' : 'none' }}>
                            <div className='flexGrap'>
                                <fieldset>
                                    <legend>SubCategoria</legend>
                                    <input
                                        type="text"
                                        value={nuevaSubCategoria}
                                        onChange={(e) => setNuevaSubCategoria(e.target.value)}
                                    />
                                </fieldset>

                            </div>

                            <button className='btnPost' onClick={() => handleUpdateText(subcategoria.idSubCategoria)} >Guardar</button>

                        </div>

                    </div>
                </div>
            )}
            <div className='table-container'>
                <table className='table'>
                    <thead>
                        <tr>
                            <th>Id SubCategoria</th>
                            <th>Categoria</th>
                            <th>Sub Categoria</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subcategorias?.map(item => (
                            <tr key={item.idSubCategoria}>
                                <td>{item.idSubCategoria}</td>
                                {categorias
                                    .filter(categoriaFiltrada => categoriaFiltrada.idCategoria === item.idCategoria)
                                    .map(categoriaFiltrada => (
                                        <td
                                            key={categoriaFiltrada.idCategoria}
                                            style={{ color: '#DAA520' }}
                                        >
                                            {categoriaFiltrada.categoria}
                                        </td>
                                    ))
                                }
                                <td>{item.subcategoria}</td>
                                <td>


                                    {loading ? (
                                        <></>
                                    ) : usuarioLegued?.idUsuario ? (
                                        <>
                                            {usuarioLegued?.rol === 'admin' ? (
                                                <>
                                                    <button className='eliminar' onClick={() => deleted(item.idSubCategoria)}>
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                    <button className='editar' onClick={() => abrirModal(item)}>
                                                        <FontAwesomeIcon icon={faEdit} />
                                                    </button>
                                                </>
                                            ) : usuarioLegued?.rol === 'colaborador' ? (
                                                <>
                                                    <button className='eliminar' onClick={alertPermiso}>
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                    <button className='editar' onClick={alertPermiso}>
                                                        <FontAwesomeIcon icon={faEdit} />
                                                    </button>
                                                </>
                                            ) : (
                                                <></>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <button className='eliminar' onClick={() => deleted(item.idSubCategoria)}>
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                            <button className='editar' onClick={() => abrirModal(item)}>
                                                <FontAwesomeIcon icon={faEdit} />
                                            </button>
                                        </>
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
