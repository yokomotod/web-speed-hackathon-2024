import { useCallback, useEffect, useRef } from 'react';
import type { ImageDecryptionMessage, ImageDecryptionResult } from '../workers/imageDecryption.worker';

export const useImageDecryption = () => {
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // Web Workerを初期化
    try {
      workerRef.current = new Worker(
        new URL('../workers/imageDecryption.worker.ts', import.meta.url),
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

  const decryptImage = useCallback(
    (imageData: ImageData, width: number, height: number): Promise<ImageData> => {
      return new Promise((resolve, reject) => {
        if (!workerRef.current) {
          reject(new Error('Worker not available'));
          return;
        }

        const handleMessage = (event: MessageEvent<ImageDecryptionResult>) => {
          workerRef.current?.removeEventListener('message', handleMessage);
          
          if (event.data.type === 'success' && event.data.imageData) {
            resolve(event.data.imageData);
          } else {
            reject(new Error(event.data.error || 'Decryption failed'));
          }
        };

        workerRef.current.addEventListener('message', handleMessage);
        
        const message: ImageDecryptionMessage = {
          type: 'decrypt',
          imageData,
          width,
          height,
        };
        
        workerRef.current.postMessage(message);
      });
    },
    []
  );

  return { decryptImage, isWorkerAvailable: !!workerRef.current };
};