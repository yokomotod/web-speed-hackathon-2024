import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import { decrypt } from '@wsh-2024/image-encrypt/src/decrypt';

import { getImageUrl } from '../../../lib/image/getImageUrl';

const _Canvas = styled.canvas`
  height: 100%;
  width: auto;
  flex-grow: 0;
  flex-shrink: 0;
`;

type Props = {
  pageImageId: string;
};

export const ComicViewerPage = ({ pageImageId }: Props) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDecrypted, setIsDecrypted] = useState(false);

  // Intersection Observer for lazy decryption
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isDecrypted) {
            setIsVisible(true);
          }
        });
      },
      {
        rootMargin: '50px', // Start decryption 50px before entering viewport
        threshold: 0.1,
      }
    );

    observer.observe(canvas);

    return () => {
      observer.disconnect();
    };
  }, [isDecrypted]);

  // Decrypt only when visible
  useEffect(() => {
    if (!isVisible || isDecrypted) return;

    const decryptImage = async () => {
      const image = new Image();
      image.src = getImageUrl({
        format: 'jxl',
        imageId: pageImageId,
      });
      await image.decode();

      const canvas = ref.current!;
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const ctx = canvas.getContext('2d')!;

      decrypt({
        exportCanvasContext: ctx,
        sourceImage: image,
        sourceImageInfo: {
          height: image.naturalHeight,
          width: image.naturalWidth,
        },
      });

      canvas.setAttribute('role', 'img');
      setIsDecrypted(true);
    };

    decryptImage().catch(console.error);
  }, [isVisible, isDecrypted, pageImageId]);

  return <_Canvas ref={ref} />;
};
