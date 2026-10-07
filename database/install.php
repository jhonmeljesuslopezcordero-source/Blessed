<?php
/**
 * SISTEMA BLESSED • INSTALADOR AUTOMÁTICO DE BASE DE DATOS
 * Asignatura: Análisis y Diseño de Sistemas (ADS-433) - IUJO
 * Ejecuta el script database/schema.sql e inicializa la BD blessed_db.
 */

header('Content-Type: text/html; charset=utf-8');

$host = '127.0.0.1';
$user = 'root';
$pass = ''; // Contraseña por defecto de XAMPP

$messages = [];
$success = false;

try {
    // 1. Conexión al servidor MySQL sin seleccionar BD aún
    $pdo = new PDO("mysql:host=$host;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    $messages[] = "✅ Conexión exitosa al servidor MySQL en {$host}.";

    // 2. Leer archivo schema.sql
    $sqlFile = __DIR__ . '/schema.sql';
    if (!file_exists($sqlFile)) {
        throw new Exception("No se encontró el archivo schema.sql en: {$sqlFile}");
    }
    $sqlContent = file_get_contents($sqlFile);

    // 3. Ejecutar sentencias SQL
    $pdo->exec($sqlContent);
    $messages[] = "✅ Base de datos 'blessed_db' y tablas 'categorias', 'prendas', 'movimientos_inventario' creadas correctamente.";

    // 4. Verificar datos insertados
    $pdo->exec("USE `blessed_db`");
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM prendas");
    $totalPrendas = $stmt->fetch()['total'];
    $messages[] = "✅ Semilla de datos cargada: {$totalPrendas} prendas registradas en inventario.";

    $success = true;
} catch (Exception $e) {
    $messages[] = "❌ Error durante la instalación: " . $e->getMessage();
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Instalador de Base de Datos • BLESSED (ADS-433)</title>
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
    .install-card {
      background: #1e293b;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 2.5rem;
      max-width: 600px;
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
  <div class="install-card">
    <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem;">
      <div class="brand-icon-box" style="width: 44px; height: 44px; font-size: 1.4rem;">B</div>
      <div>
        <h2 style="margin: 0; font-size: 1.35rem; color: #fff;">Instalador BD • BLESSED</h2>
        <span style="font-size: 0.8rem; color: #94a3b8;">Evaluación V (Semana 10) • ADS-433 IUJO</span>
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
        <a href="../crud.html" class="btn btn-primary" style="flex: 1; text-align: center; text-decoration: none;">Ir al Módulo CRUD</a>
        <a href="../dashboard.html" class="btn btn-secondary" style="flex: 1; text-align: center; text-decoration: none;">Ir al Dashboard</a>
      </div>
    <?php else: ?>
      <div style="text-align: center; margin-top: 1.5rem;">
        <p style="color: #f87171; font-size: 0.88rem;">Asegúrate de que el servicio MySQL esté iniciado en el panel de control de XAMPP.</p>
        <button onclick="location.reload()" class="btn btn-primary">Reintentar Instalación</button>
      </div>
    <?php endif; ?>
  </div>
</body>
</html>
