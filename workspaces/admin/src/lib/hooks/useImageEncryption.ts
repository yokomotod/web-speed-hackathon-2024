import { useCallback, useEffect, useRef } from 'react';
import type { ImageEncryptionMessage, ImageEncryptionResult } from '../workers/imageEncryption.worker';

export const useImageEncryption = () => {
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // Web Workerを初期化
    try {
      workerRef.current = new Worker(
        new URL('../workers/imageEncryption.worker.ts', import.meta.url),
        { type: 'module' }
      );
    } catch (error) {
      console.warn('Web Worker not supported, falling back to main thread:', error);
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  const encryptImage = useCallback(
    (imageData: ImageData, width: number, height: number): Promise<ImageData> => {
      return new Promise((resolve, reject) => {
        if (!workerRef.current) {
          reject(new Error('Worker not available'));
          return;
        }

        const handleMessage = (event: MessageEvent<ImageEncryptionResult>) => {
          workerRef.current?.removeEventListener('message', handleMessage);
          
          if (event.data.type === 'success' && event.data.imageData) {
            resolve(event.data.imageData);
          } else {
            reject(new Error(event.data.error || 'Encryption failed'));
          }
        };

        workerRef.current.addEventListener('message', handleMessage);
        
        const message: ImageEncryptionMessage = {
          type: 'encrypt',
          imageData,
          width,
          height,
        };
        
        workerRef.current.postMessage(message);
      });
    },
    []
  );

  return { encryptImage, isWorkerAvailable: !!workerRef.current };
};