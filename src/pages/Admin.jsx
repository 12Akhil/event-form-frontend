import React, { useEffect, useState } from 'react';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const apiUrl = import.meta.env.VITE_API_URL;
  useEffect(() => {
    fetch(`${apiUrl}/api/get-all-users`)
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error('Error fetching users:', err));
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>All Registered Users</h2>
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Checked In</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, i) => (
            <tr key={i}>
              <td>{u.fullName}</td>
              <td>{u.email}</td>
              <td>{u.phone}</td>
              <td>{u.
isCheckedIn ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
