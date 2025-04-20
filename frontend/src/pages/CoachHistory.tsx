import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useUser } from '../contexts/UserContext';
import { Slot, getPastCoachSessions } from '../services/slotService';
import Loading from '../components/Loading';

const CoachHistory = () => {
  const { currentUser } = useUser();
  const [pastSessions, setPastSessions] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPastSessions = async () => {
      if (!currentUser || currentUser.user_type !== 'coach') return;

      setLoading(true);
      setError('');

      try {
        const sessions = await getPastCoachSessions(currentUser.id);
        setPastSessions(sessions);
      } catch (err) {
        console.error('Error fetching past sessions:', err);
        setError('Failed to load past sessions. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPastSessions();
  }, [currentUser]);

  if (loading) {
    return <Loading />;
  }

  if (!currentUser || currentUser.user_type !== 'coach') {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p className="text-gray-700">Only coaches can access this page. Please switch to a coach account.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Session History</h1>

      {error && <div className="bg-red-50 text-red-800 p-4 rounded-md mb-6">{error}</div>}

      {pastSessions.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-gray-500">
          You don't have any past sessions yet.
        </div>
      ) : (
        <div className="space-y-6">
          {pastSessions.map((session) => (
            <div key={session.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between mb-4">
                  <div>
                    <div className="text-lg font-medium">
                      {format(new Date(session.start_time), 'EEEE, MMMM d, yyyy')}
                    </div>
                    <div className="text-gray-600">
                      {format(new Date(session.start_time), 'h:mm a')} - {format(new Date(session.end_time), 'h:mm a')}
                    </div>
                  </div>

                  <div className="mt-2 md:mt-0">
                    {session.student && (
                      <div className="text-right">
                        <div className="font-medium">Student</div>
                        <div>{session.student.name}</div>
                        <div className="text-sm text-gray-600">{session.student.phone_number}</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex items-center mb-2">
                    <div className="font-medium mr-3">Satisfaction Score:</div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`text-xl ${
                            star <= (session.satisfaction_score || 0)
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="ml-2 text-gray-700">
                      {session.satisfaction_score ? `${session.satisfaction_score}/5` : 'Not rated'}
                    </span>
                  </div>

                  <div>
                    <div className="font-medium mb-1">Session Notes:</div>
                    <div className="bg-gray-50 p-4 rounded text-gray-700 min-h-[60px]">
                      {session.notes || 'No notes recorded for this session.'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoachHistory;
