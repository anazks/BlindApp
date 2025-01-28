import React, { useEffect, useRef, useState } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";
import { Link } from "react-router-dom";

const CameraDetection = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Initialize the video stream
  useEffect(() => {
    const loadCamera = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    };

    loadCamera();
  }, []);

  // Load the COCO-SSD model and start detection
  useEffect(() => {
    const detectObjects = async () => {
      const model = await cocoSsd.load();
      console.log("Model loaded");

      const detect = async () => {
        if (videoRef.current) {
          const predictions = await model.detect(videoRef.current);
          drawPredictions(predictions);
          speakPredictions(predictions);
        }
        requestAnimationFrame(detect);
      };

      detect();
    };

    detectObjects();
  }, []);

  // Draw predictions on canvas
  const drawPredictions = (predictions) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.clearRect(0, 0, canvas.width, canvas.height);

    predictions.forEach((prediction) => {
      const [x, y, width, height] = prediction.bbox;
      context.strokeStyle = "#00FF00";
      context.lineWidth = 2;
      context.strokeRect(x, y, width, height);
      context.fillStyle = "#00FF00";
      context.font = "16px Arial";
      context.fillText(
        `${prediction.class} (${Math.round(prediction.score * 100)}%)`,
        x,
        y > 10 ? y - 5 : 10
      );
    });
  };

  // Estimate distance based on object height in image
  const estimateDistance = (bboxHeight, actualHeight = 1.7) => {
    const focalLength = 500; // Example focal length in pixels
    return (actualHeight * focalLength) / bboxHeight; // Returns distance in meters
  };

  // Speak detected objects with their estimated distances
  const speakPredictions = (predictions) => {
    if (isSpeaking || predictions.length === 0) return;

    const utterance = new SpeechSynthesisUtterance();
    utterance.text = predictions
      .map((p) => {
        const distance = estimateDistance(p.bbox[3]); // Using height of bounding box
        return `${p.class} is approximately ${distance.toFixed(2)} meters away.`;
      })
      .join(", ");
    utterance.lang = "en-US";

    setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Function to open Google Maps with a destination and speak it
  const openGoogleMaps = () => {
    const destination = "1600 Amphitheatre Parkway, Mountain View, CA"; // Example destination
    const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(destination)}`;

    // Speak the destination
    const utterance = new SpeechSynthesisUtterance();
    utterance.text = `Opening Google Maps for ${destination}`;
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);

    // Open Google Maps in a new window
    window.open(mapUrl, "_blank");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "linear-gradient(to right, #4CAF50, #81C784)",
        color: "white",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* Navbar */}
      <nav
        style={{
          width: "100%",
          padding: "1rem",
          backgroundColor: "#388E3C",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "bold" }}>
          VisionAid
        </h2>
        <div>
          <Link
            to="/"
            style={{
              textDecoration: "none",
              color: "white",
              fontWeight: "bold",
              marginLeft: "1rem",
            }}
          >
            Home
          </Link>
        </div>
      </nav>

      {/* Detection Area */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <video
          ref={videoRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 1,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 2,
          }}
        />
      </div>

      {/* Google Maps Button */}
      <button
        onClick={openGoogleMaps}
        style={{
          padding: "1rem 2rem",
          fontSize: "1.25rem",
          fontWeight: "bold",
          color: "#4CAF50",
          background: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          marginTop: "20px",
          transition: "all 0.3s ease",
        }}
        onMouseOver={(e) => (e.target.style.background = "#f0f0f0")}
        onMouseOut={(e) => (e.target.style.background = "white")}
      >
        Open Google Maps
      </button>
    </div>
  );
};

export default CameraDetection;
