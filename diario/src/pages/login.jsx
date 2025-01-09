import React, { useState } from 'react';
import axios from './axiosConfig';
import { useNavigate, Link } from 'react-router-dom'; // Importar Link para navegar
import { useUser } from '../UserContext';
import './login.css';

const Login = () => {
    const { setUser } = useUser();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('login/', { username, password });
            const { access, refresh, trabajador } = response.data;

            // Guardar tokens en localStorage
            localStorage.setItem('access', access);
            localStorage.setItem('refresh', refresh);

            // Almacenar información del usuario en el contexto y localStorage
            const userData = { ...trabajador, access, refresh }; 
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData)); 

            // Verificar si es un trabajador y redirigir
            if (trabajador) {
                console.log("ID del trabajador:", trabajador.id);
                navigate('/admin/dashboard');
                window.location.reload();
            } else {
                navigate('/home');
                window.location.reload();
            }
        } catch (err) {
            if (err.response && err.response.status === 401) {
                setError('Credenciales inválidas');
            } else {
                setError('Error en el servidor. Inténtalo de nuevo más tarde.');
            }
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2 style={{ color: '#003366' }}>Iniciar sesión</h2>
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleLogin}>
                    <label>
                        usuario:
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        contraseña:
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </label>
                    <button type="submit" className="login-button">Iniciar sesión</button>
                </form>
                {/* Aquí agregamos el enlace para registrarse */}
                <p className="signup-text">
                    ¿No tienes una cuenta? <Link to="/register">Regístrate aquí</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
