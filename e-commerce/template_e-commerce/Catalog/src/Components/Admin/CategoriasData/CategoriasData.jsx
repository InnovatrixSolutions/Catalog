import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import './CategoriasData.css';
import 'jspdf-autotable';
import baseURL from '../../url';
import NewCategoria from '../NewCategoria/NewCategoria';
import NewSubCategoria from '../NewSubCategoria/NewSubCategoria';

export default function CategoriasData() {
    const [categorias, setCategorias] = useState([]);
    const [subcategorias, setSubCategorias] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalVisible2, setModalVisible2] = useState(false);
    const [nuevaCategoria, setNuevaCategoria] = useState('');
    const [categoria, setCategoria] = useState({});
    const [nuevaSubCategoria, setNuevaSubCategoria] = useState('');
    const [subcategoria, setSubCategoria] = useState({});
    const [selectedSection, setSelectedSection] = useState('texto');
    useEffect(() => {
        cargarCategoria();
        cargarSubCategoria();
    }, []);

    const cargarSubCategoria = () => {
        fetch(`${baseURL}/subCategoriaGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setSubCategorias(data.subcategorias || []);
                console.log(data.subcategorias);
            })
            .catch(error => console.error('Error al cargar subcategorías:', error));
    };

    const cargarCategoria = () => {
        fetch(`${baseURL}/categoriasGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                const categoriasOrdenadas = (data.categorias || []).sort((a, b) => a.orden - b.orden);
                setCategorias(categoriasOrdenadas);
                console.log(categoriasOrdenadas);
            })
            .catch(error => console.error('Error al cargar categorías:', error));
    };

    const abrirModal = (item) => {
        setCategoria(item);
        setNuevaCategoria(item.categoria);
        setModalVisible(true);
    };

    const cerrarModal = () => {
        setModalVisible(false);
    };

    const abrirModal2 = (item) => {
        setSubCategoria(item);
        setNuevaSubCategoria(item.subcategoria);
        setModalVisible2(true);
    };

    const cerrarModal2 = () => {
        setModalVisible2(false);
    };

    const cambiarOrden = (idCategoria1, idCategoria2, nuevoOrden1, nuevoOrden2) => {
        fetch(`${baseURL}/categoriasOrdenPut.php`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                idCategoria1,
                idCategoria2,
                nuevoOrden1,
                nuevoOrden2
            }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.log(data.error)
                } else {
                    console.log(data.mensaje)
                    cargarCategoria();
                }
            })
            .catch(error => console.error('Error al cambiar el orden:', error));
    };

    const moverArriba = (index) => {
        if (index === 0) return; // La primera categoría no se puede mover hacia arriba
        const categoriaActual = categorias[index];
        const categoriaAnterior = categorias[index - 1];
        cambiarOrden(categoriaActual.idCategoria, categoriaAnterior.idCategoria, categoriaAnterior.orden, categoriaActual.orden);
    };

    const moverAbajo = (index) => {
        if (index === categorias.length - 1) return; // La última categoría no se puede mover hacia abajo
        const categoriaActual = categorias[index];
        const categoriaSiguiente = categorias[index + 1];
        cambiarOrden(categoriaActual.idCategoria, categoriaSiguiente.idCategoria, categoriaSiguiente.orden, categoriaActual.orden);
    };

    const eliminar = (idCategoria) => {
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
                fetch(`${baseURL}/categoriaDelete.php?idCategoria=${idCategoria}`, {
                    method: 'DELETE',
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.error) {
                            // Si el servidor devuelve un error, mostramos un mensaje de error
                            Swal.fire(
                                'Error',
                                data.error,
                                'error'
                            );
                        } else {
                            // Si la categoría se eliminó correctamente, mostramos un mensaje de éxito
                            Swal.fire(
                                '¡Eliminado!',
                                data.mensaje,
                                'success'
                            );
                            window.location.reload();
                            cargarCategoria();
                        }
                    })
                    .catch(error => {
                        console.error('Error al eliminar contacto:', error);
                        Swal.fire(
                            'Error',
                            'Ocurrió un problema al intentar eliminar la categoría.',
                            'error'
                        );
                    });
            }
        });
    };
    const eliminarSubcategoria = (idSubCategoria) => {
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

    const handleUpdateText = (idCategoria) => {
        const payload = {
            categoria: nuevaCategoria !== '' ? nuevaCategoria : categoria.categoria,

        };

        fetch(`${baseURL}/categoriaPut.php?idCategoria=${idCategoria}`, {
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
                    console.log(idCategoria)
                } else {
                    Swal.fire(
                        'Editado!',
                        data.mensaje,
                        'success'
                    );
                    cargarCategoria();
                    cerrarModal();
                }
            })
            .catch(error => {
                console.log(error.message);
                toast.error(error.message);
            });
    };
    const handleUpdateTextSubCategoria = (idSubCategoria) => {
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
                    cerrarModal2();
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
    return (
        <div>
            <h1 className='titles-text-heading'>Categorias</h1>
            <div className='deFlexContentBtns'>
                <NewCategoria />
                <NewSubCategoria />
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
                                    <legend>Categoria</legend>
                                    <input
                                        type="text"
                                        value={nuevaCategoria !== '' ? nuevaCategoria : categoria.categoria}
                                        onChange={(e) => setNuevaCategoria(e.target.value)}
                                    />
                                </fieldset>

                            </div>

                            <button className='btnPost' onClick={() => handleUpdateText(categoria.idCategoria)} >Guardar</button>

                        </div>

                    </div>
                </div>
            )}
            {modalVisible2 && (
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
                            <span className="close" onClick={cerrarModal2}>
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

                            <button className='btnPost' onClick={() => handleUpdateTextSubCategoria(subcategoria.idSubCategoria)} >Guardar</button>

                        </div>

                    </div>
                </div>
            )}
            <div className='table-container'>
                <div className='table'>
                    <div id='tbody'>
                        {categorias?.map((item, index) => (
                            <>
                                <div key={item.idCategoria} className='CategoriConten'>
                                    <td style={{ color: '#DAA520' }}>
                                        {item.orden}- {item.categoria}</td>
                                    <td className='tdFlex'>
                                        {index > 0 && (
                                            <button onClick={() => moverArriba(index)} className='btnCategori'>
                                                <FontAwesomeIcon icon={faChevronUp} />
                                            </button>
                                        )}
                                        {index < categorias.length - 1 && (
                                            <button onClick={() => moverAbajo(index)} className='btnCategori'>
                                                <FontAwesomeIcon icon={faChevronDown} />
                                            </button>
                                        )}
                                        <button className='eliminar' onClick={() => eliminar(item.idCategoria)}>
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                        <button className='editar' onClick={() => abrirModal(item)}>
                                            <FontAwesomeIcon icon={faEdit} />
                                        </button>
                                    </td>
                                </div>
                                <div className='subCategori'>
                                    {subcategorias?.filter(subcategoria => subcategoria.idCategoria === item.idCategoria)?.map(item => (
                                        <div key={item.idSubCategoria} className='CategoriConten'>
                                            <td> - {item.subcategoria}</td>
                                            <td>

                                                <button className='eliminar' onClick={() => eliminarSubcategoria(item.idSubCategoria)}>
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                                <button className='editar' onClick={() => abrirModal2(item)}>
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </button>
                                            </td>
                                        </div>
                                    ))}
                                </div>
                            </>

                        ))}
                    </div>


                </div>
            </div>
        </div>
    );
}
