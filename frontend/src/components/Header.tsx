import { Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const Header = () => {
  const { currentUser, switchUserType, coaches, students, switchUser } = useUser();

  return (
    <header className="bg-primary-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-2xl font-bold">
              Stepful Coaching
            </Link>

            {currentUser && (
              <nav className="hidden md:flex space-x-4">
                <Link to="/" className="hover:underline">
                  Dashboard
                </Link>
                
                {currentUser.user_type === 'coach' ? (
                  <>
                    <Link to="/availability" className="hover:underline">
                      Manage Availability
                    </Link>
                    <Link to="/history" className="hover:underline">
                      Session History
                    </Link>
                  </>
                ) : (
                  <Link to="/book" className="hover:underline">
                    Book a Session
                  </Link>
                )}
              </nav>
            )}
          </div>

          {currentUser && (
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <div>
                  <span className="font-semibold">
                    {currentUser.name}
                  </span>
                  <span className="ml-2 bg-primary-800 text-white px-2 py-1 rounded-full text-xs">
                    {currentUser.user_type}
                  </span>
                </div>
                <div className="text-primary-200">
                  {currentUser.email}
                </div>
              </div>

              <button
                onClick={switchUserType}
                className="bg-white text-primary-600 px-3 py-1 rounded hover:bg-primary-50 transition-colors"
                title={`Switch to ${currentUser.user_type === 'coach' ? 'student' : 'coach'} view`}
              >
                Switch to {currentUser.user_type === 'coach' ? 'Student' : 'Coach'}
              </button>

              <select
                className="bg-white text-primary-600 px-2 py-1 rounded"
                value={currentUser.id}
                onChange={(e) => {
                  const userId = parseInt(e.target.value);
                  switchUser(userId);
                }}
              >
                {(currentUser.user_type === 'coach' ? coaches : students).map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
