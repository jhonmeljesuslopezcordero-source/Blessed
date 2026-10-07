<?php
/**
 * SISTEMA BLESSED • ACTUALIZADOR DE AUTENTICACIÓN Y ROLES EN BASE DE DATOS
 * Crea las tablas `roles` y `usuarios`, y registra a Genderson como admin.
 */

header('Content-Type: text/html; charset=utf-8');

$host = '127.0.0.1';
$user = 'root';
$pass = '';
$db   = 'blessed_db';

$messages = [];
$success = false;

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    $messages[] = "✅ Conexión exitosa a la base de datos '{$db}'.";

    // 1. Crear tabla roles
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `roles` (
            `id_rol` INT AUTO_INCREMENT PRIMARY KEY,
            `codigo` VARCHAR(50) NOT NULL UNIQUE,
            `nombre` VARCHAR(100) NOT NULL,
            `descripcion` TEXT NULL,
            `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    $messages[] = "✅ Tabla 'roles' creada o verificada.";

    // 2. Insertar roles oficiales: admin y cliente-comprador
    $pdo->exec("
        INSERT INTO `roles` (`id_rol`, `codigo`, `nombre`, `descripcion`) VALUES
        (1, 'admin', 'Administrador del Sistema', 'Acceso total a catálogo, stock, compras, ventas y perfiles de usuarios.'),
        (2, 'cliente-comprador', 'Cliente Comprador', 'Acceso a catálogo público, visualización de prendas y compras personales.')
        ON DUPLICATE KEY UPDATE 
            `nombre` = VALUES(`nombre`), 
            `descripcion` = VALUES(`descripcion`);
    ");
    $messages[] = "✅ Roles 'admin' y 'cliente-comprador' configurados.";

    // 3. Crear tabla usuarios
    $pdo->exec("
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
    ");
    $messages[] = "✅ Tabla 'usuarios' con clave foránea a 'roles' creada o verificada.";

    // 4. Hashear la contraseña de Genderson: pastorbellaco
    $claveGenderson = 'pastorbellaco';
    $hashGenderson = password_hash($claveGenderson, PASSWORD_BCRYPT);

    // Hashear contraseña del cliente de prueba
    $claveCliente = 'cliente123';
    $hashCliente = password_hash($claveCliente, PASSWORD_BCRYPT);

    // Insertar o actualizar a Genderson (admin)
    $stmtUser = $pdo->prepare("
        INSERT INTO `usuarios` (`nombre_completo`, `email`, `password_hash`, `id_rol`, `telefono`, `estado`)
        VALUES (:nombre, :email, :pass, :id_rol, :tel, 'activo')
        ON DUPLICATE KEY UPDATE 
            `nombre_completo` = VALUES(`nombre_completo`),
            `password_hash`   = VALUES(`password_hash`),
            `id_rol`          = VALUES(`id_rol`),
            `estado`          = 'activo';
    ");

    $stmtUser->execute([
        ':nombre'  => 'Genderson Piñango',
        ':email'   => 'genderson09@gmail.com',
        ':pass'    => $hashGenderson,
        ':id_rol'  => 1, // admin
        ':tel'     => '+58 412-5550199'
    ]);
    $messages[] = "✅ Usuario Administrador registrado: genderson09@gmail.com con rol 'admin' y clave cifrada (BCRYPT).";

    // Insertar o actualizar cliente de prueba
    $stmtUser->execute([
        ':nombre'  => 'Carlos Mendoza (Cliente)',
        ':email'   => 'cliente@blessed.com',
        ':pass'    => $hashCliente,
        ':id_rol'  => 2, // cliente-comprador
        ':tel'     => '+58 424-9876543'
    ]);
    $messages[] = "✅ Usuario Cliente registrado: cliente@blessed.com con rol 'cliente-comprador'.";

    $success = true;

} catch (Exception $e) {
    $messages[] = "❌ Error durante la actualización: " . $e->getMessage();
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Actualización de Perfiles • BLESSED</title>
  <link rel="stylesheet" href="../styles.css">
  <style>
    body {
      background-color: #0f172a;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      font-family: 'Inter', sans-serif;
      padding: 1.5rem;
    }
    .update-card {
      background: #1e293b;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 2.5rem;
      max-width: 650px;
      width: 100%;
      box-shadow: 0 20px 40px rgba(0,0,0,0.4);
      color: #ffffff;
    }
    .log-item {
      padding: 0.75rem 1rem;
      border-radius: 8px;
      margin-bottom: 0.6rem;
      font-size: 0.9rem;
      background: rgba(255, 255, 255, 0.05);
      border-left: 4px solid #be0b11;
    }
    .log-item.success {
      border-left-color: #16a34a;
    }
    .log-item.error {
      border-left-color: #dc2626;
    }
  </style>
</head>
<body>
  <div class="update-card">
    <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem;">
      <div class="brand-icon-box" style="width: 44px; height: 44px; font-size: 1.4rem;">B</div>
      <div>
        <h2 style="margin: 0; font-size: 1.35rem; color: #fff;">Actualización de Roles & Perfiles • BLESSED</h2>
        <span style="font-size: 0.8rem; color: #94a3b8;">Base de Datos: blessed_db (XAMPP MySQL)</span>
      </div>
    </div>

    <div style="margin-bottom: 1.5rem;">
      <?php foreach ($messages as $msg): ?>
        <div class="log-item <?php echo strpos($msg, '✅') !== false ? 'success' : 'error'; ?>">
          <?php echo htmlspecialchars($msg); ?>
        </div>
      <?php endforeach; ?>
    </div>

    <?php if ($success): ?>
      <div style="display: flex; gap: 1rem; margin-top: 2rem;">
        <a href="../login.html" class="btn btn-primary" style="flex: 1; text-align: center; text-decoration: none;">Ir a Iniciar Sesión</a>
        <a href="../usuarios.html" class="btn btn-secondary" style="flex: 1; text-align: center; text-decoration: none;">Ver Gestión de Perfiles</a>
      </div>
    <?php endif; ?>
  </div>
</body>
</html>
