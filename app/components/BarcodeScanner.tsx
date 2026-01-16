'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { DecodeHintType, BarcodeFormat } from '@zxing/library'
import { X, Camera, CameraOff } from 'lucide-react'
import { useLanguage } from '@/app/contexts/LanguageContext'

interface BarcodeScannerProps {
  onCodeScanned: (result: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onCodeScanned, onClose }: BarcodeScannerProps) {
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [videoReady, setVideoReady] = useState(false);
  const [videoElementMounted, setVideoElementMounted] = useState(false);
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
    setVideoElementMounted(false);
    setPermissionStatus('prompt');
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const waitForVideoElement = useCallback(async (maxWaitMs = 5000): Promise<HTMLVideoElement> => {
    const startTime = Date.now();
    const checkInterval = 100;
    
    console.log('⏳ Esperando que el video element esté disponible...');
    
    return new Promise((resolve, reject) => {
      const checkVideo = () => {
        const elapsed = Date.now() - startTime;
        
        if (videoRef.current) {
          console.log(`✅ Video element encontrado después de ${elapsed}ms`);
          setVideoElementMounted(true);
          resolve(videoRef.current);
          return;
        }
        
        if (elapsed >= maxWaitMs) {
          console.error(`❌ Video element no disponible después de ${maxWaitMs}ms`);
          reject(new Error(`Video element no se montó en ${maxWaitMs}ms`));
          return;
        }
        
        console.log(`⏳ Esperando video element... ${elapsed}ms`);
        setTimeout(checkVideo, checkInterval);
      };
      
      checkVideo();
    });
  }, []);

  const isMobile = useCallback(() => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (typeof window !== 'undefined' && window.innerWidth <= 768);
  }, []);

  const checkCameraPermissions = useCallback(async () => {
    try {
      // En móviles, la API de permisos puede no funcionar correctamente
      if (isMobile()) {
        console.log('📱 Dispositivo móvil detectado, omitiendo verificación de permisos');
        return 'prompt'; // Siempre intentar en móvil
      }
      
      // Verificar si los permisos están disponibles (solo en desktop)
      const permissions = await navigator.permissions.query({ name: 'camera' as PermissionName });
      return permissions.state;
    } catch {
      // Si no se puede verificar permisos, asumir que están disponibles
      return 'prompt';
    }
  }, [isMobile]);

  const initializeScanner = useCallback(async () => {
    try {
      setError(null);
      setPermissionStatus('prompt');
      console.log('🎥 Iniciando proceso de acceso a cámara...');
      console.log('📱 Es móvil:', isMobile());
      
      // Primero esperar a que el video element esté disponible
      const waitTime = isMobile() ? 8000 : 5000; // Más tiempo en móviles
      const video = await waitForVideoElement(waitTime);
      console.log('✅ Video element confirmado y disponible');
      
      // Verificar si getUserMedia está disponible
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia no está disponible en este navegador');
      }
      
      // En móviles, saltar la verificación de permisos y ir directo a getUserMedia
      if (!isMobile()) {
        // Solo verificar permisos en desktop
        let permissionState = 'prompt';
        try {
          const permissions = await navigator.permissions.query({ name: 'camera' as PermissionName });
          permissionState = permissions.state;
          console.log('📋 Estado de permisos de cámara:', permissionState);
        } catch {
          console.log('⚠️ No se pueden verificar permisos, procediendo con solicitud directa');
        }
        
        if (permissionState === 'denied') {
          setPermissionStatus('denied');
          setError(t('scanner.permissionDenied'));
          return;
        }
      } else {
        console.log('📱 Móvil detectado: omitiendo verificación previa de permisos');
      }
      
      // Configuración específica para móviles vs desktop
      const mobileConstraints = {
        video: {
          facingMode: { ideal: 'environment' }, // Cámara trasera en móvil
          width: { min: 320, ideal: 480, max: 1280 },
          height: { min: 240, ideal: 640, max: 720 }
        }
      };
      
      const desktopConstraints = {
        video: true  // Configuración más simple para desktop
      };
      
      // Intentar con configuración específica para la plataforma
      let stream: MediaStream;
      try {
        const constraints = isMobile() ? mobileConstraints : desktopConstraints;
        console.log('🎯 Intentando acceso a cámara con constraints:', JSON.stringify(constraints));
        
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log('✅ Acceso a cámara exitoso');
      } catch {
        console.log('⚠️ Acceso específico falló, intentando con configuración básica...');
        // Fallback a configuración más básica
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: true
        });
        console.log('✅ Acceso a cámara con configuración básica exitoso');
      }
      
      setPermissionStatus('granted');
      console.log('📹 Stream obtenido, configurando video element...');
      
      // Ya tenemos el video element validado, proceder directamente
      video.srcObject = stream;
      
      // Configurar el video para autoplay
      video.muted = true;
      video.playsInline = true;
      video.autoplay = true;
      
      // En móviles, agregar más atributos para compatibilidad
      if (isMobile()) {
        video.setAttribute('playsinline', 'true');
        video.setAttribute('webkit-playsinline', 'true');
        video.setAttribute('muted', 'true');
      }
      
      console.log('🎬 Configuración de video completada, esperando carga...');
      
      // Esperar a que el video esté listo y forzar reproducción
      await new Promise<void>((resolve, reject) => {
        const handleLoadedMetadata = async () => {
          try {
            console.log('🎬 Video metadata cargada, iniciando reproducción...');
            await video.play();
            console.log('✅ Video reproduciendo correctamente');
            setIsScanning(true);
            setVideoReady(true);
            resolve();
          } catch (playError) {
            console.error('❌ Error reproduciendo video:', playError);
            reject(playError);
          }
        };
        
        // Agregar event listeners
        video.onloadedmetadata = handleLoadedMetadata;
        
        // Para móviles, también escuchar otros eventos
        if (isMobile()) {
          video.oncanplay = () => {
            console.log('📱 Video canplay event triggered');
            if (video.readyState >= 2) {
              handleLoadedMetadata();
            }
          };
        }
        
        // Timeout más largo para móviles
        const timeout = isMobile() ? 7000 : 3000; // Aumentado para móviles
        setTimeout(() => {
          console.log(`⏰ Timeout de video (${timeout}ms), verificando estado...`);
          if (video.readyState >= 2) { // HAVE_CURRENT_DATA
            console.log('📹 Video listo por timeout fallback');
            handleLoadedMetadata();
          } else {
            console.log('❌ Video no está listo después del timeout');
            reject(new Error(`Video no se cargó en ${timeout}ms`));
          }
        }, timeout);
      });
      
      console.log('✅ Video element configurado exitosamente');
      
      // Configurar hints para solo detectar códigos de barras 1D (más rápido)
      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.EAN_13,        // Códigos EAN-13 (productos europeos)
        BarcodeFormat.EAN_8,         // Códigos EAN-8 (productos pequeños)
        BarcodeFormat.UPC_A,         // Códigos UPC-A (productos USA)
        BarcodeFormat.UPC_E,         // Códigos UPC-E (productos pequeños USA)
        BarcodeFormat.CODE_128,      // Code 128 (inventario, logística)
        BarcodeFormat.CODE_39,       // Code 39 (industrial)
        BarcodeFormat.CODE_93,       // Code 93 (logística)
        BarcodeFormat.ITF,           // ITF (cajas y pallets)
        BarcodeFormat.CODABAR        // Codabar (bibliotecas, bancos de sangre)
        // NO incluimos QR_CODE ni otros formatos 2D para mayor velocidad
      ]);
      hints.set(DecodeHintType.TRY_HARDER, false); // Más rápido, menos exhaustivo
      
      // Inicializar el lector de códigos con configuración optimizada
      codeReader.current = new BrowserMultiFormatReader(hints);
      console.log('🔍 Iniciando lector de códigos (solo barcodes 1D)...');
      
      // Timeout más largo para móviles
      const scanTimeout = isMobile() ? 4000 : 2000; // Aumentado para móviles
      setTimeout(async () => {
        try {
          // El video ya está validado, proceder con el scanner
          console.log('🚀 Comenzando escaneo de códigos...');
          await codeReader.current?.decodeFromVideoElement(
            video, // Usar el video validado
            (result, error) => {
              if (result) {
                const scannedText = result.getText();
                console.log('🎯 Código escaneado:', scannedText);
                onCodeScanned(scannedText);
                stopScanner();
              }
              if (error && error.name !== 'NotFoundException') {
                console.warn('⚠️ Error de escaneo:', error);
              }
            }
          );
          console.log('✅ Escáner iniciado correctamente');
        } catch (scanError) {
          console.error('❌ Error starting scanner:', scanError);
          setError(t('scanner.cameraError'));
        }
      }, scanTimeout);
      
    } catch (err) {
      console.error('❌ Error al acceder a la cámara:', err);
      const error = err as Error;
      setPermissionStatus('denied');
      
      // Mensajes de error más específicos y detallados
      console.log('🔍 Analizando tipo de error:', error.name, error.message);
      
      if (error.name === 'NotAllowedError') {
        setError(t('scanner.permissionDenied'));
      } else if (error.name === 'NotFoundError') {
        setError(t('scanner.cameraError'));
      } else if (error.name === 'NotSupportedError') {
        setError(t('scanner.unsupported'));
      } else if (error.name === 'OverconstrainedError') {
        setError(t('scanner.cameraError'));
      } else if (error.message.includes('getUserMedia')) {
        setError(t('scanner.unsupported'));
      } else {
        setError(t('scanner.cameraError'));
      }
    }
  }, [onCodeScanned, checkCameraPermissions, isMobile, waitForVideoElement]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // En lugar de inicializar automáticamente, esperar interacción del usuario
    // Esto da más tiempo al DOM para renderizarse completamente
    const timeoutId = setTimeout(() => {
      if (permissionStatus !== 'denied') {
        console.log('🚀 Iniciando scanner después del timeout de montaje');
        initializeScanner();
      }
    }, isMobile() ? 500 : 100); // Más delay para móviles
    
    return () => {
      clearTimeout(timeoutId);
      stopScanner();
    };
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
          {t('scanner.title')}
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
              {t('scanner.permissionDenied')}
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.875rem', opacity: 0.8 }}>
              {t('scanner.instructions')}
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
              {t('scanner.retry')}
            </button>
          </div>
        ) : (
          <>
            {/* Always render video element, but show loading overlay when not ready */}
            <video
              ref={(el) => {
                videoRef.current = el;
                if (el) {
                  console.log('📹 Video element montado en el DOM');
                  setVideoElementMounted(true);
                } else {
                  console.log('❌ Video element desmontado del DOM');
                  setVideoElementMounted(false);
                }
              }}
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
            
            {/* Loading overlay when video is not ready */}
            {!videoReady && (
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                background: 'rgba(0,0,0,0.8)'
              }}>
                <Camera size={48} style={{ marginBottom: '16px', opacity: 0.7 }} />
                <p style={{ margin: 0, fontSize: '0.875rem', textAlign: 'center' }}>
                  {permissionStatus === 'granted' ? t('scanner.initializing') : t('scanner.permissionDenied')}
                </p>
              </div>
            )}
            
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
              {videoElementMounted 
                ? (videoReady ? '📹 Video activo' : '⏳ Cargando...') 
                : '❌ Element no montado'
              }
            </div>
          </>
        )}

        {/* Scanning Overlay - show when video is ready and scanning */}
        {videoReady && isScanning && (
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
          {t('scanner.instructions')}
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