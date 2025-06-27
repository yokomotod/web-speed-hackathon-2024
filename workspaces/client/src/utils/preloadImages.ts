import path from 'path-browserify';

async function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export async function preloadImages() {
  if (process.env['PATH_LIST'] == null) {
    return;
  }

  const imagePathList: string[] = process.env['PATH_LIST'].split(',').filter((imagePath) => {
    const extension = path.parse(imagePath).ext.toLowerCase();
    return ['.bmp', '.jpg', '.jpeg', '.gif', '.png', '.webp', '.avif'].includes(extension);
  });

  // Preload only first 5 images with high priority, rest with low priority
  const highPriorityImages = imagePathList.slice(0, 5);
  const lowPriorityImages = imagePathList.slice(5);

  const prefetchHighPriority = Promise.all(
    highPriorityImages.map((imagePath) => {
      return new Promise((resolve) => {
        const link = document.createElement('link');

        Object.assign(link, {
          as: 'image',
          crossOrigin: 'anonymous',
          fetchPriority: 'high',
          href: imagePath,
          onerror: resolve,
          onload: resolve,
          rel: 'preload',
        });
        document.head.appendChild(link);
      });
    }),
  );

  // Load low priority images after a delay
  setTimeout(() => {
    lowPriorityImages.forEach((imagePath) => {
      const link = document.createElement('link');
      Object.assign(link, {
        as: 'image',
        crossOrigin: 'anonymous',
        fetchPriority: 'low',
        href: imagePath,
        rel: 'preload',
      });
      document.head.appendChild(link);
    });
  }, 1000);

  await Promise.race([prefetchHighPriority, wait(2000)]);
}
