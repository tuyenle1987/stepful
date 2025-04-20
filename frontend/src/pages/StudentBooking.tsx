import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { Slot, getAvailableSlots, bookSlot } from '../services/slotService';
import Loading from '../components/Loading';

const StudentBooking = () => {
  const { currentUser } = useUser();
  const navigate = useNavigate();
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');
  const [selectedCoachId, setSelectedCoachId] = useState<number | 'all'>('all');

  useEffect(() => {
    fetchAvailableSlots();
  }, []);

  const fetchAvailableSlots = async () => {
    setLoading(true);
    setError('');

    try {
      const slots = await getAvailableSlots();
      setAvailableSlots(slots);
    } catch (err) {
      console.error('Error fetching available slots:', err);
      setError('Failed to load available slots. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookSlot = async (slotId: number) => {
    if (!currentUser) return;

    setBooking(true);
    setError('');

    try {
      await bookSlot(slotId, { student_id: currentUser.id });
      // Navigate to dashboard after successful booking
      navigate('/');
    } catch (err) {
      console.error('Error booking slot:', err);
      setError('Failed to book this slot. Please try again.');
      setBooking(false);
    }
  };

  // Get unique coach IDs for filtering
  const coachIds = Array.from(new Set(availableSlots.map(slot => slot.coach?.id || slot.coach_id)));

  // Filter slots by selected coach
  const filteredSlots = selectedCoachId === 'all'
    ? availableSlots
    : availableSlots.filter(slot => (slot.coach?.id || slot.coach_id) === selectedCoachId);

  if (loading) {
    return <Loading />;
  }

  if (!currentUser || currentUser.user_type !== 'student') {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p className="text-gray-700">Only students can access this page. Please switch to a student account.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Book a Coaching Session</h1>

      {error && <div className="bg-red-50 text-red-800 p-4 rounded-md mb-6">{error}</div>}

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <h2 className="text-xl font-semibold mb-2 md:mb-0">Available Sessions</h2>

          <div>
            <label htmlFor="coach-filter" className="mr-2 text-gray-700">
              Filter by Coach:
            </label>
            <select
              id="coach-filter"
              value={selectedCoachId === 'all' ? 'all' : selectedCoachId.toString()}
              onChange={(e) => setSelectedCoachId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1"
            >
              <option value="all">All Coaches</option>
              {coachIds.map((coachId) => {
                const coach = availableSlots.find(slot => (slot.coach?.id || slot.coach_id) === coachId)?.coach;
                return coach && (
                  <option key={coachId} value={coachId}>
                    {coach.name}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {filteredSlots.length === 0 ? (
          <div className="text-gray-500">
            No available coaching sessions found at this time.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSlots.map((slot) => (
              <div
                key={slot.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
              >
                <div className="flex flex-col md:flex-row justify-between">
                  <div>
                    <div className="text-lg font-medium">
                      {format(new Date(slot.start_time), 'EEEE, MMMM d, yyyy')}
                    </div>
                    <div className="text-gray-600">
                      {format(new Date(slot.start_time), 'h:mm a')} - {format(new Date(slot.end_time), 'h:mm a')}
                    </div>

                    {slot.coach && (
                      <div className="mt-2">
                        <span className="font-medium">Coach:</span> {slot.coach.name}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 md:mt-0">
                    <button
                      onClick={() => handleBookSlot(slot.id)}
                      disabled={booking}
                      className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 transition-colors disabled:opacity-50"
                    >
                      {booking ? 'Booking...' : 'Book Session'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentBooking;
