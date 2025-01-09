import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './home.css';

const HomePage = () => {
  const [featuredNews, setFeaturedNews] = useState([]);
  const [sectionNews, setSectionNews] = useState({});
  const [recentNews, setRecentNews] = useState([]);

  const navigate = useNavigate();

  // Función para eliminar etiquetas HTML
  const stripHtml = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };
    // Función para truncar el título de la noticia
    const truncateTitle = (title, maxLength) => {
      return title.length > maxLength ? title.slice(0, maxLength) + '...' : title;
    };

  // Función para truncar el contenido de la noticia
  const truncateContent = (content, type) => {
    const plainText = stripHtml(content); // Eliminar etiquetas HTML
    
    switch (type) {
        case 'default':
            return plainText ? (plainText.length > 20 ? plainText.slice(0, 20) + '...' : plainText) : ''; // Truncar a 50 caracteres
        case 'main':
            return plainText ? (plainText.length > 150 ? plainText.slice(0, 150) + '...' : plainText) : ''; // Truncar a 100 caracteres
        case 'secondary':
            return plainText ? (plainText.length > 10 ? plainText.slice(0, 10) + '...' : plainText) : ''; // Truncar a 75 caracteres
        case 'recent':
            return plainText ? (plainText.length > 20 ? plainText.slice(0, 20) + '...' : plainText) : ''; // Truncar a 30 caracteres
        default:
            return plainText; // Sin truncado por defecto
    }
};
  // Función para truncar subtítulos largos o mostrar parte del contenido si es "default content"
  const truncateSubtitle = (subtitle, content, type) => {
    if (subtitle === 'default content') {
      return truncateContent(content); // Aquí podrías especificar un truncado más específico para el contenido
    }
    
  };
  

  useEffect(() => {
    const fetchFeaturedNews = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/diarioback/noticias');
        const filteredNews = response.data.filter(
          newsItem => newsItem.estado === 3 && [newsItem.seccion1, newsItem.seccion2, newsItem.seccion3, newsItem.seccion4, newsItem.seccion5, newsItem.seccion6].includes('Portada')
        );
        const sortedNews = filteredNews.sort((a, b) => new Date(b.fecha_publicacion) - new Date(a.fecha_publicacion));
        await fetchAuthorsAndEditors(sortedNews);
        setFeaturedNews(sortedNews.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch featured news:', error);
      }
    };

    const fetchSectionNews = async () => {
      const sections = ['Economía', 'Política', 'Cultura', 'Mundo'];
      try {
        const response = await axios.get('http://127.0.0.1:8000/diarioback/noticias');
        const filteredNews = response.data.filter(newsItem => newsItem.estado === 3);
        await fetchAuthorsAndEditors(filteredNews);

        const newSectionNews = {};

        sections.forEach(section => {
          const sortedNews = filteredNews
            .filter(newsItem => [newsItem.seccion1, newsItem.seccion2, newsItem.seccion3, newsItem.seccion4, newsItem.seccion5, newsItem.seccion6].includes(section))
            .sort((a, b) => new Date(b.fecha_publicacion) - new Date(a.fecha_publicacion));

          newSectionNews[section] = sortedNews.slice(0, 7);
        });

        setSectionNews(newSectionNews);
      } catch (error) {
        console.error('Failed to fetch section news:', error);
      }
    };

    const fetchRecentNews = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/diarioback/noticias');
        const sortedNews = response.data
          .filter(newsItem => newsItem.estado === 3)
          .sort((a, b) => new Date(b.fecha_publicacion) - new Date(a.fecha_publicacion));

        await fetchAuthorsAndEditors(sortedNews);
        setRecentNews(sortedNews.slice(0, 9));
      } catch (error) {
        console.error('Failed to fetch recent news:', error);
      }
    };

    const fetchAuthorsAndEditors = async (newsList) => {
      for (const newsItem of newsList) {
        if (newsItem.autor) {
          try {
            const authorResponse = await axios.get(`http://127.0.0.1:8000/diarioback/trabajadores/${newsItem.autor}/`);
            newsItem.autorData = authorResponse.data;
          } catch (error) {
            console.error('Error fetching author data:', error);
          }
        }
        if (newsItem.editor_en_jefe) {
          try {
            const editorResponse = await axios.get(`http://127.0.0.1:8000/diarioback/trabajadores/${newsItem.editor_en_jefe}/`);
            newsItem.editorData = editorResponse.data;
          } catch (error) {
            console.error('Error fetching editor data:', error);
          }
        }
      }
    };

    fetchFeaturedNews();
    fetchSectionNews();
    fetchRecentNews();
  }, []);

  const renderNewsSection = (newsArray, sectionTitle) => (
    <div className="news-section" key={sectionTitle}>
      <h2 className="section-title">{sectionTitle.toUpperCase()}</h2>
      <div className="news-grid">
        {newsArray.length > 0 && (
          <div className="main-article" onClick={() => navigate(`/noticia/${newsArray[0].id}`)}>
            <img src={newsArray[0].imagen_cabecera} alt={newsArray[0].nombre_noticia} />
            <div className="main-article-content">
            <h3>{truncateTitle(newsArray[0].nombre_noticia, 60)}</h3>
              {newsArray[0].autorData && (
                <p className="author">
                  por {newsArray[0].autorData.nombre} {newsArray[0].autorData.apellido}
                </p>
              )}
              <p className="date">{new Date(newsArray[0].fecha_publicacion).toLocaleDateString()}</p>
            </div>
          </div>
        )}
        <div className="secondary-articles">
          {newsArray.slice(1, 7).map((newsItem) => (
            <div
              key={newsItem.id}
              className="secondary-article"
              onClick={() => navigate(`/noticia/${newsItem.id}`)}
            >
              <img src={newsItem.imagen_cabecera} alt={newsItem.nombre_noticia} />
              <div className="secondary-article-content">
                <h4>{newsItem.nombre_noticia}</h4>
                {newsItem.autorData && (
                  <p className="author" style={{ color: '#555' }}>
                    por {newsItem.autorData.nombre} {newsItem.autorData.apellido}
                  </p>
                )}
                <p className="date">{new Date(newsItem.fecha_publicacion).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  

  const renderRecentNews = (recentNewsArray) => (
    <div className="recent-news-section">
      <h2 className="section-title">NOTICIAS RECIENTES</h2>
      <div className="recent-news-list">
        {recentNewsArray.map(newsItem => (
          <div
            key={newsItem.id}
            className="recent-news-item"
            onClick={() => navigate(`/noticia/${newsItem.id}`)}
          >
            <img src={newsItem.imagen_cabecera} alt={newsItem.nombre_noticia} className="recent-news-image" />
            <div className="recent-news-content">
              <h4>{newsItem.nombre_noticia}</h4>
              <p className="date">{new Date(newsItem.fecha_publicacion).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
//secciones de inicio (la portada)
  return (
    <div className="container">
      <main>
        <div className="featured-article">
          {featuredNews.length > 0 && (
            <>
              <div className="featured-left" onClick={() => navigate(`/noticia/${featuredNews[0].id}`)}>
                <img src={featuredNews[0].imagen_cabecera} alt={featuredNews[0].nombre_noticia} />
                <div className="overlay">
                  <h1 style={{ color: 'white' }}>{featuredNews[0].nombre_noticia}</h1>
                  <p  >{new Date(featuredNews[0].fecha_publicacion).toLocaleDateString()}</p>
                  {featuredNews[0].autorData && (
                    <p className="author" style ={{marginTop: '-5px'}}>
                      por {featuredNews[0].autorData.nombre} {featuredNews[0].autorData.apellido}
                    </p>
                  )}
                </div>
              </div>

              <div className="featured-right">
                {featuredNews.slice(1, 3).map((newsItem) => ( // Mostrar solo dos elementos
                  <div
                    key={newsItem.id}
                    className="carousel-item"
                    onClick={() => navigate(`/noticia/${newsItem.id}`)}
                  >
                    <img src={newsItem.imagen_cabecera} alt={newsItem.nombre_noticia} />
                    <div className="gradient-overlay"></div>
                    <div className="carousel-caption">
                      <h3 style={{ color: 'white' }}>{newsItem.nombre_noticia}</h3>
                      <p>{new Date(newsItem.fecha_publicacion).toLocaleDateString()}</p>
                      {newsItem.autorData && (
                        <p className="author">
                          por {newsItem.autorData.nombre} {newsItem.autorData.apellido}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>


            </>
          )}
        </div>

        <div className="sections-and-recent-news">
          <div className="news-sections">
            {Object.entries(sectionNews).map(([sectionTitle, newsArray]) =>
              renderNewsSection(newsArray, sectionTitle)
            )}
          </div>

          <div className="recent-news">
            {renderRecentNews(recentNews)}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;

