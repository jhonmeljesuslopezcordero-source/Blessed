-- ==============================================================================
-- SISTEMA BLESSED • BASE DE DATOS RELACIONAL (MySQL / MariaDB)
-- Asignatura: Análisis y Diseño de Sistemas (ADS-433) • IUJO Semestre IV
-- Evaluación V: Demo Day de Avance Funcional (Primer CRUD) y Costos TI
-- Docente: Prof. Eduardo Nieves • Lapso 2-2026
-- ==============================================================================

-- 1. CREACIÓN DE LA BASE DE DATOS
CREATE DATABASE IF NOT EXISTS `blessed_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `blessed_db`;

-- Desactivar temporalmente revisión de claves foráneas para recreación limpia
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `movimientos_inventario`;
DROP TABLE IF EXISTS `prendas`;
DROP TABLE IF EXISTS `categorias`;
SET FOREIGN_KEY_CHECKS = 1;

-- ==============================================================================
-- 2. TABLA: CATEGORÍAS DE PRENDAS DE ROPA
-- ==============================================================================
CREATE TABLE `categorias` (
  `id_categoria` INT AUTO_INCREMENT PRIMARY KEY,
  `codigo` VARCHAR(50) NOT NULL UNIQUE,
  `nombre` VARCHAR(100) NOT NULL,
  `descripcion` TEXT NULL,
  `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 3. TABLA: PRENDAS DE ROPA (CATÁLOGO & STOCK - ENTIDAD PRINCIPAL DEL CRUD)
