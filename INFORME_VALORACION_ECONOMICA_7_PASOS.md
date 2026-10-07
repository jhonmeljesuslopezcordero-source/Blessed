# INFORME TÉCNICO-ECONÓMICO DE VALORACIÓN DE SOFTWARE
## Sistema de Gestión de Inventario y Catálogo de Ropa: "BLESSED"
**Asignatura:** Análisis y Diseño de Sistemas (ADS-433) — Semestre IV  
**Corte Académico:** Segundo Corte • Lapso 2-2026 • Evaluación V (15% Neto)  
**Institución:** Instituto Universitario Jesús Obrero (IUJO) — Extensión Barquisimeto  
**Docente Titular:** Prof. Ing. Eduardo Nieves  

---

### 1. Ficha Técnica de la Célula de Desarrollo Full-Stack
* **Nombre del Sistema:** BLESSED — Plataforma de Control de Inventario, Catálogo y Stock Textil.
* **Célula / N° Equipo:** Célula 01 • Sección: ADS-433-T1.
* **Modalidad de Repositorio:** Monorepo Full-Stack (Frontend Reactivo + API RESTful PHP/MySQL).
* **Stack Tecnológico:** HTML5 Semántico, CSS3 Vanilla Design System, JavaScript Asíncrono (Fetch/ES6+), PHP 8.x (Arquitectura en Capas: Routes, Controllers, Models/Services, PDO), MySQL 8.0/MariaDB Relacional.
* **Auditoría Externa GitHub:** Invitación enviada al docente: `@zedmous` (`zedmous@gmail.com`).

---

### 2. Fundamentación Metodológica: Los 7 Pasos de Valoración de Software (Ing. Eduardo Nieves)

Para erradicar la mala práctica industrial de presupuestar por "tarifa plana" o estimaciones intuitivas sin respaldo contable, se aplica rigurosamente la **Norma de los 7 Pasos**, garantizando la cobertura de costos directos, costos operativos prorrateados, salario real de mercado, amortización de hardware, factor de riesgo y contingencia (20%), y margen de rentabilidad comercial.

$$\text{Base Universal de Productividad:} \quad 176 \text{ horas/mes} \ (22 \text{ días laborables} \times 8 \text{ h/día}) \quad \bullet \quad 2.112 \text{ horas/año}$$

$$\mathbf{Fórmula \ Maestra \ del \ Costo \ Total \ Consolidado \ (Punto \ de \ Equilibrio \ Técnico):}$$
$$\mathbf{CTC = C_{dir} + C_{op} + C_{labor} + C_{inv} + C_{desgaste}}$$

---

### 3. Desarrollo Matemático Paso a Paso del Módulo Entregado (45.0 Horas Reales)

#### Paso 1: Insumos Digitales Directos ($C_{dir}$)
Corresponde a las herramientas cloud, servicios y licencias exclusivas adquiridas para el despliegue del software del cliente durante la iteración:
* Base de datos MySQL / VPS Staging Provisioning: $12.50 USD
* Certificado SSL Dedicado & Dominio Staging sandbox: $8.00 USD
* Servicios de CDN & Asset Storage: $4.50 USD
$$\mathbf{C_{dir} = 12.50 + 8.00 + 4.50 = \$25.00 \ \text{USD}}$$

#### Paso 2: Costos Operativos Fijos ($C_{op}$)
Gastos fijos de infraestructura del taller/estudio de desarrollo prorrateados estrictamente sobre la base universal de **176 horas mensuales**:
* Conexión a Internet de Fibra Óptica Dedicada (100 Mbps simétrico): $45.00 USD / mes
* Suministro Eléctrico & Respaldo Ininterrumpido (UPS/Baterías): $30.00 USD / mes
* Alquiler y Servicios del Espacio de Trabajo Compartido: $60.00 USD / mes
* Suscripciones a Repositorios & Herramientas de Gestión (GitHub Team / Workspace): $15.00 USD / mes
* **Total Gastos Fijos Mensuales:** $\$150.00 \ \text{USD}$

$$\text{Tarifa Horaria Operativa} \ (Tarifa_{Op}) = \frac{\text{Gastos Fijos}}{176 \text{ h}} = \frac{\$150.00}{176 \text{ h}} = \mathbf{\$0.8523 \ \text{USD/h}}$$
$$C_{op} = Tarifa_{Op} \times \text{Horas Reales de Tarjeta} = \$0.8523 \times 45.0 \text{ h} = \mathbf{\$38.35 \ \text{USD}}$$

#### Paso 3: Mano de Obra Técnica ($C_{labor}$)
Salario base de mercado regional de un desarrollador Full-Stack Jr/Mid ($1.200.00 USD mensuales), prorrateado sobre **176 horas laborables**:

$$\text{Tarifa Horaria Base} \ (Tarifa_{MO}) = \frac{\text{Sueldo Mensual}}{176 \text{ h}} = \frac{\$1.200.00}{176 \text{ h}} = \mathbf{\$6.8182 \ \text{USD/h} \ (\approx \$6.82 \ \text{USD/h})}$$
$$C_{labor} = Tarifa_{MO} \times \text{Horas Reales de Tarjeta} = \$6.8182 \times 45.0 \text{ h} = \mathbf{\$306.82 \ \text{USD}}$$

#### Paso 4: Inversión Anual en Hardware y Certificaciones ($C_{inv}$)
Fondo de amortización de equipamiento de cómputo (estaciones de trabajo de desarrollo con vida útil estimada en 3 años) más presupuesto anual de capacitación técnica continua:
* Presupuesto Anual de Amortización (Equipos de $2.000 USD amortizados a 3 años = $666.67 USD/año) + Cursos/Certificaciones ($333.33 USD/año): **$1.000.00 USD / año**.

