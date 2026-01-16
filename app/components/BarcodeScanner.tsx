'use client'

import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { X, Camera, CameraOff } from 'lucide-react'

interface BarcodeScannerProps {
  onCodeScanned: (result: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onCodeScanned, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    initializeScanner();
    return () => stopScanner();
  }, []);

  const initializeScanner = async () => {
    try {
      setError(null);
      
      // Solicitar permisos de cámara
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Cámara trasera preferida
      });
      
      setPermissionStatus('granted');
      
      // Detener el stream temporal
      stream.getTracks().forEach(track => track.stop());
      
      // Inicializar el lector de códigos
      codeReader.current = new BrowserMultiFormatReader();
      
      setIsScanning(true)
      
      // Comenzar el escaneo
      await codeReader.current.decodeFromVideoDevice(
        undefined, // Usar dispositivo por defecto
        videoRef.current!,
        (result, error) => {
          if (result) {
            const scannedText = result.getText();
            console.log('Código escaneado:', scannedText);
            onCodeScanned(scannedText);
            stopScanner();
          }
          if (error && error.name !== 'NotFoundException') {
            console.warn('Error de escaneo:', error);
          }
        }
      );
      
    } catch (err) {
      console.error('Error al acceder a la cámara:', err);
      setPermissionStatus('denied');
      setError('No se pudo acceder a la cámara. Verifica los permisos.');
    }
  }

  const stopScanner = () => {
    if (codeReader.current) {
      // Stop all video tracks
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      codeReader.current = null;
    }
    setIsScanning(false);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.9)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{
        width: '100%',
        maxWidth: '400px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        color: 'white'
      }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
          Escanear Código de Barras
        </h2>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'white'
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Video Container */}
      <div style={{
        width: '100%',
        maxWidth: '400px',
        aspectRatio: '1',
        background: 'black',
        borderRadius: '12px',
        overflow: 'hidden',
        position: 'relative',
        border: '2px solid var(--primary)'
      }}>
        {permissionStatus === 'denied' ? (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            textAlign: 'center',
            padding: '20px'
          }}>
            <CameraOff size={48} style={{ marginBottom: '16px', opacity: 0.7 }} />
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.125rem' }}>
              Cámara no disponible
            </h3>
            <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.8 }}>
              Permite el acceso a la cámara para escanear códigos de barras
            </p>
          </div>
        ) : isScanning ? (
          <video
            ref={videoRef}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            autoPlay
            playsInline
            muted
          />
        ) : (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}>
            <Camera size={48} style={{ marginBottom: '16px', opacity: 0.7 }} />
            <p style={{ margin: 0, fontSize: '0.875rem' }}>
              Iniciando cámara...
            </p>
          </div>
        )}

        {/* Scanning Overlay */}
        {isScanning && (
          <div style={{
            position: 'absolute',
            inset: '20%',
            border: '2px solid var(--primary)',
            borderRadius: '8px',
            background: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              position: 'absolute',
              top: '-2px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '60%',
              height: '2px',
              background: 'var(--primary)',
              animation: 'scan-line 2s infinite linear'
            }} />
          </div>
        )}
      </div>

      {/* Instructions */}
      <div style={{
        marginTop: '20px',
        textAlign: 'center',
        color: 'white',
        maxWidth: '400px'
      }}>
        <p style={{ 
          margin: 0, 
          fontSize: '0.875rem', 
          opacity: 0.8,
          lineHeight: 1.5 
        }}>
          Apunta la cámara hacia el código de barras. La captura es automática.
        </p>
      </div>

      {error && (
        <div style={{
          marginTop: '16px',
          padding: '12px 16px',
          background: 'rgba(239, 68, 68, 0.2)',
          border: '1px solid rgba(239, 68, 68, 0.5)',
          borderRadius: '8px',
          color: '#fca5a5',
          fontSize: '0.875rem',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      <style jsx>{`
        @keyframes scan-line {
          0% { top: -2px; }
          50% { top: calc(100% - 2px); }
          100% { top: -2px; }
        }
      `}</style>
    </div>
  )
}