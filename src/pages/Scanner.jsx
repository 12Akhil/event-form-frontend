import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { Html5Qrcode } from 'html5-qrcode';

const QRScanner = () => {
  const fileInputRef = useRef(null);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [userData, setUserData] = useState(null);
  const html5QrCodeRef = useRef(null);
 const apiUrl = import.meta.env.VITE_API_URL;
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().then(() => html5QrCodeRef.current.clear());
      }
    };
  }, []);

  const startCameraScan = async () => {
    setCameraActive(true);
    setError('');
    setScanResult(null);
    setUserData(null);

    try {
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length) {
        const cameraId = devices[0].id;
        html5QrCodeRef.current = new Html5Qrcode("qr-reader");

        await html5QrCodeRef.current.start(
          cameraId,
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            setScanResult(decodedText);
            handleCheckIn(decodedText);
            stopCameraScan();
          },
          (errorMessage) => {
            console.log("QR Scan Error:", errorMessage);
          }
        );
      } else {
        throw new Error("No camera devices found.");
      }
    } catch (err) {
      console.error("Camera init error:", err);
      setError('Camera access failed. Please check permissions.');
      setCameraActive(false);
    }
  };

  const stopCameraScan = async () => {
    try {
      if (html5QrCodeRef.current) {
        await html5QrCodeRef.current.stop();
        await html5QrCodeRef.current.clear();
        html5QrCodeRef.current = null;
      }
    } catch (err) {
      console.error("Error stopping camera:", err);
    }
    setCameraActive(false);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setError('');
    setScanResult(null);
    setUserData(null);
    if (cameraActive) await stopCameraScan();

    try {
      if (!file.type.match('image.*')) {
        throw new Error('Please upload an image file (JPEG, PNG)');
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        'https://api.qrserver.com/v1/read-qr-code/',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      const decodedText = response.data[0]?.symbol[0]?.data;
      if (!decodedText) throw new Error('No QR code found in image');

      setScanResult(decodedText);
      handleCheckIn(decodedText);
    } catch (err) {
      console.error('Image scan error:', err);
      setError(err.message || 'Failed to read QR code from image.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIn = async (qrCodeId) => {
    try {
      const response = await axios.post(`${apiUrl}/api/check-in`, { qrCodeId });
      if (response.data.success) {
        setUserData(response.data.user);
      } else {
        setError('User not found');
      }
    } catch (err) {
      console.error('Check-in error:', err);
      setError('Error checking in. Please try again.');
    }
  };

  const handleManualCheckIn = async () => {
    if (!scanResult) return;
    await handleCheckIn(scanResult);
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>QR Code Reader</h2>

      {/* Live Camera Preview */}
      <div style={{
        marginBottom: '20px',
        border: '2px solid #ddd',
        borderRadius: '8px',
        overflow: 'hidden',
        minHeight: '300px',
        display: cameraActive ? 'block' : 'none',
        backgroundColor: '#000000FF'
      }}>
        <div id="qr-reader" style={{ width: '100%' }}></div>
      </div>

      {/* Camera Controls */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        {cameraActive ? (
          <button
            onClick={stopCameraScan}
            style={{
              padding: '10px 20px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              flex: 1
            }}
          >
            Stop Camera
          </button>
        ) : (
          <button
            onClick={startCameraScan}
            disabled={isLoading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              flex: 1
            }}
          >
            Start Camera Scanner
          </button>
        )}
      </div>


      <div style={{ textAlign: 'center', margin: '20px 0', position: 'relative' }}>
        <hr style={{ borderTop: '1px solid #ddd' }} />
        <span style={{
          backgroundColor: '#fff',
          padding: '0 10px',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#666'
        }}>
          OR
        </span>
      </div>

      {/* File Upload Section */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
        <button
          onClick={() => fileInputRef.current.click()}
          disabled={isLoading || cameraActive}
          style={{
            padding: '10px 20px',
            backgroundColor: isLoading ? '#cccccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            width: '100%'
          }}
        >
          {isLoading ? 'Processing...' : 'Upload QR Code Image'}
        </button>
      </div>

    
      {error && (
        <div style={{
          color: '#721c24',
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

   
      {scanResult && (
        <div style={{
          border: '1px solid #c3e6cb',
          borderRadius: '8px',
          padding: '20px',
          marginTop: '20px',
          backgroundColor: '#d4edda'
        }}>
          <h4 style={{ textAlign: 'center', color: '#155724' }}>✓ QR Code Scanned</h4>
          <p style={{ wordWrap: 'break-word', color: '#155724' }}><strong>Content:</strong> {scanResult}</p>
        </div>
      )}

      {userData && (
        <div style={{
          border: '1px solid #17a2b8',
          borderRadius: '8px',
          padding: '20px',
          marginTop: '20px',
          backgroundColor: '#000000FF'
        }}>
          <h4 style={{ color: '#0c5460' }}>User Details</h4>
          <p><strong>Name:</strong> {userData.fullName}</p>
          <p><strong>Email:</strong> {userData.email}</p>
          <p><strong>Phone:</strong> {userData.phone}</p>
          <p>
            <strong>Checked In:</strong>{' '}
            <span style={{ color: userData.isCheckedIn ? 'green' : 'red', fontWeight: 'bold' }}>
              {userData.isCheckedIn ? 'Yes' : 'No'}
            </span>
          </p>

          {!userData.isCheckedIn && (
            <button
              onClick={handleManualCheckIn}
              style={{
                marginTop: '10px',
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Check In
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default QRScanner;
