# Guía de Inicio Rápido

## 🚀 Comenzar en 3 pasos

### 1. Instalar dependencias
```bash
npm install
```

### 2. Iniciar el servidor de desarrollo
```bash
npm run dev
```

### 3. Abrir en el navegador
El servidor se abrirá automáticamente en `http://localhost:5173`

¡Eso es todo! Ahora deberías ver la ciudad 3D cargándose en tu navegador.

## 📝 Notas

- **Primera carga**: El modelo puede tardar unos segundos en cargar (es un archivo grande ~10MB)
- **Rendimiento**: Si experimentas FPS bajos, puedes:
  - Cerrar otras pestañas del navegador
  - Desactivar sombras en `src/main.js` (línea: `renderer.shadowMap.enabled = false`)
  
## 🎮 Controles Rápidos

- **Mouse**: Click izquierdo + arrastrar para rotar
- **WASD**: Movimiento básico
- **Espacio/Shift**: Subir/Bajar

## 🐛 Problemas Comunes

**No se carga el modelo:**
- Verifica que la carpeta `public/assets/City Islands/` exista
- Revisa la consola del navegador (F12) para ver errores

**Puerto 5173 ocupado:**
```bash
npm run dev -- --port 3000
```

Para más información detallada, consulta el [README.md](README.md)
