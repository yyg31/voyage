import { Route, Routes } from 'react-router-dom';
import { NavBar } from './components/NavBar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { HomePage } from './pages/HomePage';
import { AgendaPage } from './pages/AgendaPage';
import { StopoversPage } from './pages/StopoversPage';
import { FlightsPage } from './pages/FlightsPage';
import { LinksPage } from './pages/LinksPage';
import { ForumPage } from './pages/ForumPage';
import { ForumThreadPage } from './pages/ForumThreadPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminUsersPage } from './pages/AdminUsersPage';

export default function App() {
  return (
    <div className="app-shell">
      <NavBar />
      <main className="app-main">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/agenda" element={<AgendaPage />} />
            <Route path="/stopovers" element={<StopoversPage />} />
            <Route path="/flights" element={<FlightsPage />} />
            <Route path="/links" element={<LinksPage />} />
            <Route path="/forum" element={<ForumPage />} />
            <Route path="/forum/:threadId" element={<ForumThreadPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          <Route element={<ProtectedRoute adminOnly />}>
            <Route path="/admin" element={<AdminUsersPage />} />
          </Route>

          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>
    </div>
  );
}
