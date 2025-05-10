import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { Html5Qrcode } from 'html5-qrcode';

const QRScanner = () => {
  const fileInputRef = useRef(null);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
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

    try {
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length) {
        const cameraId = devices[0].id;
        html5QrCodeRef.current = new Html5Qrcode("qr-reader");

        await html5QrCodeRef.current.start(
          cameraId,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          async (decodedText) => {
            await verifyQRCode(decodedText);
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
    if (cameraActive) await stopCameraScan();

    try {
      if (!file.type.match('image.*')) {
        throw new Error('Please upload an image file (JPEG, PNG)');
      }

      const formData = new FormData();
      formData.append('file', file);

      const decodeResponse = await axios.post(
        'https://api.qrserver.com/v1/read-qr-code/',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      const decodedText = decodeResponse.data[0]?.symbol[0]?.data;
      if (!decodedText) throw new Error('No QR code found in image');

      await verifyQRCode(decodedText);
    } catch (err) {
      console.error('Scan error:', err);
      setError(err.response?.data?.message || 
               err.message || 
               'Failed to verify QR code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyQRCode = async (qrCodeId) => {
    try {
      const verifyResponse = await axios.post(`${apiUrl}/api/verify-qr`, {
        qrCodeId: qrCodeId.trim()
      }, { headers: { 'Content-Type': 'application/json' } });

      if (!verifyResponse.data.success) {
        throw new Error(verifyResponse.data.message || 'Verification failed');
      }

      setScanResult(verifyResponse.data.user);
    } catch (err) {
      throw err;
    }
  };

  const handleCheckIn = async () => {
    try {
      if (!scanResult) return;
      
      const response = await axios.post(`${apiUrl}/api/check-in`, {
        qrCodeId: scanResult.qrCode
      });

      if (response.data.success) {
        setScanResult(prev => ({
          ...prev,
          isCheckedIn: true
        }));
      }
    } catch (err) {
      console.error('Check-in error:', err);
      setError('Failed to update check-in status');
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>QR Code Check-In</h2>

      {/* Live Camera Preview */}
      <div style={{ 
        marginBottom: '20px',
        border: '2px solid #ddd',
        borderRadius: '8px',
        overflow: 'hidden',
        minHeight: '300px',
        display: cameraActive ? 'block' : 'none',
        backgroundColor: '#f5f5f5'
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

      {/* Divider */}
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

      {/* Error Display */}
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

      {/* Scan Results */}
      {scanResult && (
        <div style={{
          border: '1px solid #d4edda',
          borderRadius: '8px',
          padding: '20px',
          marginTop: '20px',
          backgroundColor: '#f8f9fa'
        }}>
          <h3 style={{ 
            marginTop: 0, 
            textAlign: 'center',
            color: '#155724'
          }}>
            ✓ User Verified
          </h3>
          <div style={{ marginBottom: '15px' }}>
            <p><strong>Name:</strong> {scanResult.fullName}</p>
            <p><strong>Email:</strong> {scanResult.email}</p>
            <p><strong>Phone:</strong> {scanResult.phone}</p>
          </div>
          <div style={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <strong>Status:</strong> 
              <span style={{ 
                color: scanResult.isCheckedIn ? '#28a745' : '#dc3545',
                marginLeft: '5px',
                fontWeight: 'bold'
              }}>
                {scanResult.isCheckedIn ? 'Checked In' : 'Not Checked In'}
              </span>
            </div>
            {!scanResult.isCheckedIn && (
              <button
                onClick={handleCheckIn}
                style={{
                  padding: '5px 10px',
                  backgroundColor: '#dc3545',
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
        </div>
      )}
    </div>
  );
};

export default QRScanner;