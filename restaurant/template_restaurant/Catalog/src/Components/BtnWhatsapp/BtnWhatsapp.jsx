import React, { useState, useEffect } from 'react';
import './BtnWhatsapp.css';
import whatsappIcon from '../../images/wpp.png';
import Modal from 'react-modal';
import baseURL from '../url';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';

export default function BtnWhatsapp() {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [tienda, setTienda] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [noteText, setNoteText] = useState('¡Hola! Estoy interesado en..');


    useEffect(() => {
        cargarTienda()
    }, []);
    const cargarTienda = () => {
        fetch(`${baseURL}/tiendaGet.php`, {
            method: 'GET',
        })
            .then(response => response.json())
            .then(data => {
                setTienda(data.tienda.reverse() || []);
            })
            .catch(error => console.error('Error al cargar datos:', error));
    };

    const openModal = () => {
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    const handleWhatsappMessage = () => {
        if (selectedContact || tienda?.length <= 1) {
            const phoneNumber = tienda?.length <= 1 ? tienda[0]?.telefono : selectedContact?.telefono;

            let noteMessage = '';
            if (noteText.trim() !== '') {
                noteMessage += `\n ${noteText}`;
            }

            const message = `${noteMessage}`;

            //const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
            const whatsappUrl = `https://api.whatsapp.com/send?phone=${'+573166402868'}&text=${encodeURIComponent(message)}`;

            window.open(whatsappUrl, '_blank');

            setNoteText('');
            closeModal();
        }
    };

    return (
        <div className='containWpp'>
            <button className='btnWhatsapp' onClick={openModal}>
                <img src={whatsappIcon} alt="whatsappIcon" />
            </button>

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                className="modal-wpp"
                overlayClassName="overlay-wpp"
            >
                <div className='containModalWpp'>


                    <div className='headerWpp'>

                        {tienda.length > 1 ? (
                            <span>
                                Selecciona un teléfono
                            </span>
                        ) : (
                            <span>
                                Envíanos un mensaje
                            </span>
                        )}
                        <button onClick={closeModal} className='closeBtn'>
                            X
                        </button>
                    </div>
                    <div className='mensaje'>
                        <p>Hola, ¿en qué podemos ayudarte? 👋</p>
                    </div>

                    <div className='btnsWpp'>
                        {tienda.length > 1 && (
                            <div className='btnsWpp'>
                                {tienda.map(item => (
                                    <button
                                        key={item.idContacto}
                                        className='btnWpp'
                                        style={{ backgroundColor: selectedContact && selectedContact.idContacto === item.idContacto ? 'green' : '' }}
                                        onClick={() => setSelectedContact(item)}
                                    >
                                        {item.telefono}
                                        <img src={whatsappIcon} alt="whatsappIcon" />
                                    </button>
                                ))}
                            </div>
                        )}


                    </div>
                    <div className='sendWpp'>
                        <textarea
                            placeholder="Envíanos un mensaje"
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                        />
                        <button onClick={handleWhatsappMessage}>
                            <FontAwesomeIcon icon={faPaperPlane} />
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
