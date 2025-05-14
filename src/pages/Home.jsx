import React from 'react';
import { useNavigate } from 'react-router-dom'; 

export default function Home() {
  const apiUrl = import.meta.env.VITE_FRONT_URL;
  console.log(apiUrl);
  const navigate = useNavigate();
  const formUrl = `${apiUrl}/register`;

  const handleAlreadyRegisteredClick = () => {
    navigate('/user-login'); 
  };
  const Scanner = () => {
    navigate('/check-in'); 
  };
  const audio = () => {
    navigate("/audio"); 
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px', paddingTop: '80px' }}>
      <button onClick={Scanner} style={buttonStyle}>
       Click to CheckIN
      </button>

      <h1>Scan to Register</h1>
      <div style={{ margin: '20px auto', padding: '20px', backgroundColor: 'white', display: 'inline-block', borderRadius: '8px' }}>
        <img 
          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(formUrl)}`} 
          alt="Registration QR Code"
        />
      </div>
     &nbsp;&nbsp;
    <div>
      <button
        onClick={audio}  
        style={{
          backgroundColor: "#fff",
          color: "#000",
          border: "none",
          padding: "0.5rem 1.5rem",
          borderRadius: "4px",
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: "1rem"
        }}
      >
       For Audio Login
      </button> 
    </div>

      <p>Scan this QR code with any smartphone camera to access the registration form</p>
      <button onClick={handleAlreadyRegisteredClick} style={buttonStyle}>
        If already registered, Click here..!
      </button>
    </div>
  );
}

const buttonStyle = {
  padding: '10px 20px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  margin: '10px'
};