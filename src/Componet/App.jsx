import React, { useEffect, useRef, useState } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";
import { BrowserRouter as Router, Route } from "react-router-dom";

const App = () => {
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

  // Speak detected objects
  const speakPredictions = (predictions) => {
    if (isSpeaking || predictions.length === 0) return;

    const utterance = new SpeechSynthesisUtterance();
    utterance.text = predictions.map((p) => p.class).join(", ");
    utterance.lang = "en-US";

    setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Object Detection with TTS</h1>
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
  );
};

export default App;
