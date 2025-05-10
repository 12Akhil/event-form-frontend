import React from 'react';
import { useLocation } from 'react-router-dom';

export default function ThankYou() {
  const location = useLocation();
  const { user, qrCodeUrl } = location.state || {};

  if (!user) {
    return <div>No registration data found</div>;
  }

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h1>Thank You for Registering!</h1>
      <div style={{ margin: '20px auto', maxWidth: '500px' }}>
        <p><strong>Name:</strong> {user.fullName}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Phone:</strong> {user.phone}</p>
      </div>
      
      <h2>Your Check-In QR Code</h2>
      <div style={{ margin: '20px auto', padding: '20px', backgroundColor: 'white', display: 'inline-block', borderRadius: '8px' }}>
        <img 
          src={qrCodeUrl} 
          alt="Personal QR Code"
        />
      </div>
      <p>Save this QR code for event check-in</p>
    </div>
  );
}