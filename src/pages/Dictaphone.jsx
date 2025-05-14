import React, { useEffect, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { QRCodeSVG } from 'qrcode.react';

const Dictaphone = () => {
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
 const apiUrl = import.meta.env.VITE_API_URL;
  const [fullName, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [responseData, setResponseData] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    extractSmartInfo(transcript);
  }, [transcript]);

  useEffect(() => {
    if (fullName && phone && !submitted) {
      submitForm();
    }
  }, [fullName, phone]);

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
  };

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  return (
    <div className="p-6 space-y-4">
      <p>Microphone: {listening ? 'on' : 'off'}</p>
      <div className="space-x-4">
        <button
          onClick={() => {
            resetAll();
            SpeechRecognition.startListening({ continuous: true });
          }}
        >
          Start Listening
        </button>
        <button onClick={SpeechRecognition.stopListening}>Stop</button>
        <button onClick={resetAll}>Reset</button>
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
