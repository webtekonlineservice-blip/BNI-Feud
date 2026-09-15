# BNI Feud Icons

## Current Status

✅ **favicon.svg** - Working! Modern browsers will use this automatically.

⚠️ **apple-icon.png** - Needs to be generated from the SVG.

## How to Generate PNG Icons

### Option 1: Use favicon-generator.html (Easiest)
1. Open http://localhost:3000/favicon-generator.html in your browser
2. Right-click the 180x180 canvas
3. Save as `apple-icon.png` to the `public/img/` directory

### Option 2: Online Converter
1. Go to https://cloudconvert.com/svg-to-png or https://convertio.co/svg-png/
2. Upload `public/img/favicon.svg`
3. Convert to PNG at 180x180 pixels
4. Save as `public/img/apple-icon.png`

### Option 3: Command Line (if you have ImageMagick)
```bash
convert public/img/favicon.svg -resize 180x180 public/img/apple-icon.png
```

### Option 4: Figma/Sketch/Illustrator
1. Open `public/img/favicon.svg` in your design tool
2. Export as PNG at 180x180 pixels
3. Save as `public/img/apple-icon.png`

## Icon Design

The icon features:
- **Background**: Blue gradient (#0056b3 to #003d80) - BNI brand colors
- **Accent stripe**: Orange gradient (#ff8533 to #ff6a00)
- **Text**: White "BNI" in bold, orange "FEUD" subtitle
- **Style**: Modern, clean, game-show inspired
- **Rounded corners**: 20% radius for app-like feel

## Why SVG is Sufficient

Modern browsers (Chrome, Firefox, Safari, Edge) all support SVG favicons natively. The PNG apple-icon.png is only needed for:
- iOS home screen icons
- Some older browsers
- Better compatibility with bookmark icons

The SVG will automatically scale to any size needed and look crisp on all displays, including Retina/4K screens.
