import { useState, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import { useUser } from '../contexts/UserContext';
import { Slot, getUpcomingCoachSlots, createSlot } from '../services/slotService';
import Loading from '../components/Loading';

const CoachAvailability = () => {
  const { currentUser } = useUser();
  const [upcomingSlots, setUpcomingSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSlotDate, setNewSlotDate] = useState('');
  const [newSlotTime, setNewSlotTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Calculate min date (today) and max date (3 months from now)
  const today = new Date();
  const minDate = format(today, 'yyyy-MM-dd');
  const maxDate = format(addDays(today, 90), 'yyyy-MM-dd');

  useEffect(() => {
    fetchSlots();
  }, [currentUser]);

  const fetchSlots = async () => {
    if (!currentUser || currentUser.user_type !== 'coach') return;

    setLoading(true);
    try {
      const slots = await getUpcomingCoachSlots(currentUser.id);
      setUpcomingSlots(slots);
    } catch (error) {
      console.error('Error fetching slots:', error);
      setMessage({
        text: 'Failed to load availability slots. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser || !newSlotDate || !newSlotTime) return;

    setSubmitting(true);
    setMessage({ text: '', type: '' });

    try {
      // Combine date and time for start_time
      const startTime = `${newSlotDate}T${newSlotTime}:00`;

      await createSlot({
        coach_id: currentUser.id,
        start_time: startTime
      });

      setNewSlotDate('');
      setNewSlotTime('');
      setMessage({
        text: 'Availability slot added successfully!',
        type: 'success'
      });

      // Refresh the slots list
      fetchSlots();
    } catch (error) {
      console.error('Error adding slot:', error);
      setMessage({
        text: 'Failed to add availability slot. Please try again.',
        type: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

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
      <h1 className="text-2xl font-bold mb-6">Manage Your Availability</h1>

      {/* Add new availability slot */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New Availability</h2>

        <form onSubmit={handleAddSlot} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                id="date"
                value={newSlotDate}
                onChange={(e) => setNewSlotDate(e.target.value)}
                min={minDate}
                max={maxDate}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                Start Time (2-hour slots)
              </label>
              <input
                type="time"
                id="time"
                value={newSlotTime}
                onChange={(e) => setNewSlotTime(e.target.value)}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Slots are always 2 hours long
              </p>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {submitting ? 'Adding...' : 'Add Availability'}
            </button>
          </div>

          {message.text && (
            <div
              className={`p-4 rounded-md ${
                message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}
            >
              {message.text}
            </div>
          )}
        </form>
      </div>

      {/* List of upcoming availability */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Your Upcoming Availability</h2>

        {upcomingSlots.length === 0 ? (
          <div className="text-gray-500">
            You have no upcoming availability slots. Add some using the form above.
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingSlots.map((slot) => (
              <div
                key={slot.id}
                className={`border rounded-lg p-4 ${
                  slot.is_booked
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex flex-col md:flex-row justify-between">
                  <div>
                    <div className="text-lg font-medium">
                      {format(new Date(slot.start_time), 'EEEE, MMMM d, yyyy')}
                    </div>
                    <div className="text-gray-600">
                      {format(new Date(slot.start_time), 'h:mm a')} - {format(new Date(slot.end_time), 'h:mm a')}
                    </div>
                  </div>

                  <div className="mt-2 md:mt-0">
                    {slot.is_booked ? (
                      <div>
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                          Booked
                        </span>
                        {slot.student && (
                          <div className="mt-2 text-sm">
                            <span className="font-medium">Student:</span> {slot.student.name}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                        Available
                      </span>
                    )}
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

export default CoachAvailability;
