import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import UserDirectory from './pages/UserDirectory.jsx';
import UserProfile from './pages/UserProfile.jsx';
import AddPost from './pages/AddPost.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import NotFound from './pages/NotFound.jsx';
import Projects from './pages/Projects.jsx';
import NewProject from './pages/NewProject.jsx';
import ProjectDetail from './pages/ProjectDetail.jsx';
import Community from './pages/Community.jsx';
import NewProblem from './pages/NewProblem.jsx';
import ProblemDetail from './pages/ProblemDetail.jsx';

export default function App() {
  const { pathname } = useLocation();

  // The reference-inspired landing page is intentionally full-bleed;
  // keep the standard site navigation on the other application routes.
  if (pathname === '/') return <Home />;

  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/users" element={<UserDirectory />} />
          <Route path="/users/:id" element={<UserProfile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/add-post" element={<ProtectedRoute><AddPost /></ProtectedRoute>} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/new" element={<ProtectedRoute><NewProject /></ProtectedRoute>} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/community" element={<Community />} />
          <Route path="/community/new" element={<ProtectedRoute><NewProblem /></ProtectedRoute>} />
          <Route path="/community/:id" element={<ProblemDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
