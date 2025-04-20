import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useUser } from '../contexts/UserContext';
import { Slot, getUpcomingCoachSlots, getAvailableSlots, getSlotById, getAllSlots } from '../services/slotService';
import Loading from '../components/Loading';

const Dashboard = () => {
  const { currentUser } = useUser();
  const [upcomingSlots, setUpcomingSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (currentUser?.user_type === 'coach' && currentUser.id) {
          // Fetch upcoming slots for coach
          const slots = await getUpcomingCoachSlots(currentUser.id);
          setUpcomingSlots(slots);
        } else if (currentUser?.user_type === 'student') {
          // For students, fetch all slots and filter for their booked ones and available ones
          const allSlots = await getAllSlots();

          // Filter slots to find:
          // 1. Booked slots for this student
          // 2. Available slots
          const studentSlots = allSlots.filter(slot => {
            const now = new Date();
            const isUpcoming = new Date(slot.start_time) > now;

            // Show booked slots where student is the current user
            if (slot.is_booked && slot.student_id === currentUser.id && isUpcoming) {
              return true;
            }

            // Also show available slots for booking
            if (!slot.is_booked && isUpcoming) {
              return true;
            }

            return false;
          });

          setUpcomingSlots(studentSlots);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        {currentUser?.user_type === 'coach' ? 'Coach Dashboard' : 'Student Dashboard'}
      </h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          {currentUser?.user_type === 'coach' ? 'Your Upcoming Sessions' : 'Your Sessions & Available Slots'}
        </h2>

        {upcomingSlots.length === 0 ? (
          <div className="text-gray-500">
            {currentUser?.user_type === 'coach'
              ? 'You have no upcoming sessions. Add availability to get started.'
              : 'You have no booked sessions. Browse available coaching sessions to book.'}
          </div>
        ) : (
          <div className="grid gap-4">
            {upcomingSlots.map((slot) => (
              <div
                key={slot.id}
                className={`border rounded-lg p-4 transition-colors ${
                  slot.is_booked && slot.student_id === currentUser?.id
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 hover:border-primary-300'
                }`}
              >
                <div className="flex flex-col md:flex-row md:justify-between">
                  <div>
                    <div className="text-lg font-medium">
                      {format(new Date(slot.start_time), 'EEEE, MMMM d, yyyy')}
                    </div>
                    <div className="text-gray-600">
                      {format(new Date(slot.start_time), 'h:mm a')} - {format(new Date(slot.end_time), 'h:mm a')}
                    </div>

                    {currentUser?.user_type === 'coach' && slot.student && (
                      <div className="mt-2">
                        <span className="font-medium">Student:</span> {slot.student.name}
                      </div>
                    )}

                    {currentUser?.user_type === 'student' && slot.coach && (
                      <div className="mt-2">
                        <span className="font-medium">Coach:</span> {slot.coach.name}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 md:mt-0">
                    {currentUser?.user_type === 'coach' && !slot.is_booked && (
                      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                        Available
                      </span>
                    )}

                    {currentUser?.user_type === 'coach' && slot.is_booked && (
                      <Link
                        to={`/sessions/${slot.id}`}
                        className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 transition-colors inline-block"
                      >
                        View Details
                      </Link>
                    )}

                    {currentUser?.user_type === 'student' && slot.is_booked && slot.student_id === currentUser.id && (
                      <div className="flex flex-col items-end">
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm mb-2">
                          Booked by You
                        </span>
                        <Link
                          to={`/sessions/${slot.id}`}
                          className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 transition-colors inline-block"
                        >
                          View Details
                        </Link>
                      </div>
                    )}

                    {currentUser?.user_type === 'student' && !slot.is_booked && (
                      <Link
                        to={`/sessions/${slot.id}`}
                        className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 transition-colors inline-block"
                      >
                        Book Session
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-center">
        {currentUser?.user_type === 'coach' ? (
          <Link
            to="/availability"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors text-center"
          >
            Manage Your Availability
          </Link>
        ) : (
          <Link
            to="/book"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors text-center"
          >
            Browse All Available Sessions
          </Link>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
