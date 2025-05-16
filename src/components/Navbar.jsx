import React from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const handleAdminLogin = () => {
    navigate("/admin-login"); 
  };
  const language = () => {
    navigate("/language"); 
  };
  const goHome = () => {
    navigate("/"); 
  };

  return (
    <nav
      style={{
        position: "fixed", 
        top: 0,
        left: 0,
        right: 0, 
        backgroundColor: "#000",
        color: "#fff",
        padding: "1rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 1000, 
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)" 
      }}
    >
      <button 
        onClick={goHome}
        style={{
          fontSize: "1.5rem",
          fontWeight: "bold",
          background: "none",
          border: "none",
          color: "#fff",
          cursor: "pointer",
          padding: "0.5rem 1rem"
        }}
      >
        Event Form
      </button>

      <button
        onClick={handleAdminLogin}  
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
        Admin Login
      </button>
    </nav>
  );
}