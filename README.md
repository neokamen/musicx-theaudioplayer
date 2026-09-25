# musicx - the audio player 🎵🔊

> **Reproductor de audio Hi-Fi local y en red para Linux**, diseñado con una arquitectura modular bit-perfect inspirada en *fooyin* y *foobar2000*, construido sobre **Tauri v2**, **Rust** y **React 19**.

[![Rust](https://img.shields.io/badge/Rust-2021-DEA584?logo=rust&logoColor=white)](https://www.rust-lang.org/)
[![Tauri v2](https://img.shields.io/badge/Tauri-v2-24C8DB?logo=tauri&logoColor=white)](https://tauri.app/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-Custom_Hi--Fi-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🌟 Características Principales

### 🎧 Motor de Audio Nativo Hi-Fi (Rust Core)
* **Decodificación de Alta Fidelidad**: Decodificación de PCM directo mediante `symphonia` con soporte para **FLAC** (hasta 24-bit / 192 kHz), **WAV**, **MP3**, **ALAC**, **AAC** y **OGG/Vorbis**.
* **Modo Bit-Perfect Exclusivo**: Acceso directo al hardware mediante ALSA (`hw:X,Y`) eludiendo el remuestreo y mezclas por software del sistema operativo.
* **Soporte PipeWire / ALSA Compartido**: Alternancia fluida entre salida de estudio exclusiva y salida compartida estándar.
* **Reproducción Sin Pausas (*Gapless Playback*)**: Búfer continuo de audio gestionado en un hilo de audio prioritario dedicado (`musicx-audio-core`).
* **Telemetría Dinámica en Tiempo Real**: Frecuencia de muestreo real, bits por muestra, bitrate variable dinámico y medición milimétrica de latencia ultra-baja (< 5 ms).

### ⚡ Base de Datos e Indexación Incremental
* **SQLite con WAL Mode**: Base de datos local optimizada con `PRAGMA journal_mode = WAL;` y sincronización `NORMAL`.
* **Escaneo Multihilo con `jwalk`**: Indexador que compara marcas de tiempo (`mtime`) en disco para saltar archivos sin modificar, analizando bibliotecas masivas en segundos.
* **Emisión Reactiva de Progreso**: Eventos Tauri `scan-progress` que reportan el avance exacto en tiempo real al frontend.

### 🗂️ Explorador de Archivos Lazy (Estilo Dolphin)
* **Optimizado para Red (NFS / SSHFS / SMB)**: Lee únicamente el contenido directo mediante `std::fs::read_dir` sin parsear tags pesados hasta que se solicita, garantizando navegación fluida en unidades remotas.
* **Breadcrumbs Clicables e Interactivos**: Navegación directa por carpetas (`/ HOME / USUARIO / MUSICA /`) y edición manual de ruta.

### 🎛️ Interfaz Modular y Personalizable (Filosofía Fooyin / Foobar2000)
* **Sistema de Paneles Redimensionables**: Basado en `react-resizable-panels`, totalmente serializable en JSON y guardado en `localStorage`.
* **Modo Edición ("Editar Interfaz")**:
  * Dividir paneles en columnas horizontales o filas verticales.
  * Eliminar paneles y reorganizar el espacio.
  * Cambiar widgets en caliente (Explorador de carpetas, Lista de canciones virtualizada, Inspector/Carátula, Telemetría DAC, Cola Gapless).
* **Lista Virtualizada a 60+ FPS**: Renderizado mediante `@tanstack/react-virtual`, capaz de desplazarse suavemente por catálogos de **más de 50.000 pistas** con ordenación por columnas y menú contextual.

### 🐧 Integración D-Bus / Linux
* **Soporte MPRIS v2**: Servicio `org.mpris.MediaPlayer2.musicx` que expone controles de teclado multimedia, carátulas y estado del reproductor al entorno de escritorio (GNOME, KDE Plasma, etc.).

---

## 🛠️ Requisitos Previos (Linux / Fedora / Debian / Arch)

### Dependencias de Sistema (Ejemplo Fedora):
```bash
sudo dnf install -y alsa-lib-devel openssl-devel dbus-devel glib2-devel gtk3-devel webkit2gtk4.1-devel
```

### Entorno de Desarrollo:
* **Node.js** (v18 o superior) y **npm**
* **Rust** y **Cargo** (1.75+)

---

## 🚀 Instalación y Puesta en Marcha

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/TU_USUARIO/musicx-theaudioplayer.git
   cd musicx-theaudioplayer
   ```

2. **Instalar dependencias del frontend:**
   ```bash
   npm install
   ```

3. **Iniciar en modo desarrollo:**
   ```bash
   npm run tauri dev
   ```

4. **Compilar binario de producción:**
   ```bash
   npm run tauri build
   ```
   *El binario ejecutable y paquetes para Linux (.rpm / .deb / AppImage) se generarán en `src-tauri/target/release/bundle/`.*

---

## 📂 Estructura del Proyecto

```text
musicx-theaudioplayer/
├── src/                          # Frontend (React 19 + TypeScript + Tailwind)
│   ├── components/
│   │   ├── layout/               # LayoutManager, LayoutNodeRenderer y presets
│   │   ├── player/               # HiFiPlayerBar (Transporte & Telemetría DAC)
│   │   └── widgets/              # FolderExplorer, VirtualTrackList, Inspector, DacTelemetry, Queue
│   ├── services/                 # Servicios IPC tipados de Tauri v2 (invoke & listen)
│   ├── store/                    # Estado global reactivo con Zustand
│   └── types/                    # Modelos TypeScript estrictos (Track, Telemetry, FileNode)
├── src-tauri/                    # Backend (Rust Core)
│   ├── src/
│   │   ├── audio.rs              # Motor de audio bit-perfect (Symphonia + CPAL + Gapless)
│   │   ├── db.rs                 # SQLite WAL y escáner incremental multihilo (jwalk)
│   │   ├── fs_lazy.rs            # Explorador lazy optimizado para NFS/SSHFS
│   │   ├── mpris.rs              # Integración D-Bus MPRIS para Linux
│   │   ├── commands.rs           # Comandos Tauri invocables
│   │   └── lib.rs                # Inicialización, estado y bucle de telemetría
│   └── Cargo.toml                # Dependencias nativas en Rust
└── package.json                  # Scripts y dependencias frontend
```

---

## 📄 Licencia

Distribuido bajo la Licencia **MIT**. Consulta el archivo `LICENSE` para más detalles.
