# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2024-01-08

### Added
- Initial Three.js project setup with Vite
- 3D city map loading system (OBJ + MTL format)
- OrbitControls for mouse-based camera manipulation
- WASD + Space/Shift keyboard controls for free camera movement
- Triple lighting system (ambient, directional, hemisphere)
- Dynamic shadow mapping (PCF Soft Shadows)
- Atmospheric fog effect
- Real-time FPS counter
- Loading screen with progress bar
- Responsive canvas (fullscreen)
- Automatic model centering and camera positioning
- Grid helper and axes helper for debugging
- Complete documentation (README.md, QUICKSTART.md)
- Project configuration files (vite.config.js, .gitignore)

### Assets
- Extracted and organized City Islands 3D model
- 19 texture files in JPG format
- 5 preview images
- Material definitions (MTL file)

### Features
- Real-time 3D rendering with WebGL
- Interactive camera controls
- Shadow casting and receiving
- Texture mapping
- Automatic asset loading with progress feedback
- HiDPI/Retina display support
- Window resize handling

### Technical Details
- Three.js v0.160.0
- Vite v5.0.0
- ES6 modules
- Production build optimization
- Bundle size: ~496 KB (127 KB gzipped)
