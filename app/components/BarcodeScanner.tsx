'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
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
  const [videoReady, setVideoReady] = useState(false);
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);

  const stopScanner = useCallback(() => {
    if (codeReader.current) {
      // Stop all video tracks
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      codeReader.current = null;
    }
    setIsScanning(false);
    setVideoReady(false);
    setPermissionStatus('prompt');
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const checkCameraPermissions = useCallback(async () => {
    try {
      // Verificar si los permisos están disponibles
      const permissions = await navigator.permissions.query({ name: 'camera' as PermissionName });
      return permissions.state;
    } catch {
      // Si no se puede verificar permisos, asumir que están disponibles
      return 'prompt';
    }
  }, []);

  const initializeScanner = useCallback(async () => {
    try {
      setError(null);
      setPermissionStatus('prompt');
      
      // Verificar primero el estado de los permisos
      const permissionState = await checkCameraPermissions();
      console.log('Estado de permisos de cámara:', permissionState);
      
      if (permissionState === 'denied') {
        setPermissionStatus('denied');
        setError('Los permisos de cámara están denegados. Habilítalos en la configuración del navegador.');
        return;
      }
      
      // Solicitar permisos de cámara y mantener el stream
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: { ideal: 'environment' }, // Cámara trasera preferida, pero no requerida
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 }
        } 
      });
      
      setPermissionStatus('granted');
      
      // Asignar el stream al video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Configurar el video para autoplay
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;
        videoRef.current.autoplay = true;
        
        // Esperar a que el video esté listo y forzar reproducción
        await new Promise<void>((resolve, reject) => {
          const video = videoRef.current;
          if (!video) {
            reject(new Error('Video element not found'));
            return;
          }
          
          const handleLoadedMetadata = async () => {
            try {
              await video.play();
              console.log('Video started successfully');
              setIsScanning(true);
              setVideoReady(true);
              resolve();
            } catch (playError) {
              console.error('Error playing video:', playError);
              reject(playError);
            }
          };
          
          video.onloadedmetadata = handleLoadedMetadata;
          
          // Timeout fallback
          setTimeout(() => {
            if (video.readyState >= 2) { // HAVE_CURRENT_DATA
              handleLoadedMetadata();
            }
          }, 100);
        });
      }
      
      // Inicializar el lector de códigos después de que el video esté funcionando
      codeReader.current = new BrowserMultiFormatReader();
      
      // Esperar un poco más para asegurar que el video esté renderizado
      setTimeout(async () => {
        try {
          // Comenzar el escaneo usando el elemento de video
          await codeReader.current?.decodeFromVideoElement(
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
        } catch (scanError) {
          console.error('Error starting scanner:', scanError);
          setError('Error al inicializar el escáner. Intenta de nuevo.');
        }
      }, 500);
      
    } catch (err) {
      console.error('Error al acceder a la cámara:', err);
      const error = err as Error;
      setPermissionStatus('denied');
      
      // Mensajes de error más específicos
      if (error.name === 'NotAllowedError') {
        setError('Permisos de cámara denegados. Permite el acceso y vuelve a intentar.');
      } else if (error.name === 'NotFoundError') {
        setError('No se encontró ninguna cámara. Verifica que tu dispositivo tenga una cámara.');
      } else if (error.name === 'NotSupportedError') {
        setError('La cámara no es compatible con este navegador.');
      } else {
        setError('No se pudo acceder a la cámara. Verifica los permisos y vuelve a intentar.');
      }
    }
  }, [onCodeScanned, checkCameraPermissions]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Initialize scanner when component mounts, but don't auto-retry
    const init = async () => {
      // Only auto-initialize if we haven't been denied before
      if (permissionStatus !== 'denied') {
        await initializeScanner();
      }
    };
    
    init();
    return stopScanner;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
            <p style={{ margin: '0 0 16px 0', fontSize: '0.875rem', opacity: 0.8 }}>
              Permite el acceso a la cámara para escanear códigos de barras
            </p>
            <button
              onClick={initializeScanner}
              style={{
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '0.875rem',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              Reintentar
            </button>
          </div>
        ) : !isScanning ? (
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
            <p style={{ margin: 0, fontSize: '0.875rem', textAlign: 'center' }}>
              {permissionStatus === 'granted' ? 'Iniciando cámara...' : 'Solicitando permisos...'}
            </p>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                backgroundColor: 'black'
              }}
              autoPlay
              playsInline
              muted
            />
            
            {/* Debug overlay to show video state */}
            <div style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              background: 'rgba(0,0,0,0.7)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '0.75rem'
            }}>
              {videoReady ? '📹 Video activo' : '⏳ Cargando...'}
            </div>
          </>
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