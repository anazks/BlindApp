import React from "react";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate(); // Initialize navigate function

  const handleGetStarted = () => {
    navigate("/home"); // Navigate to the "/home" route
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "linear-gradient(to right, #4CAF50, #81C784)",
        color: "white",
        textAlign: "center",
        fontFamily: "Arial, sans-serif",
        padding: "20px",
      }}
    >
      <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>
        Welcome to VisionAid
      </h1>
      <p style={{ fontSize: "1.5rem", maxWidth: "600px", marginBottom: "2rem" }}>
        Empowering the visually impaired by identifying objects and obstacles
        through a real-time camera feed. Let VisionAid be your guide to a safer
        and more independent journey.
      </p>
      <button
        onClick={handleGetStarted}
        style={{
          padding: "1rem 2rem",
          fontSize: "1.25rem",
          fontWeight: "bold",
          color: "#4CAF50",
          background: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          transition: "all 0.3s ease",
        }}
        onMouseOver={(e) => (e.target.style.background = "#f0f0f0")}
        onMouseOut={(e) => (e.target.style.background = "white")}
      >
        Get Started
      </button>
    </div>
  );
}

export default HomePage;
