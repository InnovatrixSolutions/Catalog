import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import './UsuariosInfoEdit.css';
import 'react-toastify/dist/ReactToastify.css';
export default function EditUserModal({ user, onClose, onSave }) {

    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [confirmContrasena, setConfirmContrasena] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errorContrasena, setErrorContrasena] = useState('');

    useEffect(() => {
        if (user) {
            setNombre(user.nombre || '');
            setEmail(user.email || '');
            
        }
    }, [user]);

    if (!user) {
        return null;
    }

    const handleSave = (e) => {
        e.preventDefault();
        if (contrasena !== confirmContrasena) {
            setErrorContrasena('Las contraseñas no coinciden');
            return;
        }

        const updatedUser = {
            idUsuario: user.idUsuario,
            nombre,
            email,
            contrasena
        };

        onSave(updatedUser);
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <div className='deFlexBtnsModal'>
                    <button className='selected'>Editar Información del Usuario</button>
                    <span className="close" onClick={onClose}>&times;</span>
                </div>

                <form onSubmit={handleSave} className='form'>
                    <div className='flexGrap'>
                        <fieldset>
                            <legend>Nombre</legend>
                            <input
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                required
                            />
                        </fieldset>
                        <fieldset>
                            <legend>Email</legend>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </fieldset>

                        <fieldset>
                            <legend>Nueva Contraseña</legend>
                            <div className='deFlexPass'>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={contrasena}
                                    onChange={(e) => setContrasena(e.target.value)}
                                    placeholder="Dejar en blanco si no se cambia"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                </button>
                            </div>
                        </fieldset>
                        <fieldset>
                            <legend>Confirmar Contraseña</legend>
                            <div className='deFlexPass'>
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmContrasena}
                                    onChange={(e) => setConfirmContrasena(e.target.value)}
                                    placeholder="Confirma la nueva contraseña"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                                </button>
                            </div>
                            {errorContrasena && (
                                <p style={{ color: 'red', fontSize: '0.9rem' }}>{errorContrasena}</p>
                            )}
                        </fieldset>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button type="submit" className='btnPost'>Guardar</button>
                    {/* <button severity="danger" className='btnCancel' onClick={onClose}>Cancelar</button> */}
                    
                    </div>
                    
                </form>
            </div>
        </div>
    );
}
