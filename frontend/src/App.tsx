import { Route, Routes, Navigate } from 'react-router-dom';
import { useUser } from './contexts/UserContext';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import CoachAvailability from './pages/CoachAvailability';
import CoachHistory from './pages/CoachHistory';
import StudentBooking from './pages/StudentBooking';
import SessionDetails from './pages/SessionDetails';
import Loading from './components/Loading';

function App() {
  const { currentUser, loading } = useUser();

  if (loading) {
    return <Loading />;
  }

  if (!currentUser) {
    return <div className="p-4">No users found. Please make sure the database is properly initialized.</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          {currentUser.user_type === 'coach' ? (
            <>
              <Route path="/availability" element={<CoachAvailability />} />
              <Route path="/history" element={<CoachHistory />} />
            </>
          ) : (
            <Route path="/book" element={<StudentBooking />} />
          )}
          <Route path="/sessions/:id" element={<SessionDetails />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="bg-gray-100 py-4 text-center text-gray-600">
        <div className="container mx-auto">
          &copy; {new Date().getFullYear()} Stepful Coaching Platform
        </div>
      </footer>
    </div>
  );
}

export default App;
