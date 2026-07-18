# Asset Strategy - Remotiva

## Overview
This document outlines the asset strategy for the Remotiva freelance marketplace platform.

## Thumbnail Strategy

### Current Implementation
- Gig thumbnails use curated external URLs from Unsplash
- Data layer in `src/data/gigVisuals.js` is easy to swap with backend-driven URLs
- Each category has 3 curated images for variety

### Thumbnail Data Source
```javascript
// src/data/gigVisuals.js
export const categoryThumbnails = {
  'design-logo': [...],
  'ai-creator': [...],
  // ...
}
```

### How Thumbnails are Resolved
1. **By title keywords** - Primary matching strategy
2. **By category slug** - Fallback matching
3. **Default category** - Ultimate fallback

### Adding New Categories
To add a new category:
1. Add thumbnail URLs to `categoryThumbnails` object
2. Add slug mapping to `categorySlugMap`
3. Update `getGigThumbnail()` keyword list if needed

### Future Backend Integration
When backend provides thumbnails:
1. Replace `getGigThumbnail()` with direct `item.image_url`
2. Keep fallback logic for missing images
3. Optionally keep category-based defaults for unsplash URLs

## Image Sources

### Current Sources
| Source | Purpose | License |
|--------|---------|---------|
| Unsplash | Gig thumbnails, hero backgrounds | Free commercial use |

### Image Guidelines
- **Aspect Ratio**: 16:10 for gig thumbnails
- **Size**: 800x500px recommended (Unsplash `?w=800&q=80`)
- **Style**: Professional, clean, relevant to category
- **Quality**: High-quality, no low-res or spam-like images

### Unsplash URL Pattern
```
https://images.unsplash.com/photo-{id}?w=800&q=80
```

## Video Strategy

### Hero Video Configuration
```bash
# .env file
VITE_HERO_VIDEO=/videos/hero.mp4
VITE_HERO_POSTER=/images/hero-poster.jpg
```

### Video Requirements
| Property | Value | Notes |
|----------|-------|-------|
| autoplay | true | Required for autoplay |
| muted | true | Required for autoplay on most browsers |
| loop | true | Continuous playback |
| playsInline | true | Prevents fullscreen on iOS |
| preload | metadata | Fast initial load |

### Video File Recommendations
- **Format**: MP4 (H.264) primary, WebM fallback
- **Resolution**: 1920x1080 (Full HD) or 1280x720 (HD)
- **Duration**: 15-30 seconds (looping)
- **File Size**: <5MB for fast loading
- **Hosting**: CDN recommended for production

### Fallback Strategy
1. If `VITE_HERO_VIDEO` not set → show gradient background
2. If video fails to load → show poster image
3. If poster fails → show gradient background

### Video Hosting Options
1. **Local**: `/public/videos/` - Simple but not optimized
2. **CDN**: Cloudflare, CloudFront, etc. - Production recommended
3. **Video Hosting**: Vimeo, Wistia - With direct URL embedding

## Local Assets

### When to Use Local Assets
- **Logo**: `/public/assets/logo_remotiva.png`
- **Icons**: SVG inline or icon library (Lucide React)
- **Critical UI**: Above-the-fold images

### When NOT to Use Local Assets
- **Gig thumbnails**: Use external URLs for variety
- **Hero backgrounds**: Use external or video
- **Category images**: Use external URLs

### Asset Organization
```
public/
├── assets/
│   ├── logo_remotiva.png
│   └── ...
├── videos/
│   └── hero.mp4 (if using local video)
└── images/
    └── hero-poster.jpg (if using local poster)
```

## Performance Considerations

### Image Optimization
1. Use `loading="lazy"` for below-fold images
2. Use `object-fit: cover` for consistent aspect ratios
3. Provide fallback for failed loads
4. Use srcset for responsive images (future)

### Video Optimization
1. Compress video before upload
2. Use poster image for fast first paint
3. Consider lazy loading video on mobile
4. Use `preload="metadata"` not `"auto"`

## CDN Configuration (Production)

For production deployment:
1. Upload images to CDN (Cloudflare, CloudFront, etc.)
2. Update `gigVisuals.js` URLs to CDN URLs
3. Or use backend to serve image URLs

For video:
1. Upload to CDN with proper cache headers
2. Set long cache TTL for video files
3. Consider using video hosting service for adaptive streaming

## Accessibility

### Image Alt Text
- All images should have descriptive alt text
- Gig thumbnails use service title as alt text

### Video Accessibility
- Hero video should not have essential content (decorative only)
- Ensure sufficient color contrast for overlay text

## Legal Notes

### Image Licensing
- Unsplash images are free for commercial use
- No attribution required (but appreciated)
- Do not use images with recognizable people without consent

### Video Licensing
- Use original video content or properly licensed stock
- Do not embed random copyrighted content
- Consider purchasing stock video licenses for production
