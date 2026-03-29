import { Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import SearchPage from './pages/SearchPage';
import ProjectPage from './pages/ProjectPage';
import GrantMatchPage from './pages/GrantMatchPage';
import ProfileMatchPage from './pages/ProfileMatchPage';
import GrantSearchPage from './pages/GrantSearchPage';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/project/:id" element={<ProjectPage />} />
          <Route path="/grant-match" element={<GrantMatchPage />} />
          <Route path="/profile-match" element={<ProfileMatchPage />} />
          <Route path="/grant-search" element={<GrantSearchPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
