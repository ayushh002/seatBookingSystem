import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import DatePicker from 'react-datepicker';
import { format, addDays, startOfDay, isTomorrow } from 'date-fns';
import { toast } from 'react-hot-toast';
import axiosClient from '../utils/axiosClient';
import { createBooking } from '../redux/bookingSlice';
import 'react-datepicker/dist/react-datepicker.css';

// Validation schema
const bookingSchema = z.object({
  type: z.enum(['designated', 'floater'])
});

export default function BookSeat() {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateError, setDateError] = useState('');

  const { register, handleSubmit, watch } = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: { type: 'designated' }
  });

  const bookingType = watch('type');

  // Date constraints
  const today = startOfDay(new Date());
  const maxDesignatedDate = addDays(today, 14);
  const minFloaterDate = addDays(today, 1);

  // Validate date based on user's batch
  const validateDate = (date, type) => {
    if (type === 'designated') {
      const day = date.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
      if (user.batch === 1 && ![1, 2, 3].includes(day)) {
        return 'Batch 1 can only book on Monday, Tuesday, Wednesday';
      }
      if (user.batch === 2 && ![4, 5].includes(day)) {
        return 'Batch 2 can only book on Thursday, Friday';
      }
    }
    return '';
  };

  const fetchAvailability = async (date) => {
    try {
      const formatted = format(date, 'yyyy-MM-dd');
      const res = await axiosClient.get(`/book/availability/${formatted}`);
      setAvailability(res.data.data);
    } catch (error) {
      console.error('Failed to fetch availability:', error);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setDateError(validateDate(date, bookingType));
    fetchAvailability(date);
  };

  // Re-validate when type changes
  useEffect(() => {
    setDateError(validateDate(selectedDate, bookingType));
  }, [bookingType, selectedDate]);

  const onSubmit = async (data) => {
    const error = validateDate(selectedDate, data.type);
    if (error) {
      toast.error("Error Booking the seat!");
      return;
    }
    setLoading(true);
    const result = await dispatch(createBooking({
      date: format(selectedDate, 'yyyy-MM-dd'),
      type: data.type
    }));
    setLoading(false);
    if (createBooking.fulfilled.match(result)) {
      navigate('/dashboard');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-linear-to-br from-base-100 to-base-200 p-8"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header with icon */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
            Book Your Seat
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main booking form - takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-6">Booking Details</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Booking Type */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Select Booking Type</span>
                    </label>
                    <select
                      className="select select-bordered w-full"
                      {...register('type')}
                    >
                      <option value="designated">Designated Seat</option>
                      <option value="floater">Floater Seat</option>
                    </select>
                  </div>

                  {/* Date Picker */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Choose Date</span>
                    </label>
                    <DatePicker
                      selected={selectedDate}
                      onChange={handleDateChange}
                      minDate={bookingType === 'floater' ? minFloaterDate : today}
                      maxDate={bookingType === 'designated' ? maxDesignatedDate : minFloaterDate}
                      filterDate={date => {
                        if (bookingType === 'floater') {
                          return isTomorrow(date);
                        }
                        return true;
                      }}
                      className={`input input-bordered w-full ${dateError ? 'input-error' : ''}`}
                      dateFormat="yyyy-MM-dd"
                      placeholderText="Select a date"
                    />
                    {dateError && (
                      <p className="text-error text-sm mt-2 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {dateError}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="btn btn-primary w-full"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Processing...
                      </>
                    ) : (
                      'Confirm Booking'
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Availability sidebar - takes 1 column */}
          <div className="lg:col-span-1">
            {availability ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="card bg-linear-to-br from-primary/5 to-secondary/5 shadow-xl border border-primary/10"
              >
                <div className="card-body">
                  <h3 className="card-title text-lg mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Seat Availability
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Available Seats</span>
                      <span className="text-2xl font-bold text-primary">{availability.availableSeats}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Floater Seats Left</span>
                      <span className="text-2xl font-bold text-secondary">{availability.floaterLeft}</span>
                    </div>
                    <div className="pt-2">
                      <div className="text-sm mb-1">Occupancy</div>
                      <div className="w-full bg-base-300 rounded-full h-3">
                        <div
                          className="bg-linear-to-r from-primary to-secondary h-3 rounded-full"
                          style={{ width: `${((availability.totalSeats - availability.availableSeats) / availability.totalSeats) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-right mt-1 text-base-content/60">
                        {availability.totalSeats - availability.availableSeats} of {availability.totalSeats} booked
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="card bg-base-200 shadow-xl animate-pulse">
                <div className="card-body">
                  <div className="h-6 bg-base-300 rounded w-3/4 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-8 bg-base-300 rounded"></div>
                    <div className="h-8 bg-base-300 rounded"></div>
                    <div className="h-4 bg-base-300 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional info card */}
        <div className="mt-8 card bg-base-100 shadow-lg border border-base-300">
          <div className="card-body flex flex-row items-center gap-4">
            <div className="p-2 bg-info/10 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold">Booking Rules</h4>
              <p className="text-sm text-base-content/70">
                <span className='block'>Batch 1 can book designated seats on Mon/Tue/Wed.</span>
                <span className='block'>Batch 2 on Thu/Fri.</span>
                <span className='block'>Floater seats must be booked today before 3 PM for tomorrow.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}