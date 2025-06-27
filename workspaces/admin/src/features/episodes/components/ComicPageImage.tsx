import { Image as ChakraImage } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { decrypt } from '@wsh-2024/image-encrypt/src/decrypt';

import { getImageUrl } from '../../../lib/image/getImageUrl';
import { useImageDecryption } from '../../../lib/hooks/useImageDecryption';

type Props = {
  pageImageId: string;
};

export const ComicPageImage: React.FC<Props> = ({ pageImageId }) => {
  const { decryptImage, isWorkerAvailable } = useImageDecryption();
  
  const { data: blob } = useQuery({
    queryFn: async ({ queryKey: [, { pageImageId }] }) => {
      const image = new Image();
      image.src = getImageUrl({
        format: 'jxl',
        imageId: pageImageId,
      });
      await image.decode();

      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const ctx = canvas.getContext('2d')!;

      if (isWorkerAvailable) {
        try {
          // Web Workerを使用した非同期復号化
          ctx.drawImage(image, 0, 0);
          const imageData = ctx.getImageData(0, 0, image.naturalWidth, image.naturalHeight);
          const decryptedImageData = await decryptImage(imageData, image.naturalWidth, image.naturalHeight);
          ctx.putImageData(decryptedImageData, 0, 0);
        } catch (error) {
          console.warn('Worker decryption failed, falling back to main thread:', error);
          // フォールバック: メインスレッドで処理
          decrypt({
            exportCanvasContext: ctx,
            sourceImage: image,
            sourceImageInfo: {
              height: image.naturalHeight,
              width: image.naturalWidth,
            },
          });
        }
      } else {
        // Web Workerが使用できない場合はメインスレッドで処理
        decrypt({
          exportCanvasContext: ctx,
          sourceImage: image,
          sourceImageInfo: {
            height: image.naturalHeight,
            width: image.naturalWidth,
          },
        });
      }

      return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
    },
    queryKey: ['ComicPageImage', { pageImageId }] as const,
    // 画像は長期間キャッシュ（1時間）
    staleTime: 60 * 60 * 1000,
    // ガベージコレクション時間も長く（2時間）
    gcTime: 2 * 60 * 60 * 1000,
    refetchInterval: false,
    refetchIntervalInBackground: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  const [blobUrl, updateBlobUrl] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (blob == null) return;
    const blobUrl = URL.createObjectURL(blob);
    updateBlobUrl(blobUrl);
    return () => URL.revokeObjectURL(blobUrl);
  }, [blob]);

  return (
    <ChakraImage alt={blobUrl != null ? pageImageId : ''} height={304} objectFit="cover" src={blobUrl} width={216} />
  );
};
