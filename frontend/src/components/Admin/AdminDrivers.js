import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Box } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';

const AdminDrivers = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return; // Wait until token is ready

    axios.get(`${process.env.REACT_APP_API_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then((res) => {
      console.log("✅ Drivers fetched:", res.data);
      setUsers(res.data);
    })
    .catch((err) => {
      console.error("❌ Driver fetch error:", err.response?.data || err.message);
    })
    .finally(() => setLoading(false));
  }, [token]);

  // 👇 Show loading spinner until token is available
  if (!token || loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Phone</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u._id}>
              <TableCell>{u.name}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>{u.phone || u.phoneNumber}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AdminDrivers;
