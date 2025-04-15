import React, { useEffect, useState } from 'react';
import './InputSearch.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faSearch } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { fetchUsuario, getUsuario } from '../../user';
export default function InputSearch() {
    const [searchTerm, setSearchTerm] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const enlaces = [
        { title: 'Productos', link: '/dashboard/productos' },
        { title: 'Banners', link: '/dashboard/banners' },
        { title: 'Usuarios', link: '/dashboard/usuarios' },
        { title: 'Información de mi tienda', link: '/dashboard/mi-tienda' },
        { title: 'Metodos de pago', link: '/dashboard/metodos-de-pago' },
        { title: 'Categorias', link: '/dashboard/categorias' },
        { title: 'Promociones', link: '/dashboard/promociones' },
        { title: 'Pedidos', link: '/dashboard/pedidos' },
    ];
    const enlaces2 = [
        { title: 'Productos', link: '/dashboard/productos' },
        { title: 'Categorias', link: '/dashboard/categorias' },
        { title: 'Pedidos', link: '/dashboard/pedidos' },
    ];
    const enlaces3 = [
        { title: 'Pedidos', link: '/dashboard/pedidos' },
    ];
    const handleSearch = (event) => {
        const searchTerm = event.target.value;
        setSearchTerm(searchTerm);
        setModalOpen(searchTerm !== "");
    };

    const closeModal = () => {
        setModalOpen(false);
    };

    const filteredEnlaces = enlaces.filter((enlace) =>
        enlace.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const filteredEnlaces2 = enlaces2.filter((enlace) =>
        enlace.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const filteredEnlaces3 = enlaces3.filter((enlace) =>
        enlace.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    //Trae usuario logueado-----------------------------
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            await fetchUsuario(); // Llama a la función para obtener datos del usuario
            setLoading(false);
        };

        fetchData();
    }, []);

    const usuarioLegued = getUsuario();
    return (


        <div className="inputSearchDashboard">
            <div className='search'>
                <FontAwesomeIcon icon={faSearch} className="search-icon" />
                <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="input"
                />
            </div>
            {modalOpen && (
                <div className="modalInput">

                    {loading ? (
                        <></>
                    ) : usuarioLegued?.idUsuario ? (
                        <>
                            {usuarioLegued?.rol === 'admin' ? (
                                <>
                                    {filteredEnlaces.length > 0 ? (
                                        filteredEnlaces.map((enlace, index) => (
                                            <div key={index}>

                                                <Link to={enlace.link} onClick={closeModal} className='link'>
                                                    <FontAwesomeIcon icon={faSignOutAlt} />
                                                    {enlace.title}
                                                </Link>
                                            </div>
                                        ))
                                    ) : (
                                        <p>No hay resultados.</p>
                                    )}
                                </>
                            ) : usuarioLegued?.rol === 'colaborador' ? (
                                <>
                                    {filteredEnlaces2.length > 0 ? (
                                        filteredEnlaces2.map((enlace, index) => (
                                            <div key={index}>

                                                <Link to={enlace.link} onClick={closeModal} className='link'>
                                                    <FontAwesomeIcon icon={faSignOutAlt} />
                                                    {enlace.title}
                                                </Link>
                                            </div>
                                        ))
                                    ) : (
                                        <p>No hay resultados.</p>
                                    )}
                                </>
                            ) : (
                                <>
                                    {filteredEnlaces3.length > 0 ? (
                                        filteredEnlaces3.map((enlace, index) => (
                                            <div key={index}>

                                                <Link to={enlace.link} onClick={closeModal} className='link'>
                                                    <FontAwesomeIcon icon={faSignOutAlt} />
                                                    {enlace.title}
                                                </Link>
                                            </div>
                                        ))
                                    ) : (
                                        <p>No hay resultados.</p>
                                    )}
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            {filteredEnlaces.length > 0 ? (
                                filteredEnlaces.map((enlace, index) => (
                                    <div key={index}>

                                        <Link to={enlace.link} onClick={closeModal} className='link'>
                                            <FontAwesomeIcon icon={faSignOutAlt} />
                                            {enlace.title}
                                        </Link>
                                    </div>
                                ))
                            ) : (
                                <p>No hay resultados.</p>
                            )}
                        </>
                    )}

                </div>
            )}
        </div>



    );
}
