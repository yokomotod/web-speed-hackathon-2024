import { useMemo } from 'react';

import { getImageUrl } from '../../lib/image/getImageUrl';

// Cache for processed images
const imageCache = new Map<string, string>();

export const useImage = ({ height, imageId, width }: { height: number; imageId: string; width: number }) => {
  return useMemo(() => {
    const dpr = window.devicePixelRatio;
    
    return getImageUrl({
      format: 'jpg',
      height: height * dpr,
      imageId,
      width: width * dpr,
    });
  }, [height, imageId, width]);
};
