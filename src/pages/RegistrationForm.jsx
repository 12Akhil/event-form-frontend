import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RegistrationForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const apiUrl = import.meta.env.VITE_API_URL;
  const mailboxAccessKey = '9ce5612d6f2131bfb38742f2cd3cfc34';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
     
      const emailCheckResponse = await fetch(`https://apilayer.net/api/check?access_key=${mailboxAccessKey}&email=${formData.email}`);
      const emailCheckData = await emailCheckResponse.json();

      if (emailCheckData.free === true) {
        setError('Only business email addresses are allowed.');
        return;
      }

  
      const response = await fetch(`${apiUrl}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      navigate('/thank', {
        state: {
          user: data.user,
          qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data.user.qrCode)}`
        }
      });

    } catch (err) {
      setError(err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h2>User Registration</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Full Name:</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Phone Number:</label>
          <input
            type="tel"
            name="phone"
            maxLength="10"
            value={formData.phone}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <button 
          type="submit"
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Register
        </button>
      </form>
    </div>
  );
}
