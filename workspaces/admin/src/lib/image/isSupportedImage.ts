const SUPPORTED_MIME_TYPE_LIST = ['image/bmp', 'image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/jxl'];

export async function isSupportedImage(image: File): Promise<boolean> {
  if (SUPPORTED_MIME_TYPE_LIST.includes(image.type)) {
    return true;
  }
  return false;
}
