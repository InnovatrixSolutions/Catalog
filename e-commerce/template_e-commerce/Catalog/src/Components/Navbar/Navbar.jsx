import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { Link as Anchor } from 'react-router-dom';
import logo from '../../images/logo.png';
import Nologo from '../../images/Nologo.jpeg';
import baseURL from '../url';
import 'swiper/swiper-bundle.css';
import Profile from '../Profile/Profile';
import './Navbar.css';
import Favoritos from '../Favoritos/Favoritos';
import InputSerach from '../InputSerach/InputSearchs';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tienda, setTienda] = useState([]);

    useEffect(() => {
        cargarBanners();
        cargarTienda();
    }, []);

    const cargarBanners = () => {
        fetch(`${baseURL}/bannersGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                console.log(data); // Agrega esto para ver la respuesta
                // Verifica que data.banner exista y sea un array
                const bannersSeleccionados = Array.isArray(data.banner) ?
                    data.banner.filter(banner => banner.seleccion === 'Si') : [];
                const bannerImages = bannersSeleccionados.map(banner => banner.imagen);
                setImages(bannerImages);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error al cargar productos:', error);
                setLoading(false); // Asegúrate de que loading se actualice en caso de error
            });
    };


    const cargarTienda = () => {
        fetch(`${baseURL}/tiendaGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setTienda(data?.tienda?.reverse()[0] || []);
            })
            .catch(error => console.error('Error al cargar datos:', error));
    };

    return (
        <header>
            <nav>
                <Anchor to={`/`} className='logo'>
                    {tienda?.imagen1 ? (
                        <img src={tienda?.imagen1} alt="logo" />
                    ) : (
                        <img src={Nologo} alt="logo" />
                        
                    )}


                    <div className='deColumnNav'>
                        {tienda?.nombre ? (
                            <h2>{tienda?.nombre}</h2>
                        ) : (
                            <h2>Mi Tienda</h2>
                        )}
                        {tienda?.eslogan ? (
                            <strong>{tienda?.eslogan}</strong>
                        ) : (
                            <strong>Mi Eslogan</strong>
                        )}


                    </div>
                </Anchor>

                <div className='deFLexNavs'>
                    <InputSerach />
                    <Favoritos />
                    <div className={`nav_toggle ${isOpen && "open"}`} onClick={() => setIsOpen(!isOpen)}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>

                <Modal
                    isOpen={isOpen}
                    onRequestClose={() => setIsOpen(false)}
                    className="modalNav"
                    overlayClassName="overlay"
                >
                    <div className="modalNav-content">
                        {loading ? (
                            <div className='loadingBannerFondo'></div>
                        ) : (
                            <>


                                {images.length > 0 ? ( // Verifica si hay imágenes
                                    <div className='fondo'>
                                        <img src={images[0]} alt="Banner" />
                                    </div>
                                ) : (
                                    <div className='space'></div> // Mensaje alternativo si no hay banners
                                )}
                                <Profile />
                            </>
                        )}
                    </div>
                </Modal>
            </nav>
        </header>
    );
}
