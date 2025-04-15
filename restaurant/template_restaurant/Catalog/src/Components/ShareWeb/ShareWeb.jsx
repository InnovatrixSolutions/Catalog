import React from 'react';
import './ShareWeb.css';

export default function ShareWeb() {
    function handleShare() {
        if (navigator.share) {
            navigator.share({
                title: 'Mi Catálogo',
                text: `Echa un vistazo a mi Catálogo:`,
                url: window.location.href,
            })
                .then(() => console.log('Contenido compartido correctamente'))
                .catch((error) => console.error('Error al compartir:', error));
        } else {
            console.error('La API de compartir no está disponible en este navegador.');
        }
    }

    return (
        <button onClick={handleShare} className="share-button">
            Compartir en.. <i className='fa fa-share'></i>
        </button>
    );
}
