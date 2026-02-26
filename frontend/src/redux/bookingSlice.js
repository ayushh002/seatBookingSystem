import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosClient from "../utils/axiosClient";
import toast from 'react-hot-toast';

export const fetchMyBookings = createAsyncThunk(
  'booking/fetchMyBookings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/book/my');
      return response.data.data.bookings;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to fetch bookings';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchAvailability = createAsyncThunk(
  'booking/fetchAvailability',
  async (date = null, { rejectWithValue }) => {
    try {
      const url = date ? `/book/availability/${date}` : '/book/availability';
      const response = await axiosClient.get(url);
      return response.data.data;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to fetch availability';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const createBooking = createAsyncThunk(
  'booking/create',
  async (bookingData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/book', bookingData);
      toast.success('Booking successful!');
      return response.data.data.booking;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Booking failed';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const cancelBooking = createAsyncThunk(
  'booking/cancel',
  async (bookingId, { rejectWithValue }) => {
    try {
      await axiosClient.delete(`/book/${bookingId}`);
      toast.success('Booking cancelled');
      return bookingId;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Cancellation failed';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const bookingSlice = createSlice({
  name: 'booking',
  initialState: {
    bookings: [],
    availability: null,
    loading: false,
    error: null
  },
  reducers: {
    clearAvailability: (state) => {
      state.availability = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyBookings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload;
      })
      .addCase(fetchMyBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAvailability.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAvailability.fulfilled, (state, action) => {
        state.loading = false;
        state.availability = action.payload;
      })
      .addCase(fetchAvailability.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.bookings.push(action.payload);
        // Invalidate availability so dashboard refetches
        state.availability = null;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.bookings = state.bookings.filter(b => b._id !== action.payload);
        state.availability = null; // Invalidate cache
      });
  }
});

export const { clearAvailability } = bookingSlice.actions;
export default bookingSlice.reducer;