import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faUser } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Login.css';
import { useNavigate, } from 'react-router';
import baseURL from '../../url';
import logo from '../../../images/logo.png'
import { Link as Anchor } from 'react-router-dom';
export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const formData = new FormData();
            formData.append('email', email);
            formData.append('contrasena', password);
            formData.append('iniciar_sesion', true);

            const response = await fetch(`${baseURL}/login.php`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                if (data.mensaje) {
                    console.log(data);
                    console.log(data.mensaje);
                    toast.success(data.mensaje);

                    // ✅ Save user info to sessionStorage
                    const usuario = data.usuario || data; // fallback if your API sends plain user
                    sessionStorage.setItem('usuario', JSON.stringify(usuario));
                    console.log('👤 Usuario guardado en sessionStorage:', usuario);

                    setTimeout(() => {
                        //window.location.reload();
                        //window.location.hrf== '/dashboard';
                        navigate('/dashboard');

                    }, 500);

                } else if (data.error) {
                    setErrorMessage(data.error);
                    console.log(data.error);
                    toast.error(data.error);
                }
            } else {
                throw new Error('Error en la solicitud al servidor');

            }
        } catch (error) {
            console.error('Error:', error.message);
            toast.error(error.message);
        }
    };

    return (
        <div className='formContain'>
            <ToastContainer />
            <Anchor to={`/`} >
                {/* <img src={logo} alt="" /> */}
                <FontAwesomeIcon icon={faUser} className='logoAtuh' />
            </Anchor>
            <h2>Administrador</h2>
            <form onSubmit={handleLogin} className='formAuth'>
                <div className='inputsAuth'>
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="Email"
                    />
                </div>
                <div className='inputsAuth'>
                    <label htmlFor="password">Contraseña:</label>
                    <div className='deFlexInputs'>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Contraseña"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                        </button>
                    </div>
                </div>

                <button type="submit" className='btn'>
                    Iniciar Sesión
                </button>
            </form>


        </div>
    );
}
