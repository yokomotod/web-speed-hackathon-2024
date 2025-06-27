import { decrypt } from '@wsh-2024/image-encrypt/src/decrypt';

export interface ImageDecryptionMessage {
  type: 'decrypt';
  imageData: ImageData;
  width: number;
  height: number;
}

export interface ImageDecryptionResult {
  type: 'success' | 'error';
  imageData?: ImageData;
  error?: string;
}

self.onmessage = async (event: MessageEvent<ImageDecryptionMessage>) => {
  try {
    const { imageData, width, height } = event.data;
    
    // OffscreenCanvasを使用（対応している場合）
    if (typeof OffscreenCanvas !== 'undefined') {
      const canvas = new OffscreenCanvas(width, height);
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // ImageDataからCanvasに描画
        ctx.putImageData(imageData, 0, 0);
        
        // 復号化処理
        const sourceImage = await createImageBitmap(imageData);
        
        decrypt({
          exportCanvasContext: ctx,
          sourceImage,
          sourceImageInfo: {
            height,
            width,
          },
        });
        
        // 結果を取得
        const resultImageData = ctx.getImageData(0, 0, width, height);
        
        self.postMessage({
          type: 'success',
          imageData: resultImageData,
        } as ImageDecryptionResult);
      } else {
        throw new Error('Failed to get 2d context');
      }
    } else {
      // OffscreenCanvasが使用できない場合のフォールバック
      throw new Error('OffscreenCanvas not supported');
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    } as ImageDecryptionResult);
  }
};