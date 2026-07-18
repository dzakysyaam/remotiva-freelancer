# UI Home Update Notes

## Overview
This document tracks updates to the Remotiva homepage and gig card components.

## Changes Made

### 1. Gig Card Thumbnails
- **Before**: Used local asset files like `/assets/frame-81.jpg`
- **After**: Uses curated external Unsplash URLs via `src/data/gigVisuals.js`

**Thumbnail Categories:**
| Category | Example Keywords | Visual Theme |
|----------|-----------------|--------------|
| Design/Logo | logo, design, brand, graphic | Clean branding mockups |
| AI Creator | ai, artificial, chatgpt, generative | AI/creative workflow visuals |
| Animation | animasi, motion, after effect | Motion graphics stills |
| Programming | website, web, app, code, development | Developer workspace |
| Digital Marketing | marketing, seo, ads, social media | Dashboard/campaign |
| Writing | writing, copy, content, article | Editorial/writing desk |
| Video Editing | video, editing, premiere | Production stills |
| Data Analytics | data, analytics, chart, excel | BI dashboard |

### 2. Gig Card Visual Improvements
- **Card Radius**: 18px → 16px (cleaner look)
- **Hover Transform**: 3px → 6px lift
- **Shadow on Hover**: Enhanced to 20px 50px with 0.12 opacity
- **Image Scale on Hover**: 1.04 → 1.06
- **Save Button**:
  - Size: 44px → 48px
  - Backdrop blur: 4px → 8px
  - Entrance animation: Added rotation effect
  - Hover color: Now uses #e74c3c (red heart)
  - Always visible when saved

### 3. Search Button
- **Color**: Confirmed #2D76FF (primary brand color)
- **Border Radius**: 4px → 6px
- **Hover Effect**: Added translateY(-1px) lift

### 4. Scrollbar
- **Width**: 8px → 6px (slimmer)
- **Thumb Opacity**: 0.35 → 0.3 (subtler)

### 5. Hero Video Section (New)
**Component**: `src/components/home/HeroVideoSection.jsx`

**Features:**
- Optional HTML5 `<video>` with autoplay/muted/loop/playsInline
- Configurable via env vars: `VITE_HERO_VIDEO`, `VITE_HERO_POSTER`
- Dark gradient fallback if no video
- Overlay for text readability
- Search form with glassmorphism effect
- Quick category pills
- "Trusted by" section placeholder

**Configuration:**
```bash
# In .env
VITE_HERO_VIDEO=/videos/hero.mp4
VITE_HERO_POSTER=/images/hero-poster.jpg
```

## Files Modified
- `frontend/src/pages/Home.jsx` - Added HeroVideoSection
- `frontend/src/components/marketplace/ServiceCard.jsx` - Updated thumbnail logic
- `frontend/src/components/home/HeroVideoSection.jsx` - NEW
- `frontend/src/data/gigVisuals.js` - NEW
- `frontend/src/styles.css` - Visual refinements

## Testing Checklist
- [ ] Gig cards display category-appropriate thumbnails
- [ ] Thumbnails fallback works on image error
- [ ] Save button is larger and visible
- [ ] Heart icon turns red on hover/save
- [ ] Search button uses #2D76FF
- [ ] Scrollbar is slim and clean
- [ ] Hero video plays (if configured)
- [ ] Hero fallback gradient displays (if no video)
- [ ] Mobile responsive works correctly
- [ ] Build passes

## Known Issues
None reported.
