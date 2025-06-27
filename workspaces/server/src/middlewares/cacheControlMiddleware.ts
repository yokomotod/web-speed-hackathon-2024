import { createMiddleware } from 'hono/factory';

export const cacheControlMiddleware = createMiddleware(async (c, next) => {
  await next();
  
  const path = c.req.path;
  
  // Static assets (images, css, js) - long term cache
  if (path.match(/\.(jpg|jpeg|png|gif|webp|avif|jxl|css|js|woff|woff2|ttf|eot|svg)$/i)) {
    c.res.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }
  // API responses - short term cache
  else if (path.startsWith('/api/')) {
    c.res.headers.set('Cache-Control', 'public, max-age=300');
  }
  // HTML pages - no cache for dynamic content
  else {
    c.res.headers.set('Cache-Control', 'no-cache');
  }
});
