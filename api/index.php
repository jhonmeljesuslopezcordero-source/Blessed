<?php
/**
 * SISTEMA BLESSED • ENRUTADOR FRONTAL RESTful (API GATEWAY)
 * Asignatura: Análisis y Diseño de Sistemas (ADS-433) - IUJO
 * Implementa CORS, enrutamiento semántico, captura de excepciones y middleware de errores.
 */

// 1. Headers Globales de CORS y Content-Type
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

// Responder inmediatamente a peticiones preflight de CORS OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 2. Autoloader simple para los namespaces Config, Helpers, Models, Controllers
spl_autoload_register(function ($class) {
    $classPath = str_replace('\\', DIRECTORY_SEPARATOR, $class);
    $file = __DIR__ . DIRECTORY_SEPARATOR . $classPath . '.php';
    if (file_exists($file)) {
        require_once $file;
    }
});

use Controllers\PrendaController;
use Helpers\Response;

// 3. Middleware Global de Manejo de Errores
try {
    // 4. Detección del Método HTTP y la Ruta Solicitada
    $method = $_SERVER['REQUEST_METHOD'];
    
    // Soporte para spoofing de PUT/DELETE mediante _method o header
    if ($method === 'POST' && isset($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'])) {
        $method = strtoupper($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE']);
    }

    // Obtener ruta desde query param o PATH_INFO
    $route = $_GET['route'] ?? '';
    
    if (empty($route) && isset($_SERVER['PATH_INFO'])) {
        $route = trim($_SERVER['PATH_INFO'], '/');
    }

    // Normalizar ruta
    $segments = array_values(array_filter(explode('/', trim($route, '/'))));
    $resource = $segments[0] ?? 'prendas';
    $id = isset($segments[1]) && is_numeric($segments[1]) ? (int)$segments[1] : (isset($_GET['id']) && is_numeric($_GET['id']) ? (int)$_GET['id'] : null);

    $controller = new PrendaController();
    $userController = new \Controllers\UsuarioController();

    // 5. Tabla de Enrutamiento RESTful
    switch ($resource) {
        case 'prendas':
            switch ($method) {
                case 'GET':
                    if ($id !== null) {
                        $controller->show($id);
                    } else {
                        $controller->index();
                    }
                    break;

                case 'POST':
                    $controller->store();
                    break;

                case 'PUT':
                case 'PATCH':
                    if ($id === null) {
                        Response::error('Debe especificar el ID de la prenda a actualizar en la ruta: /api/prendas/{id}', 400);
                    }
                    $controller->update($id);
                    break;

                case 'DELETE':
                    if ($id === null) {
                        Response::error('Debe especificar el ID de la prenda a eliminar en la ruta: /api/prendas/{id}', 400);
                    }
                    $controller->destroy($id);
                    break;

                default:
                    Response::error("Método HTTP '{$method}' no soportado para este endpoint.", 405);
            }
            break;

        case 'usuarios':
            switch ($method) {
                case 'GET':
                    if ($id !== null) {
                        $userController->show($id);
                    } else {
                        $userController->index();
                    }
                    break;

                case 'POST':
                    $userController->store();
                    break;

                case 'PUT':
                case 'PATCH':
                    if ($id === null) {
                        Response::error('Debe especificar el ID del usuario a actualizar en la ruta: /api/usuarios/{id}', 400);
                    }
                    $userController->update($id);
                    break;

                case 'DELETE':
                    if ($id === null) {
                        Response::error('Debe especificar el ID del usuario a eliminar en la ruta: /api/usuarios/{id}', 400);
                    }
                    $userController->destroy($id);
                    break;

                default:
                    Response::error("Método HTTP '{$method}' no soportado para /api/usuarios.", 405);
            }
            break;

        case 'roles':
            if ($method === 'GET') {
                $userController->roles();
            } else {
                Response::error("Método '{$method}' no permitido para /api/roles.", 405);
            }
            break;

        case 'login':
            if ($method === 'POST') {
                $userController->login();
            } else {
                Response::error("Método '{$method}' no permitido para /api/login. Use POST.", 405);
            }
            break;

        case 'registro':
            if ($method === 'POST') {
                $userController->registro();
            } else {
                Response::error("Método '{$method}' no permitido para /api/registro. Use POST.", 405);
            }
            break;

        case 'kpis':
            if ($method === 'GET') {
                $controller->kpis();
            } else {
                Response::error("Método '{$method}' no permitido para /api/kpis.", 405);
            }
            break;

        case 'categorias':
            if ($method === 'GET') {
                $controller->categorias();
            } else {
                Response::error("Método '{$method}' no permitido para /api/categorias.", 405);
            }
            break;

        default:
            Response::error("Recurso no encontrado: '/api/{$resource}'", 404);
            break;
    }

} catch (Throwable $e) {
    // Middleware Centralizado: atrapa cualquier excepción sin tumbar el servidor
    Response::error('Error interno no controlado en el servidor REST.', 500, [
        'mensaje' => $e->getMessage(),
        'archivo' => basename($e->getFile()),
        'linea'   => $e->getLine()
    ]);
}
