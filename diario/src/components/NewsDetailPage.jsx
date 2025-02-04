import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../UserContext';
import FacebookComments from './FacebookComments';
import './NewsDetail.css';
import NewsReactions from './NewsReactions';

const NewsDetail = () => {
  const { id } = useParams();
  const [newsData, setNewsData] = useState(null);
  const [authorData, setAuthorData] = useState(null);
  const [editorData, setEditorData] = useState(null);
  const [Palabras_clave, setPalabras_clave] = useState([]);
  const { user } = useUser();
  const [speechState, setSpeechState] = useState('stopped');
  const [speechProgress, setSpeechProgress] = useState(0);
  const speechUtteranceRef = useRef(null);
  const speechInterval = useRef(null);
  const progressBarRef = useRef(null);
  const audioTextRef = useRef('');
  const totalTextLengthRef = useRef(0);
  const speechStartTimeRef = useRef(null);

  // Utility function to strip HTML tags
  const stripHtmlPalabras_clave = (html) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const readContentAloud = () => {
    if (newsData && newsData.contenido) {
      const plainText = stripHtmlPalabras_clave(newsData.contenido);
      const truncatedText = plainText.substring(0, 3000);
  
      if (speechState === 'speaking') {
        // Pausar el discurso
        window.speechSynthesis.pause();
        setSpeechState('paused');
        clearInterval(speechInterval.current);
  
        // Guardar tiempo acumulado hablado
        const elapsedTime = performance.now() - speechStartTimeRef.current;
        speechStartTimeRef.current = elapsedTime; // Ahora almacena el tiempo hablado
        return;
      }
  
      if (speechState === 'paused') {
        // Reanudar el discurso
        window.speechSynthesis.resume();
        setSpeechState('speaking');
  
        // Restablecer el tiempo de inicio sumando el tiempo hablado previamente
        speechStartTimeRef.current = performance.now() - speechStartTimeRef.current;
  
        // Reiniciar el seguimiento del progreso
        speechInterval.current = setInterval(() => {
          const progress = calculateSpeechProgress(speechUtteranceRef.current);
          setSpeechProgress(progress);
        }, 100);
        return;
      }
  
      if (speechState === 'stopped') {
        // Iniciar nuevo discurso
        window.speechSynthesis.cancel();
  
        const speech = new SpeechSynthesisUtterance();
        speech.text = truncatedText;
        speech.lang = 'es-ES';
  
        // Seleccionar la voz de Microsoft si está disponible
        const voices = window.speechSynthesis.getVoices();
        const microsoftVoice = voices.find(voice =>
          voice.name.toLowerCase().includes('microsoft')
        );
        if (microsoftVoice) {
          speech.voice = microsoftVoice;
        } else {
          console.warn('Microsoft voice not available. Using default voice.');
        }
  
        speechUtteranceRef.current = speech;
        audioTextRef.current = truncatedText;
        totalTextLengthRef.current = truncatedText.length;
  
        speech.onstart = () => {
          setSpeechState('speaking');
          speechStartTimeRef.current = performance.now();
          speechInterval.current = setInterval(() => {
            const progress = calculateSpeechProgress(speech);
            setSpeechProgress(progress);
          }, 100);
        };
  
        speech.onend = () => {
          setSpeechState('stopped');
          setSpeechProgress(0);
          clearInterval(speechInterval.current);
        };
  
        speech.onerror = (event) => {
          console.error('Speech synthesis error:', event.error);
          setSpeechState('stopped');
          setSpeechProgress(0);
          clearInterval(speechInterval.current);
        };
  
        window.speechSynthesis.speak(speech);
      }
    }
  };
  

  // Calculate speech progress with more precision
  const calculateSpeechProgress = (utterance) => {
  if (!utterance || !audioTextRef.current) return 0;

  const totalLength = totalTextLengthRef.current;

  if (!window.speechSynthesis.speaking) return 100;

  const averageSpeechRate = 150; // Palabras por minuto
  const averageWordLength = 5;   // Caracteres por palabra

  const elapsedTime = performance.now() - speechStartTimeRef.current;

  const estimatedCharactersSpoken = (elapsedTime / 60000) * averageSpeechRate * averageWordLength;
  const totalSpokenLength = Math.min(totalLength, estimatedCharactersSpoken);

  return Math.min(100, Math.max(0, (totalSpokenLength / totalLength) * 100));
};
  

  // YouTube-like progress bar seek
  const handleProgressBarClick = (e) => {
    if (!speechUtteranceRef.current || speechState !== 'speaking' || !progressBarRef.current) return;

    const progressBar = progressBarRef.current;
    const clickPosition = e.nativeEvent.offsetX;
    const barWidth = progressBar.offsetWidth;
    const clickPercentage = (clickPosition / barWidth) * 100;

    // Cancel current speech
    window.speechSynthesis.cancel();

    // Prepare new speech
    const speech = new SpeechSynthesisUtterance();
    const plainText = audioTextRef.current;

    // Calculate the starting point based on click percentage
    const startIndex = Math.floor((clickPercentage / 100) * plainText.length);
    speech.text = plainText.substring(startIndex);
    speech.lang = 'es-ES';

    speech.onstart = () => {
      setSpeechState('speaking');
      speechStartTimeRef.current = performance.now();
      setSpeechProgress(clickPercentage);
    };
    
    speech.onend = () => {
      setSpeechState('stopped');
      setSpeechProgress(0);
    };

    speech.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      setSpeechState('stopped');
      setSpeechProgress(0);
    };

    speechUtteranceRef.current = speech;
    window.speechSynthesis.speak(speech);
  };

  useEffect(() => {
    const fetchNewsData = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/diarioback/noticias/${id}/`);
        const news = response.data;
        setNewsData(news);

        if (news.Palabras_clave) {
          setPalabras_clave(news.Palabras_clave.split(',').map(tag => tag.trim()));
        }

        if (news.autor) {
          const authorResponse = await axios.get(`http://127.0.0.1:8000/diarioback/trabajadores/${news.autor}/`);
          setAuthorData(authorResponse.data);
        }
        
        if (news.editor_en_jefe) {
          const editorResponse = await axios.get(`http://127.0.0.1:8000/diarioback/trabajadores/${news.editor_en_jefe}/`);
          setEditorData(editorResponse.data);
        }
      } catch (error) {
        console.error('Error fetching news data:', error);
      }
    };

    fetchNewsData();

    return () => {
      window.speechSynthesis.cancel();
      clearInterval(speechInterval.current);
    };
  }, [id]);

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/diarioback/comments/${commentId}/`, {
        headers: {
          'Authorization': `Bearer ${user.access}`
        }
      });
      console.log('Comment deleted successfully');
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  if (!newsData) {
    return <div>Loading...</div>;
  }

  const { nombre_noticia, subtitulo, categorias, fecha_publicacion, imagen_cabecera, contenido } = newsData;

  // Convertir las categorías de string a array si es necesario
  const subcategories = Array.isArray(categorias) ? categorias : (categorias || '').split(',').filter(Boolean);

  return (
    <div className="news-detail-container">
      <div className="news-header">
        {/* Categories section first */}
        <div className="categories-container" style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
          {subcategories.map((category, index) => (
            <Link 
              key={index} 
              to={`/seccion/${encodeURIComponent(category.toLowerCase())}`} 
              className="news-section-link"
              style={{ color: '#0066cc', textDecoration: 'none' }}
            >
              <span className="news-section" style={{ fontSize: '14px' }}>{category}</span>
            </Link>
          ))}
        </div>

        {/* Title and subtitle in their own container */}
        <div className="title-container">
          
          <h1
            className="news-title"
            style={{
              fontFamily: "'Adelle Semibold Cnd'",
              fontSize: '28px',
              fontWeight: 'bold',
              marginTop: '10px',
              color: '#000000',
            }}
          >
            {nombre_noticia}
          </h1>

          {subtitulo !== "default content" && (
            <h2
              className="news-subtitle"
              style={{
                fontFamily: "'Fenomen Slab CN SemiBold'",
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#425f75',
                marginTop: '10px'
              }}
            >
              {subtitulo}
            </h2>
          )}

          <div className="news-info">
            <span className="news-date">
              {new Date(fecha_publicacion).toLocaleDateString('es-ES', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric'  
              })}
            </span>
          </div>
        </div>

        <div className="author-editor-info">
          <div className="author-info">
            {authorData && (
              <>
                <img src={authorData.foto_perfil} alt={`${authorData.nombre} ${authorData.apellido}`} className="profile-image" />
                <div className="author-details">
                  <Link to={`/trabajador/${authorData.id}/noticias`}>
                    <span className="author-name">Por: {authorData.nombre} {authorData.apellido}</span>
                  </Link>
                </div>
              </>
            )}
          </div>
          {editorData && (
            <div className="editor-info">
              <img src={editorData.foto_perfil} alt={`${editorData.nombre} ${editorData.apellido}`} className="profile-image" />
              <div className="editor-details">
                <Link to={`/trabajador/${editorData.id}/noticias`}>
                  <span className="editor-name">Editor: {editorData.nombre} {editorData.apellido}</span>
                </Link>
              </div>
            </div>
          )}
        </div>
        
        <div 
          className="audio-controls" 
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '20px 0'
          }}
        >
          <button 
            onClick={readContentAloud} 
            className={`read-aloud-button ${speechState === 'speaking' ? 'speaking' : speechState === 'paused' ? 'paused' : ''}`}
            style={{
              padding: '10px 15px',
              backgroundColor: 
                speechState === 'speaking' ? '#ff4d4d' : 
                speechState === 'paused' ? '#ffa500' : 
                '#0066cc',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginBottom: '10px'
            }}
          >
            {speechState === 'speaking' ? 'Detener lectura' : 
             speechState === 'paused' ? 'Continuar lectura' : 
             'Leer en voz alta'}
          </button>
          
          <div
            ref={progressBarRef}
            className="speech-progress-bar"
            onClick={handleProgressBarClick}
            style={{
              width: '100%',
              maxWidth: '600px',
              height: '6px',
              backgroundColor: '#e0e0e0',
              borderRadius: '3px',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              className="speech-progress"
              style={{
                width: `${speechProgress}%`,
                height: '100%',
                backgroundColor: '#0066cc', 
                borderRadius: '3px',
                transition: 'width 0.3s ease-out',
              }}
            ></div>
            
            {/* YouTube-like progress handle */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: `${speechProgress}%`,
                transform: 'translate(-50%, -50%)',
                backgroundColor: '#0066cc',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                boxShadow: '0 0 4px rgba(0, 0, 0, 0.3)',
                opacity: speechState === 'speaking' ? 1 : 0,
                transition: 'opacity 0.2s ease-in-out'
              }}
            ></div>
          </div>
        </div>
      </div>

      <img src={imagen_cabecera} alt={nombre_noticia} className="header-image" />
      
      <div 
        className="news-content" 
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          overflowWrap: 'break-word'
        }}
        dangerouslySetInnerHTML={{ __html: contenido }}
      ></div>

      <div className="tags-section" style={{ marginBottom: '30px' }}>
        <h3 className="tags-title">Palabras clave </h3>
        <div className="news-tags">
          {Palabras_clave.map((tag, index) => (
            <Link key={index} to={`/tag/${encodeURIComponent(tag)}`} className="tag-link">
              <span className="tag">{tag}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="reactions-section" style={{ 
        
        marginBottom: '30px',
        clear: 'both',
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <h3 className="tags-title">Reacciones</h3>
        <NewsReactions noticiaId={id} />
      </div>

      <h3 className="comments-title">Comentarios</h3>
      <FacebookComments 
        url={`http://127.0.0.1:8000/diarioback/noticias/${id}/`} 
        numPosts={5}
        canDeleteComments={user && user.es_trabajador}
        onDeleteComment={handleDeleteComment}
      />
    </div>
  );
};

export default NewsDetail;