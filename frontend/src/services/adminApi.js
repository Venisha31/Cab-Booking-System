import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api/admin' });

export const fetchStats = (token) =>
  API.get('/stats', {
    headers: { Authorization: `Bearer ${token}` },
  });

export const fetchUsers = (token) =>
  API.get('/users', {
    headers: { Authorization: `Bearer ${token}` },
  });

export const fetchDrivers = (token) =>
  API.get('/drivers', {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateDriverStatus = (id, isApproved, token) =>
  API.put(
    `/drivers/${id}/status`,
    { isApproved },
    { headers: { Authorization: `Bearer ${token}` } }
  );

export const fetchBookings = (token) =>
  API.get('/bookings', {
    headers: { Authorization: `Bearer ${token}` },
  });
