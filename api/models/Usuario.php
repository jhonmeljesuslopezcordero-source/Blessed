<?php
/**
 * SISTEMA BLESSED • MODELO DE DOMINIO: USUARIOS Y PERFILES
 * Asignatura: Análisis y Diseño de Sistemas (ADS-433) - IUJO
 * Manejo de persistencia relacional para usuarios, roles y autenticación.
 */

namespace Models;

use Config\Database;
use PDO;

class Usuario {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    /**
     * Listado de usuarios con soporte para filtro por rol y búsqueda
     */
    public function getAll(?string $rol = null, ?string $busqueda = null): array {
        $sql = "SELECT u.id_usuario, u.nombre_completo, u.email, u.id_rol,
                       r.codigo AS rol_codigo, r.nombre AS rol_nombre,
                       u.telefono, u.direccion, u.estado,
                       u.fecha_creacion, u.fecha_actualizacion
                FROM usuarios u
                INNER JOIN roles r ON u.id_rol = r.id_rol
                WHERE 1=1";
        
        $params = [];

        if (!empty($rol) && $rol !== 'todos') {
            $sql .= " AND r.codigo = :rol";
            $params[':rol'] = $rol;
        }

        if (!empty($busqueda)) {
            $sql .= " AND (u.nombre_completo LIKE :busqueda_nombre OR u.email LIKE :busqueda_email)";
            $termino = '%' . trim($busqueda) . '%';
            $params[':busqueda_nombre'] = $termino;
            $params[':busqueda_email'] = $termino;
        }

        $sql .= " ORDER BY u.id_usuario ASC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        return $stmt->fetchAll();
    }

    /**
     * Obtiene un usuario específico por su ID
     */
    public function getById(int $id): ?array {
        $sql = "SELECT u.id_usuario, u.nombre_completo, u.email, u.id_rol,
                       r.codigo AS rol_codigo, r.nombre AS rol_nombre,
                       u.telefono, u.direccion, u.estado,
                       u.fecha_creacion, u.fecha_actualizacion
                FROM usuarios u
                INNER JOIN roles r ON u.id_rol = r.id_rol
                WHERE u.id_usuario = :id LIMIT 1";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();

        return $row ?: null;
    }

    /**
     * Busca usuario por email (para unicidad o autenticación)
     */
    public function getByEmail(string $email, ?int $excludeId = null): ?array {
        $sql = "SELECT u.id_usuario, u.nombre_completo, u.email, u.password_hash, u.id_rol,
                       r.codigo AS rol_codigo, r.nombre AS rol_nombre,
                       u.telefono, u.estado
                FROM usuarios u
                INNER JOIN roles r ON u.id_rol = r.id_rol
                WHERE u.email = :email";
        $params = [':email' => trim($email)];

        if ($excludeId !== null) {
            $sql .= " AND u.id_usuario != :excludeId";
            $params[':excludeId'] = $excludeId;
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $row = $stmt->fetch();

        return $row ?: null;
    }

    /**
     * Registra un nuevo usuario en la base de datos
     */
    public function create(array $data): int {
        $sql = "INSERT INTO usuarios (
                    nombre_completo, email, password_hash, id_rol,
                    telefono, direccion, estado
                ) VALUES (
                    :nombre, :email, :pass, :id_rol,
                    :tel, :dir, :estado
                )";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':nombre'  => trim($data['nombre_completo']),
            ':email'   => strtolower(trim($data['email'])),
            ':pass'    => password_hash($data['password'], PASSWORD_BCRYPT),
            ':id_rol'  => (int) $data['id_rol'],
            ':tel'     => trim($data['telefono'] ?? ''),
            ':dir'     => trim($data['direccion'] ?? ''),
            ':estado'  => trim($data['estado'] ?? 'activo')
        ]);

        return (int) $this->db->lastInsertId();
    }

    /**
     * Actualiza datos de un usuario existente (con o sin cambio de clave)
     */
    public function update(int $id, array $data): bool {
        $hasPassword = !empty($data['password']);

        $sql = "UPDATE usuarios SET 
                    nombre_completo = :nombre,
                    email           = :email,
                    id_rol          = :id_rol,
                    telefono        = :tel,
                    direccion       = :dir,
                    estado          = :estado";

        if ($hasPassword) {
            $sql .= ", password_hash = :pass";
        }

        $sql .= " WHERE id_usuario = :id";

        $params = [
            ':id'      => $id,
            ':nombre'  => trim($data['nombre_completo']),
            ':email'   => strtolower(trim($data['email'])),
            ':id_rol'  => (int) $data['id_rol'],
            ':tel'     => trim($data['telefono'] ?? ''),
            ':dir'     => trim($data['direccion'] ?? ''),
            ':estado'  => trim($data['estado'] ?? 'activo')
        ];

        if ($hasPassword) {
            $params[':pass'] = password_hash($data['password'], PASSWORD_BCRYPT);
        }

        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    /**
     * Elimina físicamente un usuario (no se permite auto-eliminación de admin principal id 1)
     */
    public function delete(int $id): bool {
        if ($id === 1) {
            return false; // Proteger superadmin Genderson
        }
        $sql = "DELETE FROM usuarios WHERE id_usuario = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([':id' => $id]);
    }

    /**
     * Obtiene el listado de roles del sistema
     */
    public function getRoles(): array {
        $sql = "SELECT id_rol, codigo, nombre, descripcion FROM roles ORDER BY id_rol ASC";
        return $this->db->query($sql)->fetchAll();
    }

    /**
     * Autenticación segura de credenciales contra la base de datos
     */
    public function authenticate(string $email, string $password): ?array {
        $user = $this->getByEmail($email);
        if (!$user) {
            return null;
        }

        if ($user['estado'] !== 'activo') {
            return ['error' => 'cuenta_inactiva'];
        }

        if (password_verify($password, $user['password_hash'])) {
            // Eliminar hash del resultado por seguridad
            unset($user['password_hash']);
            return $user;
        }

        return null;
    }
}
