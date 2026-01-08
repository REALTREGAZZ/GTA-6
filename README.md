# GTA City Map - Three.js

Un mapa 3D interactivo de una ciudad al estilo GTA, implementado con Three.js.

![City Preview](public/assets/ct1.jpg)

## 📋 Descripción

Este proyecto carga y renderiza un modelo 3D de una ciudad completa usando Three.js, con controles interactivos para explorar el mapa desde diferentes ángulos. El modelo incluye edificios, calles y otros elementos urbanos con texturas detalladas.

## 🚀 Características

- ✅ Renderizado 3D de ciudad completa con texturas
- ✅ Controles de cámara con mouse (OrbitControls)
- ✅ Controles de teclado WASD para movimiento libre
- ✅ Iluminación realista (ambiental, direccional y hemisférica)
- ✅ Sombras dinámicas
- ✅ Indicador de FPS en tiempo real
- ✅ Barra de carga con progreso
- ✅ Grid de referencia y ejes para debug
- ✅ Responsive (se adapta al tamaño de ventana)

## 🎮 Controles

### Mouse:
- **Click izquierdo + arrastrar**: Rotar la cámara alrededor de la ciudad
- **Click derecho + arrastrar**: Mover (pan) la cámara
- **Rueda del mouse**: Zoom in/out

### Teclado:
- **W**: Mover hacia adelante
- **A**: Mover hacia la izquierda
- **S**: Mover hacia atrás
- **D**: Mover hacia la derecha
- **Espacio**: Subir
- **Shift**: Bajar

## 📦 Instalación

### Prerrequisitos
- Node.js (v16 o superior)
- npm o yarn

### Pasos

1. **Clonar el repositorio** (si aplica):
```bash
git clone <repository-url>
cd threejs-gta-city-map
```

2. **Instalar dependencias**:
```bash
npm install
```

## 🏃‍♂️ Ejecución

### Modo Desarrollo

Para ejecutar el proyecto en modo desarrollo con hot reload:

```bash
npm run dev
```

Esto iniciará un servidor de desarrollo, normalmente en `http://localhost:5173`

### Build para Producción

Para crear una versión optimizada para producción:

```bash
npm run build
```

Los archivos optimizados se generarán en la carpeta `dist/`

### Preview de Producción

Para previsualizar la versión de producción:

```bash
npm run preview
```

## 📁 Estructura del Proyecto

```
threejs-gta-city-map/
├── public/
│   └── assets/
│       ├── City Islands/
│       │   ├── City Islands.obj    # Modelo 3D de la ciudad
│       │   ├── City_Islands.mtl    # Materiales del modelo
│       │   └── Maps/               # Texturas
│       │       ├── dm1.jpg
│       │       ├── sf1c.jpg
│       │       ├── snd2_01.jpg
│       │       └── ... (más texturas)
│       └── ct*.jpg                 # Imágenes de preview
├── src/
│   └── main.js                     # Código principal Three.js
├── index.html                      # Página principal
├── package.json                    # Dependencias y scripts
└── README.md                       # Este archivo
```

## 🛠️ Tecnologías Utilizadas

- **Three.js** (v0.160.0): Librería 3D para WebGL
- **Vite** (v5.0.0): Build tool y dev server
- **OBJLoader**: Para cargar modelos .obj
- **MTLLoader**: Para cargar materiales .mtl
- **OrbitControls**: Para controles de cámara

## 📝 Créditos del Modelo 3D

- **Modelo**: City Islands
- **Creado por**: Herminio Nieves (@2013)
- **Licencia**: Uso comercial y no comercial permitido con créditos apropiados
- **Notas**: Partes no movibles

## 🎯 Características Técnicas

- **Renderer**: WebGL con antialiasing
- **Cámara**: Perspectiva con FOV de 75°
- **Sombras**: PCF Soft Shadows (2048x2048)
- **Niebla**: Fog atmosférica para efecto de distancia
- **Iluminación**:
  - Luz ambiental (0.6 intensidad)
  - Luz direccional con sombras (0.8 intensidad)
  - Luz hemisférica para efecto cielo/suelo (0.4 intensidad)

## 🐛 Solución de Problemas

### El modelo no carga

1. Verifica que la carpeta `public/assets/City Islands/` contenga:
   - `City Islands.obj`
   - `City_Islands.mtl`
   - Carpeta `Maps/` con todas las texturas

2. Abre la consola del navegador (F12) para ver errores específicos

3. Verifica que el servidor esté sirviendo correctamente los archivos estáticos

### Bajo rendimiento (FPS bajos)

- El modelo es bastante detallado. Prueba:
  - Reducir la resolución de sombras en `main.js`
  - Desactivar sombras: `renderer.shadowMap.enabled = false`
  - Reducir la distancia de renderizado ajustando el `far` de la cámara

### Texturas no se ven

- Asegúrate de que todas las imágenes en `Maps/` estén presentes
- Revisa la consola para errores de carga de texturas
- Verifica las rutas en el archivo `City_Islands.mtl`

## 🔧 Personalización

### Cambiar la posición inicial de la cámara

Edita en `src/main.js`:
```javascript
camera.position.set(x, y, z);
```

### Ajustar velocidad de movimiento

Edita en `src/main.js`:
```javascript
const moveSpeed = 50; // Aumenta o disminuye este valor
```

### Cambiar color del cielo

Edita en `src/main.js`:
```javascript
scene.background = new THREE.Color(0x87CEEB); // Formato hexadecimal
```

## 📄 Licencia

Este proyecto está bajo licencia MIT (excepto el modelo 3D que tiene su propia licencia mencionada arriba).

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📧 Contacto

Para preguntas o sugerencias, abre un issue en el repositorio.

---

**¡Disfruta explorando la ciudad! 🏙️**
