import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useUser } from '../contexts/UserContext';
import { Slot, getSlotById, bookSlot, updateSlotFeedback } from '../services/slotService';
import Loading from '../components/Loading';

const SessionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useUser();
  const navigate = useNavigate();
  const [slot, setSlot] = useState<Slot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [satisfactionScore, setSatisfactionScore] = useState<number>(5);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchSlotDetails = async () => {
      if (!id) return;

      setLoading(true);
      setError('');

      try {
        const slotData = await getSlotById(parseInt(id));
        setSlot(slotData);

        // Set initial form values if feedback exists
        if (slotData.satisfaction_score) {
          setSatisfactionScore(slotData.satisfaction_score);
        }
        if (slotData.notes) {
          setNotes(slotData.notes);
        }
      } catch (err) {
        console.error('Error fetching slot details:', err);
        setError('Failed to load session details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSlotDetails();
  }, [id]);

  const handleBookSession = async () => {
    if (!currentUser || !slot) return;

    setSubmitting(true);
    setError('');

    try {
      await bookSlot(slot.id, { student_id: currentUser.id });
      // Refresh the data
      const updatedSlot = await getSlotById(slot.id);
      setSlot(updatedSlot);
      setSuccess('Session booked successfully!');
    } catch (err) {
      console.error('Error booking session:', err);
      setError('Failed to book this session. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !slot) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await updateSlotFeedback(slot.id, {
        satisfaction_score: satisfactionScore,
        notes
      });

      // Refresh the data
      const updatedSlot = await getSlotById(slot.id);
      setSlot(updatedSlot);
      setSuccess('Feedback submitted successfully!');
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const isPastSession = slot ? new Date(slot.end_time) < new Date() : false;
  const isUpcomingSession = slot ? new Date(slot.start_time) > new Date() : false;

  if (loading) {
    return <Loading />;
  }

  if (!slot) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Session Not Found</h1>
        <p className="text-gray-700 mb-6">
          The session you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Session Details</h1>

      {error && <div className="bg-red-50 text-red-800 p-4 rounded-md mb-6">{error}</div>}
      {success && <div className="bg-green-50 text-green-800 p-4 rounded-md mb-6">{success}</div>}

      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between mb-6">
            <div>
              <div className="text-lg font-medium">
                {format(new Date(slot.start_time), 'EEEE, MMMM d, yyyy')}
              </div>
              <div className="text-gray-600">
                {format(new Date(slot.start_time), 'h:mm a')} - {format(new Date(slot.end_time), 'h:mm a')}
              </div>

              <div className="mt-4">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  isPastSession
                    ? 'bg-gray-100 text-gray-800'
                    : slot.is_booked
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {isPastSession
                    ? 'Completed'
                    : slot.is_booked
                      ? 'Booked'
                      : 'Available'
                  }
                </span>
              </div>
            </div>

            <div className="mt-4 md:mt-0 space-y-2">
              {slot.coach && (
                <div className="text-right">
                  <div className="font-medium">Coach</div>
                  <div>{slot.coach.name}</div>
                  {slot.is_booked && (
                    <div className="text-sm text-gray-600">{slot.coach.phone_number}</div>
                  )}
                </div>
              )}

              {slot.student && (
                <div className="text-right mt-2">
                  <div className="font-medium">Student</div>
                  <div>{slot.student.name}</div>
                  {slot.is_booked && (
                    <div className="text-sm text-gray-600">{slot.student.phone_number}</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Session Actions */}
          {currentUser && currentUser.user_type === 'student' && !slot.is_booked && isUpcomingSession && (
            <div className="border-t border-gray-200 pt-4">
              <button
                onClick={handleBookSession}
                disabled={submitting}
                className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Booking...' : 'Book This Session'}
              </button>
            </div>
          )}

          {/* Feedback Form for Coaches */}
          {currentUser &&
           currentUser.user_type === 'coach' &&
           slot.is_booked &&
           isPastSession &&
           currentUser.id === slot.coach_id && (
            <div className="border-t border-gray-200 pt-4 mt-4">
              <h3 className="text-lg font-semibold mb-3">Session Feedback</h3>

              <form onSubmit={handleSubmitFeedback} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student Satisfaction Score
                  </label>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((score) => (
                      <button
                        key={score}
                        type="button"
                        onClick={() => setSatisfactionScore(score)}
                        className={`text-2xl ${
                          score <= satisfactionScore ? 'text-yellow-400' : 'text-gray-300'
                        } focus:outline-none`}
                      >
                        ★
                      </button>
                    ))}
                    <span className="ml-2 text-gray-700">{satisfactionScore}/5</span>
                  </div>
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Session Notes
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter notes about the student's progress, what was covered, next steps, etc."
                  ></textarea>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : 'Save Feedback'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* View Feedback (for completed sessions with feedback) */}
          {slot.satisfaction_score && (
            <div className="border-t border-gray-200 pt-4 mt-4">
              <h3 className="text-lg font-semibold mb-3">Session Feedback</h3>

              <div className="space-y-3">
                <div>
                  <div className="font-medium mb-1">Satisfaction Score:</div>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`text-xl ${
                          star <= slot.satisfaction_score! ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                    <span className="ml-2 text-gray-700">{slot.satisfaction_score}/5</span>
                  </div>
                </div>

                <div>
                  <div className="font-medium mb-1">Session Notes:</div>
                  <div className="bg-gray-50 p-4 rounded text-gray-700 min-h-[60px]">
                    {slot.notes || 'No notes recorded for this session.'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => navigate('/')}
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default SessionDetails;
