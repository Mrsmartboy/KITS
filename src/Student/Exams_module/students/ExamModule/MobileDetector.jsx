import React, { useEffect, useRef } from "react";
import Webcam from "react-webcam";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";

/**
 * MobileDetector component that:
 * 1) Loads COCO-SSD model and runs object detection on the webcam feed.
 * 2) Detects phone-like objects by checking class labels ("phone", "electronics", "remote").
 * 3) Calls onPhoneDetected() if a phone is seen.
 * 4) Calls onCameraDisabled() if webcam is unplugged or disabled mid-use.
 *
 * Props:
 *   onPhoneDetected():   Called when a phone is detected.
 *   onCameraDisabled():  Called when the webcam is disabled or permission is denied.
 */
const MobileDetector = ({ onPhoneDetected, onCameraDisabled }) => {
  const webcamRef = useRef(null);
  const modelRef = useRef(null);
  const streamRef = useRef(null);

  // 1) Load the COCO-SSD model once on mount
  useEffect(() => {
    const loadModel = async () => {
      modelRef.current = await cocoSsd.load();
    };
    loadModel();
  }, []);

  // 2) Request the webcam feed ourselves, so we can detect if the user disables it (track ended)
  useEffect(() => {
    let localStream = null;

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user" } })
      .then((stream) => {
        localStream = stream;
        streamRef.current = stream;

        // Listen for the webcam track ending (user unplugs or disables camera)
        stream.getVideoTracks().forEach((track) => {
          track.onended = () => {
            console.warn("Camera track ended. Possibly webcam disabled.");
            if (onCameraDisabled) onCameraDisabled();
          };
        });
      })
      .catch((err) => {
        console.error("Failed to access webcam:", err);
        // Treat denial or error as camera disabled
        if (onCameraDisabled) onCameraDisabled();
      });

    // Stop the stream when component unmounts
    return () => {
      if (localStream) {
        localStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [onCameraDisabled]);

  // 3) Periodically run the detection
  useEffect(() => {
    const DETECTION_INTERVAL_MS = 1000;  // Every 1 second
    const MIN_SCORE_THRESHOLD = 0.3;     // Lower threshold => more sensitive

    const interval = setInterval(async () => {
      if (
        modelRef.current &&
        webcamRef.current?.video &&
        webcamRef.current.video.readyState === 4
      ) {
        const video = webcamRef.current.video;

        // Detect objects in the video frame
        const predictions = await modelRef.current.detect(video);
        // Debug: log results
        // console.log("Predictions:", predictions);

        // Check if any detection qualifies as phone-like
        const phonePrediction = predictions.find((p) => {
          const label = p.class.toLowerCase();
          const isPhoneLike =
            label.includes("phone") ||
            label.includes("electronics") ||
            label.includes("remote"); // Sometimes recognized as "remote"
          const meetsScore = p.score >= MIN_SCORE_THRESHOLD;
          return isPhoneLike && meetsScore;
        });

        if (phonePrediction && onPhoneDetected) {
          onPhoneDetected();
        }
      }
    }, DETECTION_INTERVAL_MS);

    // Cleanup the interval on unmount
    return () => clearInterval(interval);
  }, [onPhoneDetected]);

  return (
    <Webcam
      ref={webcamRef}
      audio={false}
      videoConstraints={{ facingMode: "user" }}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: 640,
        height: 480,
        zIndex: 999, // On top so you can see it while debugging
      }}
    />
  );
};

export default MobileDetector;