-- ==============================================================================
CREATE TABLE `prendas` (
  `id_prenda` INT AUTO_INCREMENT PRIMARY KEY,
  `sku` VARCHAR(50) NOT NULL UNIQUE,
  `nombre` VARCHAR(150) NOT NULL,
  `descripcion` TEXT NOT NULL,
  `id_categoria` INT NOT NULL,
  `precio_venta` DECIMAL(10, 2) NOT NULL CHECK (`precio_venta` >= 0),
  `stock_actual` INT NOT NULL DEFAULT 0 CHECK (`stock_actual` >= 0),
  `stock_minimo` INT NOT NULL DEFAULT 5 CHECK (`stock_minimo` >= 0),
  `tallas_disponibles` VARCHAR(100) NOT NULL DEFAULT 'S, M, L, XL',
  `color_predominante` VARCHAR(50) NOT NULL DEFAULT 'Negro',
  `estado` ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',
  `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Integridad Referencial Estricta con Clave Foránea
  CONSTRAINT `fk_prendas_categoria`
    FOREIGN KEY (`id_categoria`)
    REFERENCES `categorias` (`id_categoria`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 4. TABLA: MOVIMIENTOS DE INVENTARIO (ENTIDAD DE AUDITORÍA Y TRAZABILIDAD)
-- ==============================================================================
CREATE TABLE `movimientos_inventario` (
  `id_movimiento` INT AUTO_INCREMENT PRIMARY KEY,
  `id_prenda` INT NOT NULL,
  `tipo_movimiento` ENUM('entrada', 'salida', 'ajuste') NOT NULL,
  `cantidad` INT NOT NULL,
  `motivo` VARCHAR(255) NOT NULL,
  `fecha_movimiento` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT `fk_movimientos_prenda`
    FOREIGN KEY (`id_prenda`)
    REFERENCES `prendas` (`id_prenda`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 5. TABLA: ROLES DE USUARIO (CONTROL DE ACCESO Y PERMISOS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS `roles` (
  `id_rol` INT AUTO_INCREMENT PRIMARY KEY,
  `codigo` VARCHAR(50) NOT NULL UNIQUE,
  `nombre` VARCHAR(100) NOT NULL,
  `descripcion` TEXT NULL,
  `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 6. TABLA: USUARIOS Y PERFILES DEL SISTEMA
-- ==============================================================================
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id_usuario` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre_completo` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `id_rol` INT NOT NULL,
  `telefono` VARCHAR(50) NULL,
  `direccion` VARCHAR(255) NULL,
  `estado` ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',
  `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  CONSTRAINT `fk_usuarios_rol`
    FOREIGN KEY (`id_rol`)
    REFERENCES `roles` (`id_rol`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 7. SEMILLA DE DATOS (DATA SEEDING) - NEGOCIO DE ROPA URBANA "BLESSED"
-- ==============================================================================

-- Inserción de Roles
INSERT INTO `roles` (`id_rol`, `codigo`, `nombre`, `descripcion`) VALUES
(1, 'admin', 'Administrador del Sistema', 'Acceso total a catálogo, stock, compras, ventas y gestión de perfiles.'),
(2, 'cliente-comprador', 'Cliente Comprador', 'Acceso a catálogo público, visualización de prendas y compras personales.');

-- Inserción de Usuarios Oficiales (Clave Genderson: pastorbellaco / Clave Cliente: cliente123)
INSERT INTO `usuarios` (`id_usuario`, `nombre_completo`, `email`, `password_hash`, `id_rol`, `telefono`, `estado`) VALUES
(1, 'Genderson Piñango', 'genderson09@gmail.com', '$2y$10$7cK8sWkG4j5kMsmMvD9eO.p4qf54FkJ/KzWdK8qG6KxL9f3P9jW2K', 1, '+58 412-5550199', 'activo'),
(2, 'Carlos Mendoza (Cliente)', 'cliente@blessed.com', '$2y$10$h9g5sL8j4k1mNsMmVD9eOp4qf54FkJ/KzWdK8qG6KxL9f3P9jW2K', 2, '+58 424-9876543', 'activo');

-- Inserción de Categorías
INSERT INTO `categorias` (`id_categoria`, `codigo`, `nombre`, `descripcion`) VALUES
(1, 'hoodies', 'Hoodies & Sudaderas', 'Sudaderas urbanas oversize con capucha y felpa pesada 400g'),
(2, 'camisetas', 'Camisetas Oversize', 'Camisetas streetwear con corte amplio y lavado vintage'),
(3, 'pantalones', 'Pantalones Cargo', 'Pantalones tácticos multiextensión con tela ripstop'),
(4, 'chaquetas', 'Chaquetas & Bombers', 'Chaquetas urbanas cortaviento y bombers acolchadas');

-- Inserción de Prendas Oficiales en Catálogo
INSERT INTO `prendas` (`id_prenda`, `sku`, `nombre`, `descripcion`, `id_categoria`, `precio_venta`, `stock_actual`, `stock_minimo`, `tallas_disponibles`, `color_predominante`, `estado`) VALUES
(1, 'BLS-HD-001', 'Hoodie Oversize Blessed Heavyweight', 'Algodón perchado 400g, capucha forrada, corte holgado urbano streetwear.', 1, 35.00, 45, 10, 'S, M, L, XL', 'Azul Marino', 'activo'),
(2, 'BLS-TS-044', 'Camiseta Gráfica Acid Wash Vintage', 'Estampado serigráfico de alta densidad, cuello cerrado acanalado y lavado ácido.', 2, 20.00, 120, 15, 'M, L, XL, XXL', 'Gris Carbón', 'activo'),
(3, 'BLS-PA-112', 'Pantalón Cargo Tactical Negro', '6 bolsillos de fuelle funcionales, tirantes ajustables y tela ripstop antidesgarro.', 3, 42.00, 6, 8, '30, 32, 34, 36', 'Negro', 'activo'),
(4, 'BLS-JK-009', 'Chaqueta Bomber Streetwear Classic', 'Relleno térmico ligero, cremallera metálica YKK y bordado frontal Blessed.', 4, 55.00, 18, 5, 'S, M, L', 'Verde Militar', 'activo'),
(5, 'BLS-HD-002', 'Hoodie Essential Blessed Core', 'Felpa suave premium, bordado en relieve tonal y puños reforzados.', 1, 38.00, 24, 8, 'M, L, XL', 'Crema', 'activo'),
(6, 'BLS-TS-045', 'Camiseta Boxy Fit Minimalist', 'Corte cuadrado estructurado, algodón pima 240g y estampado sutil en espalda.', 2, 22.00, 75, 12, 'S, M, L, XL', 'Blanco Óptico', 'activo');

-- Inserción de Movimientos Iniciales de Registro
INSERT INTO `movimientos_inventario` (`id_prenda`, `tipo_movimiento`, `cantidad`, `motivo`) VALUES
(1, 'entrada', 45, 'Carga inicial de inventario auditado - Lote 01'),
(2, 'entrada', 120, 'Carga inicial de inventario auditado - Lote 01'),
(3, 'entrada', 6, 'Carga inicial de inventario auditado - Lote 01'),
(4, 'entrada', 18, 'Carga inicial de inventario auditado - Lote 01'),
(5, 'entrada', 24, 'Carga inicial de inventario auditado - Lote 02'),
(6, 'entrada', 75, 'Carga inicial de inventario auditado - Lote 02');
