import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  const sections = [
    { name: 'Portada', path: 'Portada' },
    { name: 'Economía', path: 'Economía' },
    { name: 'Cultura', path: 'Cultura' },
    { name: 'Deportes', path: 'Deportes' },
    { name: 'Política', path: 'Política' },
    { name: 'Mundo', path: 'Mundo' },
  ];

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Secciones</h3>
            <ul>
              {sections.map((section) => (
                <li key={section.path}>
                  <Link to={`/seccion/${encodeURIComponent(section.path)}`}>
                    {section.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="footer-section">
            <h3>Ayuda</h3>
            <ul>
              {/* <li><Link to="/ayuda">Ayuda</Link></li> */}
              {/* <li><Link to="/atencion-al-socio">Atención al socio</Link></li> */}
              <li><Link to="/terminos-y-condiciones">Términos y condiciones</Link></li>
              <li><Link to="/anunciar">¿Cómo anunciar?</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Redes sociales:</h3>
            <div className="social-icons">
              <a href="https://www.linkedin.com/company/diario-el-gobierno-ar/mycompany/" target="_blank" rel="noopener noreferrer" className="linkedin-icon">
                <img src="/icons/linkedinLogo.png" alt="LinkedIn" />
              </a>
              <a href="https://www.instagram.com/diarioelgobierno.ar/" target="_blank" rel="noopener noreferrer" className="instagram-icon">
                <img src="/icons/instagramLogo.png" alt="Instagram" />
              </a>
            </div>
          </div>
        </div>
        <div className="footer-info">
          <p>Director: Fernán Saguier | </p>
          <p>ISSN (DiarioElGobierno) 2469-0597</p>
          <p>Propietario: S.A. DiarioElGobierno - Calle 123, Cda. de Bs. As. C1285ABG | Tel. 54 11 0000-0000</p>
          <p>Oficinas: Av. Nombre 101, Vte. López. Prov. de Bs. As. Arg. - B1638BEA | Tel. 54 11 0000-0000</p>
          <p>© Copyright 2024 SA DiarioElGobierno | Todos los derechos reservados. Dirección Nacional del Derecho de Autor DNDA </p>
          <p>Queda prohibida la reproducción total o parcial del presente diario.</p>
          <p className="recaptcha"> <a href="#">Condiciones</a> - <a href="#">Privacidad</a></p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
