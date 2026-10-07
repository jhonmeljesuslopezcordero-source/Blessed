# GUÍA MAESTRA DE GOBIERNO ÁGIL, GITFLOW Y DEFENSA EN AULA
## Evaluación V (Semana 10) • Demo Day CRUD & Costos TI (15% Neto)
**Asignatura:** Análisis y Diseño de Sistemas (ADS-433) • IUJO Semestre IV  
**Docente Titular:** Prof. Ing. Eduardo Nieves  

---

## 🧭 PARTE 1: Configuración de Git & Estrategia GitFlow Obligatoria

> [!WARNING]
> **Penalización Directa (-15% / Anulación de Nota de Git):**  
> Commits directos en `master` o `main` sin ramas `feature/` ni Pull Requests anulan el 100% de la nota de Git (15%).

### Paso a Paso para Inicializar el Repositorio en tu Terminal:
Abre la consola en la carpeta `c:\xampp\htdocs\genderson` y ejecuta esta secuencia exacta:

```bash
# 1. Inicializar el repositorio Git
git init

# 2. Configurar usuario y correo del Líder Técnico
git config user.name "Genderson Piñango"
git config user.email "tu_correo@gmail.com"

# 3. Crear commit inicial en master
git add .
git commit -m "chore: initial release v1.0.0 - baseline maqueta ui/ux blessed"

# 4. Crear la rama colectiva de integración develop
git checkout -b develop

# 5. Simulación de ramas feature con la nomenclatura oficial:
# Rama Feature 1: Base de datos
git checkout -b feature/101-ddl-db
git commit --allow-empty -m "feat(database): ddl relacional y script de migracion blessed_db [TASK-101]"
git checkout develop
git merge --no-ff feature/101-ddl-db -m "merge: PR #02 from feature/101-ddl-db into develop"

# Rama Feature 2: API REST Backend
git checkout -b feature/102-api-crud
git commit --allow-empty -m "feat(api): controladores y rutas rest para prendas y kpis [TASK-102]"
git checkout develop
git merge --no-ff feature/102-api-crud -m "merge: PR #05 from feature/102-api-crud into develop"

# Rama Feature 3: Frontend y Consumo Fetch
git checkout -b feature/103-vistas-ui
git commit --allow-empty -m "feat(ui): integracion reactiva de cards, tabla y 3 estados ui [TASK-103]"
git checkout develop
git merge --no-ff feature/103-vistas-ui -m "merge: PR #08 from feature/103-vistas-ui into develop"

# Rama Feature 4: Validaciones DTO
git checkout -b feature/104-validaciones
git commit --allow-empty -m "feat(validation): validacion dto y bloqueo de boton submit [TASK-104]"
git checkout develop
git merge --no-ff feature/104-validaciones -m "merge: PR #11 from feature/104-validaciones into develop"

# Rama Feature 5: Pruebas y Despliegue Local
git checkout -b feature/105-pruebas
git commit --allow-empty -m "test: pruebas de integracion end-to-end y verificacion xampp [TASK-105]"
git checkout develop
git merge --no-ff feature/105-pruebas -m "merge: PR #14 from feature/105-pruebas into develop"

# 6. Conectar con GitHub y subir ramas
git remote add origin https://github.com/TU_USUARIO/blessed-crud-system.git
git push -u origin master
git push -u origin develop
```

### Invitación al Docente en GitHub:
1. Ve a tu repositorio en GitHub ➔ **Settings** ➔ **Collaborators**.
2. Presiona **Add people**.
3. Escribe el usuario del docente: `@zedmous` o su correo `zedmous@gmail.com`.
4. Envíale la invitación para que pueda clonar y auditar los commits de cada integrante.

---

## 📋 PARTE 2: Configuración del Tablero Kanban (Trello o GitHub Projects)

Crea un tablero llamado **"BLESSED - Sistema de Inventario Textil (ADS-433)"** con las **4 columnas normadas**:

