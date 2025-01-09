import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import './SectionPage.css';

// Función para eliminar etiquetas HTML
const stripHtml = (html) => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
};

const SectionPage = () => {
  const { sectionName } = useParams();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const newsPerPage = 20;

  useEffect(() => {
    const fetchSectionNews = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!sectionName) {
          throw new Error('Sección no válida');
        }

        const response = await axios.get('http://127.0.0.1:8000/diarioback/noticias/');

        const normalizedSectionName = sectionName.toLowerCase().trim();
        
        const filteredNews = response.data
          .filter(newsItem => 
            newsItem.estado === 3 && 
            [newsItem.seccion1, newsItem.seccion2, newsItem.seccion3, 
             newsItem.seccion4, newsItem.seccion5, newsItem.seccion6]
              .some(section => section && section.toLowerCase().trim() === normalizedSectionName)
          )
          .sort((a, b) => new Date(b.fecha_publicacion) - new Date(a.fecha_publicacion));

        await fetchAuthors(filteredNews);

        setNews(filteredNews);
        console.log(`Noticias filtradas para la sección ${sectionName}:`, filteredNews);
      } catch (error) {
        setError(error.message);
        console.error('Failed to fetch section news:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchAuthors = async (newsList) => {
      for (const newsItem of newsList) {
        if (newsItem.autor) {
          try {
            const authorResponse = await axios.get(`http://127.0.0.1:8000/diarioback/trabajadores/${newsItem.autor}/`);
            newsItem.autorData = authorResponse.data;
          } catch (error) {
            console.error('Error fetching author data:', error);
          }
        }
      }
    };

    fetchSectionNews();
  }, [sectionName]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const indexOfLastNews = currentPage * newsPerPage;
  const indexOfFirstNews = indexOfLastNews - newsPerPage;
  const currentNews = news.slice(indexOfFirstNews, indexOfLastNews);

  const totalPages = Math.ceil(news.length / newsPerPage);

  const truncateContent = (content, type) => {
    const plainText = stripHtml(content); // Eliminar etiquetas HTML
    
    switch (type) {
        case 'default':
            return plainText ? (plainText.length > 40 ? plainText.slice(0, 40) + '...' : plainText) : '';
        case 'main':
            return plainText ? (plainText.length > 150 ? plainText.slice(0, 150) + '...' : plainText) : '';
        case 'secondary':
            return plainText ? (plainText.length > 40 ? plainText.slice(0, 40) + '...' : plainText) : '';
        case 'recent':
            return plainText ? (plainText.length > 40 ? plainText.slice(0, 40) + '...' : plainText) : '';
        default:
            return plainText; // Sin truncado por defecto
    }
  };

  const renderDescription = (subtitulo) => {
    if (subtitulo === 'default content') {
      return <p className="news-description">{truncateContent(subtitulo, 'default')}</p>; // Muestra "default content" truncado
    } else {
      return <p className="news-description">{truncateContent(subtitulo, 'main')}</p>; // Muestra el contenido truncado para el tipo 'main'
    }
  };

  if (loading) {
    return <div>Cargando noticias...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="section-page">
      <h1>{sectionName.charAt(0).toUpperCase() + sectionName.slice(1)}</h1>
      <div className="news-grid">
        {currentNews.length > 0 ? (
          currentNews.map((newsItem) => (
            <Link to={`/noticia/${newsItem.id}`} key={newsItem.id} className="news-item">
              <div className="news-img-container">
                <img src={newsItem.imagen_cabecera} alt={newsItem.nombre_noticia} className="news-img" />
              </div>
              <div className="news-content">
                <h3 className="news-title">{newsItem.nombre_noticia}</h3>
                <p style={{color: '#555;'}}>{truncateContent(newsItem.contenido, 'recent')} {/* Truncar el contenido para noticias recientes */} </p>
                <p className="news-date">{new Date(newsItem.fecha_publicacion).toLocaleDateString()}</p>
                {newsItem.autorData && (
                  <p className="news-author">Por {newsItem.autorData.nombre} {newsItem.autorData.apellido} · {newsItem.categoria}</p>
                )}
              </div>
            </Link>
          ))
        ) : (
          <p>No hay noticias disponibles en esta sección.</p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => handlePageChange(index + 1)}
              className={`page-button ${currentPage === index + 1 ? 'active' : ''}`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SectionPage;

