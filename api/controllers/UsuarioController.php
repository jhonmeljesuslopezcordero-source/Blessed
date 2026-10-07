<?php
/**
 * SISTEMA BLESSED • CONTROLADOR RESTful DE USUARIOS Y AUTENTICACIÓN
 * Asignatura: Análisis y Diseño de Sistemas (ADS-433) - IUJO
 * Orquesta la gestión de perfiles, roles y login seguro.
 */

namespace Controllers;

use Models\Usuario;
use Helpers\Response;

class UsuarioController {
    private Usuario $model;

    public function __construct() {
        $this->model = new Usuario();
    }

    /**
     * GET /api/usuarios - Listar todos los perfiles de usuarios
     */
    public function index(): void {
        $rol = $_GET['rol'] ?? null;
        $busqueda = $_GET['q'] ?? $_GET['busqueda'] ?? null;

        $usuarios = $this->model->getAll($rol, $busqueda);
        Response::json($usuarios, 200, 'Listado de usuarios recuperado con éxito.');
    }

    /**
     * GET /api/usuarios/:id - Consulta de perfil específico
     */
    public function show(int $id): void {
        $usuario = $this->model->getById($id);
        if (!$usuario) {
            Response::error("El usuario con ID {$id} no fue encontrado.", 404);
        }
        Response::json($usuario, 200, 'Detalle del perfil obtenido correctamente.');
    }

    /**
     * POST /api/usuarios - Crear nuevo usuario/perfil desde el panel administrativo
     */
    public function store(): void {
        $input = $this->getJsonInput();

        $errors = $this->validatePayload($input, false);
        if (!empty($errors)) {
            Response::error('Error de validación en la captura de datos.', 400, $errors);
        }

        // Validar unicidad del email
        if ($this->model->getByEmail($input['email'])) {
            Response::error("El correo electrónico '{$input['email']}' ya está registrado en el sistema.", 400, [
                'email' => 'El correo ya pertenece a otra cuenta.'
            ]);
        }

        $idGenerado = $this->model->create($input);
        if (!$idGenerado) {
            Response::error('No se pudo registrar el usuario en la base de datos.', 500);
        }

        $nuevo = $this->model->getById($idGenerado);
        Response::json($nuevo, 201, 'Usuario y perfil creados exitosamente.');
    }

    /**
     * PUT /api/usuarios/:id - Actualizar perfil o rol
     */
    public function update(int $id): void {
        $existente = $this->model->getById($id);
        if (!$existente) {
            Response::error("El usuario con ID {$id} no existe.", 404);
        }

        $input = $this->getJsonInput();

        $errors = $this->validatePayload($input, true);
        if (!empty($errors)) {
            Response::error('Datos no procesables para actualización.', 422, $errors);
        }

        // Validar unicidad de email excluyendo el ID actual
        if ($this->model->getByEmail($input['email'], $id)) {
            Response::error("El correo electrónico '{$input['email']}' ya está en uso.", 422, [
                'email' => 'El correo pertenece a otro usuario.'
            ]);
        }

        $exito = $this->model->update($id, $input);
        if (!$exito) {
            Response::error('Error al actualizar el usuario en la base de datos.', 500);
        }

        $actualizado = $this->model->getById($id);
        Response::json($actualizado, 200, 'Perfil de usuario actualizado con éxito.');
    }

    /**
     * DELETE /api/usuarios/:id - Eliminar perfil
     */
    public function destroy(int $id): void {
        if ($id === 1) {
            Response::error('El usuario Administrador Principal (Genderson) está protegido contra eliminación.', 403);
        }

        $existente = $this->model->getById($id);
        if (!$existente) {
            Response::error("El usuario con ID {$id} no fue encontrado.", 404);
        }

        $exito = $this->model->delete($id);
        if (!$exito) {
            Response::error('No se pudo eliminar el usuario.', 500);
        }

        Response::json(['id_eliminado' => $id, 'nombre' => $existente['nombre_completo']], 200, 'Usuario eliminado del sistema.');
    }

    /**
     * GET /api/roles - Listar roles disponibles (admin, cliente-comprador)
     */
    public function roles(): void {
        $roles = $this->model->getRoles();
        Response::json($roles, 200, 'Listado oficial de roles del sistema.');
    }

    /**
     * POST /api/login - Iniciar sesión seguro
     */
    public function login(): void {
        $input = $this->getJsonInput();

        $email = trim($input['email'] ?? $input['username'] ?? '');
        $password = trim($input['password'] ?? '');

        if (empty($email) || empty($password)) {
            Response::error('Debe ingresar su correo electrónico y su contraseña.', 400);
        }

        $user = $this->model->authenticate($email, $password);

        if ($user === null) {
            Response::error('Credenciales incorrectas. Verifique su correo o contraseña.', 401);
        }

        if (isset($user['error']) && $user['error'] === 'cuenta_inactiva') {
            Response::error('Su cuenta se encuentra inactiva. Contacte al administrador.', 403);
        }

        Response::json([
            'usuario' => $user,
            'token'   => base64_encode($user['id_usuario'] . ':' . time()),
            'redirect' => $user['rol_codigo'] === 'admin' ? 'dashboard.html' : 'crud.html'
        ], 200, "¡Bienvenido {$user['nombre_completo']}! Sesión iniciada con éxito.");
    }

    /**
     * POST /api/registro - Registro de cuenta pública (Asigna siempre cliente-comprador)
     */
    public function registro(): void {
        $input = $this->getJsonInput();

        $input['id_rol'] = 2; // Forzar siempre rol cliente-comprador
        $input['estado'] = 'activo';

        $errors = $this->validatePayload($input, false);
        if (!empty($errors)) {
            Response::error('Fallo en el registro de cuenta.', 400, $errors);
        }

        if ($this->model->getByEmail($input['email'])) {
            Response::error("El correo '{$input['email']}' ya tiene una cuenta asociada.", 400);
        }

        $id = $this->model->create($input);
        if (!$id) {
            Response::error('No se pudo completar el registro.', 500);
        }

        $nuevo = $this->model->getById($id);
        Response::json($nuevo, 201, '¡Cuenta de cliente creada exitosamente! Ya puede iniciar sesión.');
    }

    /**
     * Extrae el payload JSON desde el cuerpo de la petición
     */
    private function getJsonInput(): array {
        $raw = file_get_contents('php://input');
        if (empty($raw)) {
            return $_POST ?: [];
        }

        $decoded = json_decode($raw, true);
        return is_array($decoded) ? $decoded : [];
    }

    /**
     * Valida los campos del usuario
     */
    private function validatePayload(array $data, bool $isUpdate = false): array {
        $errors = [];

        if (empty($data['nombre_completo']) || strlen(trim($data['nombre_completo'])) < 3) {
            $errors['nombre_completo'] = 'El nombre completo es obligatorio (mínimo 3 caracteres).';
        }

        if (empty($data['email']) || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'Debe proporcionar un correo electrónico válido.';
        }

        if (!$isUpdate && (empty($data['password']) || strlen(trim($data['password'])) < 6)) {
            $errors['password'] = 'La contraseña es obligatoria y debe tener al menos 6 caracteres.';
        }

        if (empty($data['id_rol']) || !in_array((int)$data['id_rol'], [1, 2])) {
            $errors['id_rol'] = 'Debe seleccionar un rol válido (1: admin, 2: cliente-comprador).';
        }

        return $errors;
    }
}