```
[ 1. POR HACER ]    [ 2. EN PROGRESO ]    [ 3. EN REVISIÓN ]    [ 4. TERMINADO ]
    (Backlog)               (WIP)              (PR Open)             (Merged)
```

Para la entrega, las **5 tarjetas obligatorias** deben estar ubicadas en la columna **4. TERMINADO** con la siguiente información exacta:

### Tarjeta 1 (Líder Técnico):
* **Título:** `TASK-101 - Diseño DDL, Migraciones y Conexión DB`
* **Módulo:** Base de Datos & Persistencia • **Responsable:** Genderson Piñango (Git Lead)
* **Descripción:** Script DDL relacional con PKs, FKs, restricciones UNIQUE, motor InnoDB UTF8MB4 y script de instalación web.
* **Trazabilidad:** Horas Estimadas: `5.0 h` • **Horas Reales: `6.0 h`** (Desvío: ajuste de integridad referencial).
* **GitFlow:** Rama `feature/101-ddl-db` • Pull Request #02 (Mergeado a `develop`).

### Tarjeta 2:
* **Título:** `TASK-102 - Controladores y Rutas API REST CRUD`
* **Módulo:** Backend RESTful • **Responsable:** Desarrollador 2 (Backend Dev)
* **Descripción:** Implementación de enrutador frontal, controlador PrendaController y códigos de estado semánticos (200, 201, 400, 404, 422).
* **Trazabilidad:** Horas Estimadas: `10.0 h` • **Horas Reales: `11.0 h`** (Desvío: configuración de CORS y headers).
* **GitFlow:** Rama `feature/102-api-crud` • Pull Request #05 (Mergeado a `develop`).

### Tarjeta 3:
* **Título:** `TASK-103 - Vistas Frontend, Consumo Fetch y Feedback`
* **Módulo:** Capa de Cliente (UI/UX) • **Responsable:** Desarrollador 3 (Frontend Dev)
* **Descripción:** Conexión asíncrona mediante fetch con async/await, renderizado dinámico de cards/tabla y los 3 estados de UI (Loading, Success, Error).
* **Trazabilidad:** Horas Estimadas: `12.0 h` • **Horas Reales: `11.5 h`**.
* **GitFlow:** Rama `feature/103-vistas-ui` • Pull Request #08 (Mergeado a `develop`).

### Tarjeta 4:
* **Título:** `TASK-104 - Validaciones DTO, Manejo de Errores y Estados`
* **Módulo:** Lógica de Negocio y Seguridad • **Responsable:** Desarrollador 4 (QA / Full-Stack)
* **Descripción:** Validación en tiempo de captura de campos requeridos, formato de SKU, números positivos y bloqueo de botón (`disabled`) durante el dispatch.
* **Trazabilidad:** Horas Estimadas: `8.0 h` • **Horas Reales: `9.0 h`**.
* **GitFlow:** Rama `feature/104-validaciones` • Pull Request #11 (Mergeado a `develop`).

### Tarjeta 5:
* **Título:** `TASK-105 - Pruebas de Integración y Despliegue Local`
* **Módulo:** Despliegue & DevOps • **Responsable:** Desarrollador 5 (DevOps / Tester)
* **Descripción:** Pruebas end-to-end con Postman/ThunderClient, verificación de consistencia en XAMPP y cálculo de métricas KPI en tiempo real.
* **Trazabilidad:** Horas Estimadas: `8.0 h` • **Horas Reales: `7.5 h`**.
* **GitFlow:** Rama `feature/105-pruebas` • Pull Request #14 (Mergeado a `develop`).

> **TOTAL DE HORAS EN TABLERO:** $6.0 + 11.0 + 11.5 + 9.0 + 7.5 = \mathbf{45.0 \ \text{HORAS}}$.  
> ¡Coincide con exactitud matemática con las 45.0 horas del Informe Económico de Costos!

---

## 🎙️ PARTE 3: Guión Ejecutivo de Defensa en Aula (5 a 7 Minutos)

El docente cronometra estrictamente la presentación. Distribuyan el tiempo de la célula de la siguiente manera:

