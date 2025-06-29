import axios from 'axios';

export const fetchAllBookings = async (token) => {
  const res = await axios.get(
    `${process.env.REACT_APP_API_URL}/api/admin/bookings`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return res.data;
};
