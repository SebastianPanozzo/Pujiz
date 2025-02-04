import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import DiarioHome from './pages/home';
import Login from './pages/login';
import Register from './pages/register';
import Rol from './pages/rol';
import Trabajadores from './pages/Trabajadores';
import TextE from './pages/NewsArticleEditor';
import { UserProvider } from './UserContext';
import { EditNewsContent } from './components/EditNewsContent';
import NewsDetailPage from './components/NewsDetailPage';
import SectionPage from './components/SectionPage';
import SubcategoryPage from './components/SubcategoryPage'; // Nuevo import
import TagPage from './components/TagPage';
import CommentsPage from './pages/CommentsPage';
import TrabajadorProfile from './components/TrabajadorProfile';
import TrabajadorNoticias from './components/TrabajadorNoticias';
import TerminosYCondiciones from './pages/TerminosYCondiciones';
import ComoAnunciar from './pages/ComoAnunciar';

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/home" element={<DiarioHome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/rol" element={<Rol />} />
          <Route path="/ed" element={<TextE />} />
          <Route path="/trabajadores" element={<Trabajadores />} />
          <Route path="/edit-content/:id" element={<EditNewsContent />} />
          <Route path="/noticia/:id" element={<NewsDetailPage />} />
          <Route path="/seccion/:sectionName" element={<SectionPage />} />
          <Route path="/subcategoria/:subcategory" element={<SubcategoryPage />} /> {/* Nueva ruta */}
          <Route path="/tag/:tagName" element={<TagPage />} />
          <Route path="/comments/:id" element={<CommentsPage />} />
          <Route path="/trabajador/:trabajadorId" element={<TrabajadorProfile />} />
          <Route path="/trabajador/:trabajadorId/noticias" element={<TrabajadorNoticias />} />
          <Route path="/terminos-y-condiciones" element={<TerminosYCondiciones />} />
          <Route path="/anunciar" element={<ComoAnunciar />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;