import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem('token'); // ✅ Safely get stored token

  useEffect(() => {
    const storedToken = token || localStorage.getItem('token');
    if (!storedToken) return;

    axios.get('/api/admin/users', {
      headers: { Authorization: `Bearer ${storedToken}` }
    })
      .then((res) => {
        console.log('Users Response:', res.data);
        setUsers(res.data);
      })
      .catch((err) => {
        console.error('Error fetching users:', err);
      });
  }, [token]);


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

export default AdminUsers;
