# BLESSED • Sistema de Gestión de Inventario, Compra y Venta de Ropa
### Instituto Universitario Jesús Obrero (IUJO)
**Carrera:** Informática  
**Asignatura:** Análisis y Diseño de Sistemas (ADS-433) — Semestre IV  
**Facilitador:** Prof. Eduardo Nieves  
**Lapso Académico:** 2-2026  

---

## 📌 1. Información General del Sistema

**BLESSED** es una plataforma web integral diseñada para la optimización y control del flujo de compra y venta de prendas de vestir, calzado y accesorios de moda urbana y contemporánea. El sistema permite gestionar en tiempo real el catálogo de productos (stock físico, tallas, colores, precios de compra y venta al mayor y detal), las entradas de mercancía de proveedores, el registro de pedidos de clientes y la trazabilidad de operaciones comerciales.

### Propósito y Alcance del Negocio:
* **Control de Stock y Catálogo:** Visualización flexible en tarjetas ilustradas (*Cards*) para catálogo visual y en *Tablas de Datos* para auditoría densa de inventario con alertas de stock mínimo.
* **Módulo de Compras y Ventas:** Registro de órdenes, control de costos, precios sugeridos y cálculo de ganancias.
* **Acceso y Roles:** Autenticación de administradores de almacén y registro público de clientes compradores.
* **Toma de Decisiones:** Tablero ejecutivo (*Dashboard*) con 4 indicadores de rendimiento clave (KPIs) en tiempo real.

---

## 👥 2. Ficha Técnica del Equipo de Desarrollo

| Nombre y Apellido | Cédula de Identidad | Rol en el Proyecto |
| :--- | :---: | :--- |
| **Jhonmel López** | V-30.845.049 | Desarrollador Frontend / Arquitectura UI |
| **Genderson Piñango** | *V-[Por definir]* | Analista de Sistemas / Maquetación Web |
| **Williangel Mora** | *V-[Por definir]* | Diseñador UX/UI / Control de Calidad |

---

## 🛠️ 3. Stack Tecnológico Frontend Empleado

* **HTML5 Semántico:** Estructura modular y accesible (`<header>`, `<nav>`, `<aside>`, `<main>`, `<section>`, `<table>`, `<footer>`).
* **CSS3 Moderno (Vanilla CSS):** Arquitectura de diseño con variables globales `:root`, diseño responsivo mediante *CSS Flexbox* y *CSS Grid*, transiciones suaves y estética *glassmorphism* con efectos *backdrop-filter*.
* **JavaScript ES6+ (Ligero):** Interactividad nativa sin dependencias pesadas (control de modales, alertas toast con contador en tiempo real, menú lateral hamburguesa y filtrado instantáneo).
* **Tipografía Oficial Google Fonts:**
  * **Títulos y Display:** `Montserrat` (Bold 700 / ExtraBold 800, espaciado ajustado `-0.02em`).
  * **Cuerpo y Tablas:** `Inter` (Regular 400 / SemiBold 600).
* **Iconografía:** SVGs vectoriales integrados de alta nitidez sin librerías externas que causen dependencias rotas.

---

## 🎨 4. Paleta Oficial Institucional Implementada (`:root`)

| Variable CSS | Código HEX | Nombre Tonal | Uso Semántico en BLESSED |
| :--- | :---: | :--- | :--- |
| `--brand-dark` | `#0b0a08` | Obsidian Black | Fondos oscuros, sidebar y texto principal |
| `--brand-primary` | `#be0b11` | Ruby Crimson | Botón primario de acción, badges destacados |
| `--brand-hover` | `#9b0c0f` | Deep Crimson | Estado `:hover` en botones y cabeceras de tabla |
| `--brand-wine` | `#790d0d` | Dark Wine | Bordes de acento, estado `:active` |
| `--brand-maroon` | `#570e0b` | Deep Maroon | Gradientes hero y fondos envolventes |

---

## 📂 5. Arquitectura del Repositorio (~7 Archivos Web)

```text
├── README.md               # Documentación formal e institucional del proyecto
├── sistema_diseno.html     # Living Style Guide (Documentación del Sistema de Diseño)
├── login.html              # Pantalla de Inicio de Sesión
├── registro.html           # Pantalla de Registro de Cuenta Pública
├── dashboard.html          # Panel Principal con KPIs y Menú Lateral
├── crud.html               # Módulo CRUD de Ropa (Cards + Tabla + Modales)
├── styles.css              # Hoja de estilos global, variables :root y Media Queries
└── script.js               # Lógica interactiva de Modales, Toasts y Responsive
```

---

## 📱 6. Criterios de Adaptabilidad Responsiva (Auditoría F12)

El sistema fue diseñado y verificado para cumplir con **cero desbordamiento horizontal** en resoluciones desde **375px** (smartphones como iPhone SE / Android) hasta **1920px** (pantallas de escritorio):
1. **Menú Hamburguesa (☰):** En pantallas `< 768px`, el *Sidebar* lateral se oculta automáticamente y se activa con el botón de hamburguesa flotante/navbar.
2. **Modal Adaptativo:** Ocupa entre 92% y 95% del ancho de pantalla en móviles, pasando sus formularios a 1 sola columna vertical con botones accesibles al pulgar.
3. **Fluidos y Tablas Seguras:** La vista de tabla implementa `overflow-x: auto` con deslizamiento táctil, y el catálogo de ropa se apila limpiamente a 1 columna.
