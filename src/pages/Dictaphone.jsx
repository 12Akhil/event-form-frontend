import React, { useEffect, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { QRCodeSVG } from 'qrcode.react';

const Dictaphone = () => {
  const { 
    transcript, 
    listening, 
    resetTranscript, 
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable
  } = useSpeechRecognition();
  
  const apiUrl = import.meta.env.VITE_API_URL;
  const [fullName, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [responseData, setResponseData] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile devices
  useEffect(() => {
    setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
  }, []);

  useEffect(() => {
    extractSmartInfo(transcript);
  }, [transcript]);

  useEffect(() => {
    if (fullName && phone && !submitted) {
      submitForm();
    }
  }, [fullName, phone]);

  const checkMicrophonePermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermissionDenied(false);
      return true;
    } catch (err) {
      console.error("Microphone access denied:", err);
      setPermissionDenied(true);
      setError("Microphone permission was denied. Please allow microphone access.");
      return false;
    }
  };

  const handleStartListening = async () => {
    resetAll();
    const hasPermission = await checkMicrophonePermission();
    if (!hasPermission) return;

    try {
      // Use different parameters for mobile vs desktop
      await SpeechRecognition.startListening({ 
        continuous: !isMobile,  // Continuous doesn't work well on mobile
        language: 'en-US',
        interimResults: true
      });
    } catch (err) {
      setError("Failed to start speech recognition: " + err.message);
      if (isMobile) {
        setError("On mobile devices, please tap to speak and say your name and phone number clearly.");
      }
    }
  };

  const handleStopListening = async () => {
    try {
      await SpeechRecognition.stopListening();
    } catch (err) {
      setError("Failed to stop recognition: " + err.message);
    }
  };

  const extractSmartInfo = (text) => {
    // Improved pattern matching for mobile dictation
    const digitsOnly = text.replace(/\D/g, '');
    const phoneMatch = digitsOnly.match(/(\d{10})/);
    if (phoneMatch && !phone) setPhone(phoneMatch[0]);

    // More flexible name matching
    const nameMatch = text.match(/(?:my name is|name is|this is|i am|i'm)\s+([A-Za-z]+(?:\s[A-Za-z]+)*)/i);
    if (nameMatch && !fullName) {
      setName(nameMatch[1].trim());
    }
  };

  const submitForm = async () => {
    setSubmitted(true);
    const formData = { fullName, phone };
    try {
      const response = await fetch(`${apiUrl}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('User not found or server error');
      const data = await response.json();
      setResponseData(data);
    } catch (error) {
      setResponseData({ error: error.message });
    }
  };

  const resetAll = () => {
    resetTranscript();
    setName('');
    setPhone('');
    setResponseData(null);
    setSubmitted(false);
    setError(null);
  };

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="text-red-500 p-4">
        <p>Your browser doesn't support speech recognition. Please try:</p>
        <ul className="list-disc pl-5 mt-2">
          <li>Google Chrome (desktop or Android)</li>
          <li>Microsoft Edge</li>
          <li>Safari on macOS (limited support)</li>
        </ul>
        <p className="mt-2">Mobile Safari (iOS) has limited support for continuous recognition.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {permissionDenied && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          {isMobile ? (
            <p>Please enable microphone access in your browser settings and refresh the page.</p>
          ) : (
            <p>Microphone access is required. Please allow microphone permissions.</p>
          )}
        </div>
      )}

      <p>Microphone: {listening ? 'on' : 'off'}</p>
      <div className="flex flex-wrap gap-4">
        <button
          onClick={handleStartListening}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          disabled={permissionDenied}
        >
          {isMobile ? 'Tap to Speak' : 'Start Listening'}
        </button>
        <button 
          onClick={handleStopListening}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Stop
        </button>
        <button 
          onClick={resetAll}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
        >
          Reset
        </button>
      </div>

      {isMobile && (
        <div className="bg-blue-50 border border-blue-200 p-3 rounded">
          <p className="font-semibold">Mobile Instructions:</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Tap "Tap to Speak" button</li>
            <li>Say clearly: "My name is [Your Name]"</li>
            <li>Then say: "My phone number is [Your 10-digit Number]"</li>
            <li>Tap "Stop" when finished</li>
          </ol>
        </div>
      )}

      <div className="bg-gray-50 p-4 rounded">
        <p className="text-gray-700 break-words">Transcript: {transcript || '---'}</p>
      </div>
      
      <div className="bg-gray-100 rounded p-4">
        <p><strong>Detected Name:</strong> {fullName || '---'}</p>
        <p><strong>Detected Phone:</strong> {phone || '---'}</p>
      </div>

      {responseData && (
        <div className="bg-green-100 border border-green-400 rounded p-4">
          {/* ... existing response display ... */}
        </div>
      )}
    </div>
  );
};

export default Dictaphone;