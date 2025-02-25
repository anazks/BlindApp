import React, { useEffect, useRef, useState } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";

const FOCAL_LENGTH = 500; // Adjust based on your camera
const KNOWN_WIDTHS = {
  person: 0.5, // Approximate width in meters
  car: 1.8,
  bottle: 0.07,
};

const App = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [facingMode, setFacingMode] = useState("user"); // "user" (front) or "environment" (back)

  useEffect(() => {
    loadCamera();
  }, [facingMode]); // Reload camera when facingMode changes

  const loadCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Camera access is not supported on this device.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
        };
      }
    } catch (error) {
      console.error("Error accessing webcam:", error);
      alert("Error accessing the camera. Please check permissions.");
    }
  };

  useEffect(() => {
    const detectObjects = async () => {
      const model = await cocoSsd.load();
      console.log("Model loaded");

      const detect = async () => {
        if (
          videoRef.current &&
          videoRef.current.readyState === 4 &&
          videoRef.current.videoWidth > 0 &&
          videoRef.current.videoHeight > 0
        ) {
          const predictions = await model.detect(videoRef.current);
          drawPredictions(predictions);
          speakPredictions(predictions);
        }
        requestAnimationFrame(detect);
      };

      if (videoRef.current) {
        videoRef.current.onloadeddata = () => {
          console.log("Video loaded, starting detection...");
          detect();
        };
      }
    };

    detectObjects();
  }, []);

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const estimateDistance = (objectClass, bboxWidth) => {
    if (KNOWN_WIDTHS[objectClass]) {
      return (KNOWN_WIDTHS[objectClass] * FOCAL_LENGTH) / bboxWidth;
    }
    return null;
  };

  const drawPredictions = (predictions) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const video = videoRef.current;

    if (video.videoWidth > 0 && video.videoHeight > 0) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    } else {
      canvas.width = 640;
      canvas.height = 480;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);

    predictions.forEach((prediction) => {
      const [x, y, width, height] = prediction.bbox;
      const distance = estimateDistance(prediction.class, width);
      
      context.strokeStyle = "#00FF00";
      context.lineWidth = 2;
      context.strokeRect(x, y, width, height);
      context.fillStyle = "#00FF00";
      context.font = "16px Arial";

      let displayText = `${prediction.class} (${Math.round(prediction.score * 100)}%)`;
      if (distance) {
        displayText += ` - ${distance.toFixed(2)}m`;
      }

      context.fillText(displayText, x, y > 10 ? y - 5 : 10);
    });
  };

  const speakPredictions = (predictions) => {
    if (isSpeaking || predictions.length === 0) return;

    const utterance = new SpeechSynthesisUtterance();
    utterance.text = predictions
      .map((p) => {
        const distance = estimateDistance(p.class, p.bbox[2]);
        return distance
          ? `${p.class} at approximately ${distance.toFixed(2)} meters`
          : p.class;
      })
      .join(", ");
    
    utterance.lang = "en-US";
    setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div style={{ textAlign: "center", background: "linear-gradient(to right, #4CAF50, #81C784)", height: "100vh", position: "relative" }}>
      <h1>Starting Virtual Assistant</h1>
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
      <button 
        onClick={toggleCamera} 
        style={{
          position: "absolute",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: "#ff5722",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          zIndex: 3,
        }}>
        Switch Camera
      </button>
    </div>
  );
};

export default App;
