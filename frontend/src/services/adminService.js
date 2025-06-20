import axios from 'axios';

export const fetchAllBookings = async (token) => {
  const res = await axios.get('http://localhost:5000/api/admin/bookings', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};
