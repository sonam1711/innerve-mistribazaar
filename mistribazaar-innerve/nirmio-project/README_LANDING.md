# MistriBazaar Landing Page

A modern landing page built with React, TypeScript, Vite, and Tailwind CSS featuring a warm earthy color scheme and smooth animations.

## Features

- 🎨 Beautiful gradient background with grid overlay
- 🔄 Dynamic service text rotation
- 🌐 Multi-language support dropdown
- 📱 Fully responsive design
- ⚡ Fast development with Vite
- 🎭 Smooth animations and transitions
- 🖼️ Animated image grid

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
nirmio-project/
├── src/
│   ├── components/
│   │   ├── Background.tsx    # Grid and radial gradient background
│   │   ├── Header.tsx        # Navigation header with language dropdown
│   │   └── Hero.tsx          # Main hero section with search
│   ├── App.tsx               # Main app component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── public/
│   ├── logo.png             # Logo image (add your own)
│   └── worker1.png          # Worker image (add your own)
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── tsconfig.json
```

## Technologies Used

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library

## Customization

### Colors

Edit the CSS variables in [src/index.css](src/index.css):

```css
:root {
  --bg-dark: #1a120b;
  --grid-color: rgba(251, 191, 36, 0.07);
  --glow-center: rgba(120, 66, 18, 0.4);
  --accent-yellow: #f59e0b;
}
```

### Services

Update the services array in [src/components/Hero.tsx](src/components/Hero.tsx):

```typescript
const services = ['Electrician', 'Plumber', 'Carpenter', 'Painter', 'White Washer']
```

### Languages

Modify the languages array in [src/components/Header.tsx](src/components/Header.tsx):

```typescript
const languages = [
  { code: 'EN', name: 'English' },
  { code: 'HI', name: 'हिन्दी' },
  // Add more languages...
]
```

## Images

Place your images in the `public` folder:
- `logo.png` - Your company logo
- `worker1.png` - Worker/service provider image

## License

MIT
