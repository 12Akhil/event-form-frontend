import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

export default function User() {
  const location = useLocation();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
const apiUrl = import.meta.env.VITE_API_URL;
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { email } = location.state || {};
        console.log("Fetching user with email:", email); // Debug log
        
        if (!email) {
          throw new Error('No email provided in location state');
        }

        const response = await fetch(`${apiUrl}/api/get-user`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: email.trim() }),
          credentials: 'include'
        });

        console.log("Response status:", response.status); // Debug log
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Received user data:", data); // Debug log
        
        if (!data.user) {
          throw new Error('User data not found in response');
        }

        setUserData(data.user);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [location.state]);

  if (loading) return <div>Loading user data...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!userData) return <div>No user data available</div>;

  return (
    <div className="user-profile">
      <h1>Your Event Pass</h1>
      <div className="profile-card">
        <h2>{userData.fullName}</h2>
        <p><strong>Email:</strong> {userData.email}</p>
        <p><strong>Phone:</strong> {userData.phone}</p>
        
        <div className="qr-code-container">
          <QRCodeSVG 
            value={userData.qrCodeId} 
            size={200}
            level="H"
            includeMargin={true}
          />
          <p className="qr-instruction">Scan this QR code at the event</p>
        </div>
      </div>
    </div>
  );
}