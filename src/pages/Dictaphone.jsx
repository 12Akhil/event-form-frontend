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
    } catch (err) {
      console.error("Microphone access denied:", err);
      setPermissionDenied(true);
      setError("Microphone permission was denied. Please allow microphone access.");
    }
  };

  const handleStartListening = async () => {
    resetAll();
    await checkMicrophonePermission();
    if (!permissionDenied) {
      try {
        await SpeechRecognition.startListening({ continuous: true });
      } catch (err) {
        setError("Failed to start speech recognition: " + err.message);
      }
    }
  };

  const extractSmartInfo = (text) => {
    const digitsOnly = text.replace(/(\d)\s+(\d)/g, '$1$2');
    const phoneMatch = digitsOnly.match(/(?:phone(?: number)? is\s*)?(\d{10})/);
    if (phoneMatch && !phone) setPhone(phoneMatch[1]);

    const nameMatch = text.match(/(?:my name is|name is|this is|i am)\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)*|\w+(?:\s\w+)*)/i);
    if (nameMatch && !fullName) {
      setName(nameMatch[1].trim());
      return;
    }

    const words = text.match(/\b[A-Z][a-z]+\b/g);
    if (words && words.length >= 2 && !fullName) {
      const possibleName = words.join(' ').trim();
      setName(possibleName);
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
    return <span className="text-red-500">Browser doesn't support speech recognition.</span>;
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
          Microphone access is required for speech recognition. Please refresh and allow microphone permissions.
        </div>
      )}

      <p>Microphone: {listening ? 'on' : 'off'}</p>
      <div className="space-x-4">
        <button
          onClick={handleStartListening}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          disabled={permissionDenied}
        >
          Start Listening
        </button>
        <button 
          onClick={SpeechRecognition.stopListening}
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
      <div>
        <h4>Instructions :</h4>
        <ol className="list-decimal pl-5 space-y-1">
                  <li>Tap "Tap to Speak" button</li>
                  <li>Say clearly: "My name is [Your Name]"</li>
                  <li>Then say: "My phone number is [Your Number]"</li>
          </ol>
      </div>
      <p className="text-gray-700">Transcript: {transcript}</p>
      <div className="bg-gray-100 rounded p-4">
        <p><strong>Detected Name:</strong> {fullName || '---'}</p>
        <p><strong>Detected Phone:</strong> {phone || '---'}</p>
      </div>
      {responseData && (
        <div className="bg-green-100 border border-green-400 rounded p-4">
          <h3 className="font-semibold text-lg">User Info:</h3>
          {responseData.error ? (
            <p className="text-red-500">{responseData.error}</p>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-2">{responseData.user.fullName}</h2>
              <p><strong>Email:</strong> {responseData.user.email}</p>
              <p><strong>Phone:</strong> {responseData.user.phone}</p>

              <div className="qr-code-container mt-4">
                <QRCodeSVG 
                  value={responseData.user.qrCodeId} 
                  size={200}
                  level="H"
                  includeMargin={true}
                />
                <p className="qr-instruction mt-2 text-sm text-gray-600">Scan this QR code at the event</p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Dictaphone;