import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext';
import './Header.css';

function Header() {
  const { user, setUser } = useUser();
  const [trabajadorId, setTrabajadorId] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = localStorage.getItem('access');
    if (accessToken) {
      fetchUserProfile(accessToken);
    }
  }, []);

  const fetchUserProfile = async (accessToken) => {
    try {
      const response = await fetch('http://localhost:8000/diarioback/user-profile/', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) throw new Error('Error fetching user profile');

      const data = await response.json();
      setTrabajadorId(data.id || null);
    } catch (error) {
      console.error(error);
      handleLogout();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    setUser(null);
    setTrabajadorId(null);
    navigate('/login');
  };

  const sections = [
    { name: 'Portada', path: 'Portada' },
    { name: 'Política', path: 'Política' },
    { name: 'Economía', path: 'Economía' },
    { name: 'Cultura', path: 'Cultura' },
    { name: 'Mundo', path: 'Mundo' },
    { name: 'Deportes', path: 'Deportes' },
  ];

  const renderAuthLinks = () => (
    user ? (
      <>
        <button
          className="button-common"
          onClick={() => {
            handleLogout();
            setIsMenuOpen(false); // Cerrar el menú móvil
          }}
        >
          Cerrar sesión
        </button>
        {trabajadorId && (
          <Link
            to={`/trabajador/${trabajadorId}`}
            className="button-common"
            onClick={() => setIsMenuOpen(false)} // Cerrar el menú móvil
          >
            Perfil
          </Link>
        )}
      </>
    ) : (
      <>
        <Link
          to="/login"
          className="button-common"
          onClick={() => setIsMenuOpen(false)} // Cerrar el menú móvil
        >
          Iniciar sesión
        </Link>
        <Link
          to="/register"
          className="button-common"
          onClick={() => setIsMenuOpen(false)} // Cerrar el menú móvil
        >
          Registrarse
        </Link>
      </>
    )
  );
  
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/home" className="logo">
            DIARIO EL GOBIERNO
          </Link>

          {/* Botón de menú hamburguesa */}
          <button className="hamburger-button" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            ☰
          </button>
        </div>

        {/* Menú de escritorio */}
        <nav className="nav-menu">
          {sections.map((section) => (
            <Link key={section.path} to={`/seccion/${encodeURIComponent(section.path)}`}>
              {section.name}
            </Link>
          ))}
        </nav>

        {/* Menú móvil */}
        <nav className={`navv-menu ${isMenuOpen ? 'open' : ''}`}>
          {/* Secciones */}
          {sections.map((section) => (
            <Link
              key={section.path}
              to={`/seccion/${encodeURIComponent(section.path)}`}
              onClick={() => setIsMenuOpen(false)}
              className="mobile-section-link"
            >
              {section.name}
            </Link>
          ))}

          {/* Botones de autenticación */}
          <div className="mobile-auth-links">
            {renderAuthLinks()}
          </div>
        </nav>

        {/* Acciones del encabezado para escritorio */}
        <div className="header-actions">{renderAuthLinks()}</div>
      </div>
    </header>
  );
}

export default Header;