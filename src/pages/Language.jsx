import React, { useState, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

export default function Language() {
  const [spanish, setSpanish] = useState('');
  const [mandarin, setMandarin] = useState('');
  const { transcript, listening, resetTranscript } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) {
      translateText(transcript, 'es', setSpanish);   // Spanish
      translateText(transcript, 'zh', setMandarin); // Mandarin Chinese
    }
  }, [transcript]);

  const translateText = async (text, targetLang, setter) => {
    try {
      const res = await fetch(`https://lingva.ml/api/v1/en/${targetLang}/${encodeURIComponent(text)}`);
      const data = await res.json();
      setter(data.translation);
    } catch (err) {
      console.error(`Error translating to ${targetLang}:`, err);
      setter('Translation error');
    }
  };

  const startListening = () => {
    SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
  };

  if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    return <p>Your browser does not support speech recognition.</p>;
  }

  return (
    <div style={{ padding: 20, fontFamily: 'Arial' }}>
      <h2>🎙️ Real-Time Speech Translator</h2>
      <button onClick={startListening} style={{ marginRight: 10 }}>Start Listening</button>
      <button onClick={stopListening} style={{ marginRight: 10 }}>Stop Listening</button>
      <button onClick={resetTranscript}>Reset</button>

      <div style={{ marginTop: 20 }}>
        <h3>🗣️ Transcript (English):</h3>
        <p>{transcript}</p>

        <h3>🇪🇸 Spanish:</h3>
        <p>{spanish}</p>

        <h3>🇨🇳 Mandarin:</h3>
        <p>{mandarin}</p>
      </div>

      <p style={{ marginTop: 20 }}>🎧 Listening: {listening ? 'Yes' : 'No'}</p>
    </div>
  );
}