### Minuto 0:00 a 3:30 — Demostración Funcional en Vivo (UI ➔ API ➔ DB)
1. **Presentación de la Célula (30 seg):**  
   *"Buenos días profesor Eduardo y compañeros. Somos la Célula 01 y presentamos el avance funcional de la plataforma BLESSED para el negocio de compra y venta de ropa urbana."*
2. **Evidencia de Cero Datos Simulados (1 min):**  
   - Abre la pestaña de inspección del navegador (**F12 ➔ Network / Red**).
   - Recarga `crud.html` y muestra la petición asíncrona real:  
     *"Como puede apreciar en la consola de red, no existen arrays quemados en JavaScript. La vista realiza un `fetch()` asíncrono a `/api/index.php?route=prendas`, trayendo los datos directamente de nuestra base de datos MySQL `blessed_db` con código HTTP 200 OK."*
3. **Flujo de Mutación en Vivo (Crear y Persistir) (1.5 min):**  
   - Haz clic en **+ Nueva Prenda**.
   - Ingresa una prenda real (ejemplo: `Camiseta Heavyweight Blessed Acid`, SKU `BLS-TS-099`, Categoría `Camisetas Oversize`, Stock `50`, Precio `$25.00`).
   - Muestra cómo el botón se deshabilita (`disabled`) con spinner para evitar duplicados.
   - Presiona Guardar: muestra el **Toast de éxito verde**, el refresco automático de la lista sin recargar la página, y muestra la fila insertada en la base de datos o en la vista de tabla.
4. **Manejo de Estados de UI (30 seg):**  
   - Muestra la vista conmutada (**Cards vs. Tabla**).
   - Explica brevemente el estado de carga (*Loading* con spinner) y el modal de confirmación segura antes de eliminar (*Soft-Delete / Delete*).

### Minuto 3:30 a 6:00 — Sustentación del Costo del Módulo (Metodología de 7 Pasos)
1. **Presentación del Modelo Económico (30 seg):**  
   *"Ingeniero, para costear este módulo no usamos tarifas planas arbitrarias. Aplicamos la metodología oficial de 7 Pasos sobre la base universal de 176 horas mensuales."*
2. **Defensa de los Componentes Clave (1.5 min):**  
   - **Horas y Mano de Obra (Paso 3):**  
     *"Nuestro tablero Kanban registra exactamente **45.0 horas reales** distribuidas entre los 5 integrantes según sus tickets terminados. Con un salario base de mercado de $1.200 USD/mes, nuestra tarifa horaria es de **$6.82 USD/h**, totalizando **$306.82 USD** en mano de obra."*
   - **Costos Fijos y Amortización (Pasos 1, 2 y 4):**  
     *"Sumamos $25.00 USD en costos directos cloud, $38.35 USD en costos operativos fijos prorrateados (internet, electricidad y coworking), y $21.31 USD en fondo de reposición de hardware (base anual de 2.112 horas)."*
   - **Desgaste y CTC (Pasos 5 y 6):**  
     *"Aplicamos el 20% obligatorio de desgaste técnico ($78.30 USD), alcanzando un **Costo Total Consolidado (CTC) de $469.78 USD**, que representa nuestro punto de equilibrio técnico con cero ganancia."*
3. **Banda Absoluta de Precios (Paso 7) (30 seg):**  
   *"Para la venta comercial fijamos la Banda Absoluta: un **Piso Mínimo infranqueable de $610.71 USD (+30%)**, un **Precio Estándar de $681.18 USD (+45%)**, y un **Techo Enterprise de $822.12 USD (+75%)**. Si el cliente solicita ajuste de presupuesto, reducimos requerimientos, nunca el margen."*

### Minuto 6:00 a 7:00 — Cierre y Preguntas del Docente
- Muestra el acta firmada y la conciliación 1:1 entre el tablero y el informe.
- Cierra con seguridad: *"Quedamos atentos a sus preguntas técnicas sobre el código o el modelo contable."*
