# 🎬 CV Interactivo - Tania Salvatella
### v6.2.0 (Release Candidate)

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> **Concepto:** Portfolio Inmersivo & Suite de Postproducción Web. 
> No es solo un currículum; es una aplicación web diseñada para "editar", "etalonar" y "componer" la trayectoria profesional de Tania Salvatella.

---

## 📋 Descripción del Proyecto

Este proyecto es una SPA (Single Page Application) que simula el flujo de trabajo de tres entornos estándar de la industria audiovisual (**Adobe Premiere Pro**, **DaVinci Resolve** y **Adobe After Effects**). El usuario interactúa con la experiencia laboral como si fuera material de archivo en una línea de tiempo real.



## 🚀 Funcionalidades Principales

### 1. Sistema Multimodal (The "Workspace" Switcher)
Navegación dinámica que altera el esquema de colores, la disposición de paneles y la lógica de interacción:

* **🟦 Modo Edición (Premiere Style):** Enfoque en montaje y estructura. Timeline multitrack funcional (V1, V2, A1) y monitor dual.
* **🟨 Modo Color (DaVinci Style):** Interfaz oscura con ruedas de color interactivas (Lift, Gamma, Gain) y visualización de historial laboral mediante nodos.
* **🟪 Modo Efectos (After Effects Style):** Línea de tiempo basada en capas con propiedades transformables (Posición, Escala, Opacidad) y keyframes.

### 2. Monitor Interactivo & Visualización
* **Simulación de Señal:** Efectos de *Glitch*, *Pérdida de señal* y *Buffering* programados.
* **Dual Format:** Alternancia instantánea entre formato 16:9 y 9:16 (Adaptabilidad a Social Media).
* **Node Graph Engine:** Motor personalizado `<NodeGraph />` para renderizar la experiencia profesional como un árbol de nodos navegable (Pan & Zoom).

### 3. Experiencia de Usuario (UX)
* **Bilingüismo Total (ES/EN):** Cambio de idioma en tiempo real con persistencia de contexto.
* **Sistema de Exportación:** Modal de "Media Encoder" que simula una cola de renderizado para descargar el CV en PDF o acceder a redes.
* **Atajos de Teclado:** Soporte para navegación profesional (`J`, `K`, `L`, `Espacio`, `F`).

---

## 🛠️ Estructura Técnica

### Tecnologías Core
* **React:** Gestión de estado global y ciclo de vida de componentes.
* **Tailwind CSS:** Diseño responsivo y utilitario.
* **Lucide Icons:** Set de iconos vectoriales para la UI.
* **RequestAnimationFrame:** Sincronización del cabezal de reproducción a 60fps.

### Componentes Clave
| Componente | Función |
| :--- | :--- |
| `App` | Orquestador de estado (activeMode, lang, isPlaying). |
| `NodeGraph` | Renderizado SVG/HTML con curvas de Bézier dinámicas. |
| `Timeline` | Triple renderizado condicional según el software activo. |
| `MediaEncoder` | Gestor de descargas y enlaces externos con barras de progreso. |

---

## ⌨️ Atajos de Teclado (Hotkeys)

| Tecla | Acción |
| :--- | :--- |
| `Espacio` | Play / Pause |
| `J` | Retroceder (Reverse) |
| `K` | Pausa |
| `L` | Avanzar (Forward) |
| `F` | Alternar Formato (16:9 / 9:16) |

---

## 📦 Instalación y Despliegue

Sigue estos pasos para ejecutar el entorno de desarrollo localmente:

1.  **Clonar el repositorio:**
    ```bash
    git clone [https://github.com/tu-usuario/cv-interactivo-tania.git](https://github.com/tu-usuario/cv-interactivo-tania.git)
    ```
2.  **Instalar dependencias:**
    ```bash
    npm install
    ```
3.  **Ejecutar en desarrollo:**
    ```bash
    npm run dev
    ```
4.  **Construir para producción:**
    ```bash
    npm run build
    ```

---

## 🎨 Filosofía de Diseño
El objetivo es la **Gamificación de la Carrera Profesional**. El usuario no lee los datos, los "opera". Se han incluido detalles minuciosos como códigos de tiempo reales, avisos de "Media Offline" y notificaciones con humor ante acciones imposibles.

---

**Autor:** [Tania Salvatella](https://tu-sitio-web.com)  
**Año:** 2026  
*Diseñado y programado con pasión por el código y el píxel.*
