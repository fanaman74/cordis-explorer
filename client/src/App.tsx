import { Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import ProjectPage from './pages/ProjectPage';
import GrantMatchPage from './pages/GrantMatchPage';
import ProfileMatchPage from './pages/ProfileMatchPage';
import GrantSearchPage from './pages/GrantSearchPage';
import AdminPage from './pages/AdminPage';
import AuthModal from './components/auth/AuthModal';
import { useAuth } from './contexts/AuthContext';

export default function App() {
  const { showAuthModal } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/project/:id" element={<ProjectPage />} />
          <Route path="/grant-match" element={<GrantMatchPage />} />
          <Route path="/profile-match" element={<ProfileMatchPage />} />
          <Route path="/grant-search" element={<GrantSearchPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>
      <Footer />
      {showAuthModal && <AuthModal />}
    </div>
  );
}
