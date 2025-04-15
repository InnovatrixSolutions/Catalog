import React, { useRef, useState } from 'react';
import baseURL from '../../url';
import QRCode from 'qrcode';
import './QrGenerator.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQrcode } from '@fortawesome/free-solid-svg-icons';
import { Link as Anchor } from "react-router-dom";
export default function QrGenerator() {
    const qrRef = useRef();
    const [qrGenerated, setQrGenerated] = useState(false);

    const generateQrCode = async () => {
        try {
            const qrCanvas = qrRef.current;

            await QRCode.toCanvas(qrCanvas, baseURL);
            setQrGenerated(true);
        } catch (error) {
            console.error('Error generating QR Code', error);
        }
    };

    const downloadQRCode = () => {
        const qrCanvas = qrRef.current;
        const link = document.createElement('a');
        link.href = qrCanvas.toDataURL("image/png");
        link.download = 'qr-code.png';
        link.click();
    };

    const resetQrGenerator = () => {
        setQrGenerated(false);
        qrRef.current.getContext('2d').clearRect(0, 0, qrRef.current.width, qrRef.current.height); // Limpiar el canvas
    };

    return (
        <div className='QrGenerator'>
            {!qrGenerated ? (
                <Anchor onClick={generateQrCode} className='qrCodeGen '>
                    <FontAwesomeIcon icon={faQrcode} /> Generar QR
                </Anchor>
            ) : (
                <>
                    <Anchor onClick={downloadQRCode} className='qrCodeGen '>Descargar QR</Anchor>
                    <Anchor onClick={resetQrGenerator} className="close-button">X</Anchor>
                </>
            )}
            <canvas
                onClick={downloadQRCode}
                ref={qrRef}
                className={`canvas ${qrGenerated ? 'show' : 'hide'}`}
            ></canvas>
        </div>
    );
}
