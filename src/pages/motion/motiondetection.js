import React, { useEffect, useRef, useState, useCallback } from 'react';
import { PoseLandmarker, FilesetResolver, DrawingUtils } from 'https://cdn.skypack.dev/@mediapipe/tasks-vision@0.10.0';

const MotionDetection = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [poseLandmarker, setPoseLandmarker] = useState(null);
  const videoHeight = 450;
  const videoWidth = 600;

  const lerp = useCallback((value, start, end, startValue, endValue) => {
    return startValue + (endValue - startValue) * ((value - start) / (end - start));
  }, []);

  const landmarkNames = [
    "Nose", "Left Eye Inner", "Left Eye", "Left Eye Outer",
    "Right Eye Inner", "Right Eye", "Right Eye Outer", "Left Ear",
    "Right Ear", "Left Shoulder", "Right Shoulder", "Left Elbow",
    "Right Elbow", "Left Wrist", "Right Wrist"
  ];

  useEffect(() => {
    const predictWebcam = async () => {
      if (poseLandmarker && videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvasElement = canvasRef.current;
        const canvasCtx = canvasElement.getContext('2d');

        if (!canvasCtx) {
          console.error('2D context of canvas is null');
          return;
        }

        const drawingUtils = new DrawingUtils(canvasCtx);

        canvasElement.width = videoWidth;
        canvasElement.height = videoHeight;
        video.width = videoWidth;
        video.height = videoHeight;

        const detect = () => {
          if (!poseLandmarker) return;

          const startTimeMs = performance.now();
          poseLandmarker.detectForVideo(video, startTimeMs, (result) => {
            canvasCtx.save();
            canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

            if (result.landmarks && result.landmarks.length > 0) {
              console.log('Landmarks detected:', result.landmarks.length);

              for (const landmarks of result.landmarks) {
                // 좌표값이 유효한 경우에만 콘솔에 출력
                landmarks.forEach((landmark, index) => {
                  if (landmark.x !== undefined && landmark.y !== undefined && index < 15) {
                    console.log(`Landmark coordinates for ${landmarkNames[index]}:`, landmark.x, landmark.y);
                  }
                });

                drawingUtils.drawLandmarks(landmarks, {
                  radius: (data) => {
                    const radius = lerp(data.from.z, -0.15, 0.1, 3, 0.5);
                    return radius < 0 ? 0.5 : radius;
                  },
                });
                drawingUtils.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS);
              }
            } else {
              console.log('No landmarks detected');
            }

            canvasCtx.restore();
          });

          window.requestAnimationFrame(detect);
        };

        detect();
      } else {
        console.log('PoseLandmarker or videoRef or canvasRef is not ready');
      }
    };

    if (poseLandmarker && videoRef.current) {
      const enableCam = async () => {
        const constraints = { video: true };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        videoRef.current.srcObject = stream;
        videoRef.current.onloadeddata = () => {
          videoRef.current.play();
          predictWebcam();
        };
      };

      enableCam();
    }
  }, [poseLandmarker, lerp]);

  useEffect(() => {
    const createPoseLandmarker = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
      );
      const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numPoses: 1,
      });
      setPoseLandmarker(poseLandmarker);
      console.log('PoseLandmarker created');
    };

    createPoseLandmarker();
  }, []);

  return (
    <div>
      <video ref={videoRef} style={{ display: 'block', position: 'absolute' }} autoPlay></video>
      <canvas ref={canvasRef} style={{ display: 'block', position: 'absolute' }}></canvas>
    </div>
  );
};

export default MotionDetection;
