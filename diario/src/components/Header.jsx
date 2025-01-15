import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext';
import './Header.css';
import logo from '../assets/images/EG 1.jpg';

function Header() {
  const { user, setUser } = useUser();
  const [trabajadorId, setTrabajadorId] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = localStorage.getItem('access');
    if (accessToken) {
      fetchUserProfile(accessToken);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 50;
      setIsScrolled(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
    { name: 'Cultura y sociedad', path: 'Cultura y sociedad' },
    { name: 'Mundo', path: 'Mundo' },
    { name: 'Revista Sociedad', path: 'https://diarioelgobierno.pe/revista-sociedad-lifestyle/', external: true },
  ];

  const handleSectionClick = (e, path) => {
    e.preventDefault();
    setIsMenuOpen(false);
    navigate(`/seccion/${encodeURIComponent(path)}`);
  };

  const handleExternalLink = (e) => {
    setIsMenuOpen(false);
  };

  const renderAuthLinks = () => (
    user ? (
      <>
        <button
          className="button-common"
          onClick={() => {
            handleLogout();
            setIsMenuOpen(false);
          }}
        >
          Cerrar sesión
        </button>
        {trabajadorId && (
          <Link
            to={`/trabajador/${trabajadorId}`}
            className="button-common"
            onClick={() => setIsMenuOpen(false)}
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
          onClick={() => setIsMenuOpen(false)}
        >
          Iniciar sesión
        </Link>
        <Link
          to="/register"
          className="button-common"
          onClick={() => setIsMenuOpen(false)}
        >
          Registrarse
        </Link>
      </>
    )
  );

  return (
    <>
      <div className="header-spacer" />
      <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <div className="header-content">
            <Link to="/home" className="logo">
              <img src={logo} alt="Logo Diario El Gobierno" className="logo-image" />
              DIARIO EL GOBIERNO
            </Link>
  
            {/* Botón hamburguesa simplificado */}
            <button 
              className="hamburger-button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? '✕' : '☰'}
            </button>
          </div>
  
          <div className="sections-container">
            {/* Menú de escritorio */}
            <nav className="nav-menu">
              {sections.map((section) => (
                section.external ? (
                  <a
                    key={section.path}
                    href={section.path}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {section.name}
                  </a>
                ) : (
                  <Link
                    key={section.path}
                    to={`/seccion/${encodeURIComponent(section.path)}`}
                  >
                    {section.name}
                  </Link>
                )
              ))}
            </nav>
  
            {/* Overlay para el menú móvil */}
            <div 
              className={`mobile-menu-overlay ${isMenuOpen ? 'open' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            />
  
            {/* Menú móvil */}
            <nav className={`navv-menu ${isMenuOpen ? 'open' : ''}`}>
              {sections.map((section) => (
                section.external ? (
                  <a
                    key={section.path}
                    href={section.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsMenuOpen(false)}
                    className="mobile-section-link"
                  >
                    {section.name}
                  </a>
                ) : (
                  <Link
                    key={section.path}
                    to={`/seccion/${encodeURIComponent(section.path)}`}
                    onClick={() => setIsMenuOpen(false)}
                    className="mobile-section-link"
                  >
                    {section.name}
                  </Link>
                )
              ))}
              
              <div className="mobile-auth-links">
                {renderAuthLinks()}
              </div>
            </nav>
          </div>
  
          <div className="header-actions">
            {renderAuthLinks()}
          </div>
        </div>
      </header>
    </>
  );
}

export default Header;