$$\text{Tarifa de Inversión} \ (Tarifa_{Inv}) = \frac{\text{Presupuesto Anual}}{2.112 \text{ h}} = \frac{\$1.000.00}{2.112 \text{ h}} = \mathbf{\$0.4735 \ \text{USD/h}}$$
$$C_{inv} = Tarifa_{Inv} \times \text{Horas Reales de Tarjeta} = \$0.4735 \times 45.0 \text{ h} = \mathbf{\$21.31 \ \text{USD}}$$

#### Paso 5: Desgaste & Contingencia Técnica del 20% ($C_{desgaste}$)
Factor ineludible de la ingeniería de software para absorber refactorizaciones, bugs imprevistos, reuniones de sincronización y ajustes de arquitectura sobre el subtotal acumulado:

$$\text{Subtotal Pasos 1 a 4} = C_{dir} + C_{op} + C_{labor} + C_{inv} = \$25.00 + \$38.35 + \$306.82 + \$21.31 = \mathbf{\$391.48 \ \text{USD}}$$
$$C_{desgaste} = \text{Subtotal} \times 0.20 = \$391.48 \times 0.20 = \mathbf{\$78.30 \ \text{USD}}$$

#### Paso 6: Costo Total Consolidado (CTC — Punto de Equilibrio Técnico)
El costo real exacto de manufactura del software entregado (0% ganancia):

$$\mathbf{CTC = \$25.00 + \$38.35 + \$306.82 + \$21.31 + \$78.30 = \$469.78 \ \text{USD}}$$

---

### 4. Paso 7: Fijación de la Banda Absoluta de Precios

La fijación del precio comercial no admite descuentos arbitrarios; ante cualquier negociación con el cliente se reduce el alcance (*Scope*), jamás el margen de rentabilidad:

| Nivel de Precio Comercial | Fórmula de Cálculo | Multiplicador | Precio de Venta Sugerido ($ USD) | Escenario de Negociación |
| :--- | :--- | :---: | :---: | :--- |
| **1. Piso Mínimo (+30%)** | $\text{CTC} \times 1.30$ | $1.30$ | **$610.71 USD** | Límite infranqueable. Prohibido vender por debajo de este valor. |
| **2. Precio Estándar (+40% a +50%)** | $\text{CTC} \times 1.40 \ \text{a} \ 1.50$ | $1.45$ (promedio) | **$681.18 USD** | Precio de cotización regular para el sector comercial de confección textil. |
| **3. Techo Enterprise (+60% a +100%)** | $\text{CTC} \times 1.60 \ \text{a} \ 2.00$ | $1.75$ | **$822.12 USD** | Cliente corporativo con acuerdos de nivel de servicio (SLA) y soporte crítico 24/7. |

---

### 5. Matriz Espejo de Conciliación: "Todo Debe Cuadrar"
> **Cumplimiento de la Regla de Tolerancia Cero #2:** La sumatoria de las horas de los tickets en la columna **Terminado** del tablero ágil coincide con exactitud 1:1 con la mano de obra liquidada en el Paso 3.

| Ticket ID | Descripción del Feature / Módulo | Responsable Asignado | Rama Oficial GitFlow / PR | Horas Estimadas | Horas Reales | Tarifa MO ($) | Costo Parcial ($ USD) |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| **TASK-101** | Diseño DDL, Migraciones y Conexión DB | Genderson Piñango (Git Lead) | `feature/101-ddl-db` (PR #02) | 5.0 h | **6.0 h** | $6.8182/h | $40.91 USD |
| **TASK-102** | Controladores y Rutas API REST CRUD | Desarrollador 2 (Backend Dev) | `feature/102-api-crud` (PR #05) | 10.0 h | **11.0 h** | $6.8182/h | $75.00 USD |
| **TASK-103** | Vistas Frontend, Consumo Fetch y Feedback | Desarrollador 3 (Frontend Dev) | `feature/103-vistas-ui` (PR #08) | 12.0 h | **11.5 h** | $6.8182/h | $78.41 USD |
| **TASK-104** | Validaciones DTO, Manejo de Errores y Estados | Desarrollador 4 (QA / Full-Stack) | `feature/104-validaciones` (PR #11) | 8.0 h | **9.0 h** | $6.8182/h | $61.36 USD |
| **TASK-105** | Pruebas de Integración y Despliegue Local | Desarrollador 5 (DevOps / Tester) | `feature/105-pruebas` (PR #14) | 8.0 h | **7.5 h** | $6.8182/h | $51.14 USD |
| **TOTALES CONCILIADOS** | **Iteración 1: CRUD de Inventario BLESSED** | **Célula de 5 Integrantes** | **Ramas mergeadas a `develop`** | **43.0 h** | **45.0 h** | **$6.8182/h** | **$306.82 USD** |

---

### 6. Declaración Jurada de Concordancia Técnica
Los integrantes de la Célula de Desarrollo certifican que:
1. No se emplearon datos estáticos ni arreglos simulados en JavaScript en la demostración en aula. La data proviene 100% de la Base de Datos relacional `blessed_db` consumida mediante endpoints RESTful.
2. Cada tarjeta registrada en la columna *Terminado* del tablero ágil cuenta con su correspondiente Pull Request mergeado en la rama `develop` sin commits directos a `master`.
3. El total de **45.0 horas auditadas** concilia con exactitud matemática contra el modelo de costos.

```
___________________________________          ___________________________________
Genderson Piñango (C.I. V-XX.XXX.XXX)        Prof. Ing. Eduardo Nieves
Líder Técnico / Git Lead                     Docente Titular Cátedra ADS-433
```
