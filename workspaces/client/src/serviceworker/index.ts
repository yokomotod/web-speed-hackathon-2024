/// <reference types="@types/serviceworker" />

import { transformJpegXLToWebP } from './transformJpegXLToBmp';

self.addEventListener('install', (ev: ExtendableEvent) => {
  ev.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (ev: ExtendableEvent) => {
  ev.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (ev: FetchEvent) => {
  ev.respondWith(onFetch(ev.request));
});

async function onFetch(request: Request): Promise<Response> {
  const res = await fetch(request);

  if (res.headers.get('Content-Type') === 'image/jxl') {
    // If the response is a JPEG XL image, transform it to WebP format.
    // JPEG XL は Chrome ではサポートされていないため、WebP に変換して返す。
    return transformJpegXLToWebP(res);
  } else {
    return res;
  }
}
