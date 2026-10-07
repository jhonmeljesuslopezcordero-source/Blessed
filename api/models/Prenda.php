<?php
/**
 * SISTEMA BLESSED • MODELO DE DOMINIO: PRENDA DE ROPA
 * Asignatura: Análisis y Diseño de Sistemas (ADS-433) - IUJO
 * Implementa consultas SQL preparadas (PDO) y mapeo relacional.
 */

namespace Models;

use Config\Database;
use PDO;

class Prenda {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    /**
     * Obtiene el listado de prendas con filtros opcionales de búsqueda y categoría
     */
    public function getAll(?string $categoria = null, ?string $busqueda = null): array {
        $sql = "SELECT p.id_prenda, p.sku, p.nombre, p.descripcion, p.id_categoria,
                       c.codigo AS categoria_codigo, c.nombre AS categoria_nombre,
                       p.precio_venta, p.stock_actual, p.stock_minimo,
                       p.tallas_disponibles, p.color_predominante, p.estado,
                       p.fecha_creacion, p.fecha_actualizacion
                FROM prendas p
                INNER JOIN categorias c ON p.id_categoria = c.id_categoria
                WHERE p.estado = 'activo'";
        
        $params = [];

        if (!empty($categoria) && $categoria !== 'todas') {
            $sql .= " AND c.codigo = :categoria";
            $params[':categoria'] = $categoria;
        }

        if (!empty($busqueda)) {
            $sql .= " AND (p.nombre LIKE :busqueda_nombre OR p.sku LIKE :busqueda_sku OR p.descripcion LIKE :busqueda_desc)";
            $termino = '%' . trim($busqueda) . '%';
            $params[':busqueda_nombre'] = $termino;
            $params[':busqueda_sku'] = $termino;
            $params[':busqueda_desc'] = $termino;
        }

        $sql .= " ORDER BY p.id_prenda DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        return $stmt->fetchAll();
    }

    /**
     * Consulta detallada de una prenda por ID
     */
    public function getById(int $id): ?array {
        $sql = "SELECT p.id_prenda, p.sku, p.nombre, p.descripcion, p.id_categoria,
                       c.codigo AS categoria_codigo, c.nombre AS categoria_nombre,
                       p.precio_venta, p.stock_actual, p.stock_minimo,
                       p.tallas_disponibles, p.color_predominante, p.estado,
                       p.fecha_creacion, p.fecha_actualizacion
                FROM prendas p
                INNER JOIN categorias c ON p.id_categoria = c.id_categoria
                WHERE p.id_prenda = :id LIMIT 1";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();

        return $row ?: null;
    }

    /**
     * Verifica si un SKU ya existe (para validación de unicidad)
     */
    public function getBySku(string $sku, ?int $excludeId = null): ?array {
        $sql = "SELECT id_prenda, sku FROM prendas WHERE sku = :sku";
        $params = [':sku' => trim($sku)];

        if ($excludeId !== null) {
            $sql .= " AND id_prenda != :excludeId";
            $params[':excludeId'] = $excludeId;
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $row = $stmt->fetch();

        return $row ?: null;
    }

    /**
     * Inserta una nueva prenda en la base de datos
     */
    public function create(array $data): int {
        $sql = "INSERT INTO prendas (
                    sku, nombre, descripcion, id_categoria, 
                    precio_venta, stock_actual, stock_minimo, 
                    tallas_disponibles, color_predominante, estado
                ) VALUES (
                    :sku, :nombre, :descripcion, :id_categoria, 
                    :precio_venta, :stock_actual, :stock_minimo, 
                    :tallas_disponibles, :color_predominante, 'activo'
                )";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':sku'                => strtoupper(trim($data['sku'])),
            ':nombre'             => trim($data['nombre']),
            ':descripcion'        => trim($data['descripcion'] ?? 'Prenda de confección nacional Blessed.'),
            ':id_categoria'       => (int) $data['id_categoria'],
            ':precio_venta'       => (float) $data['precio_venta'],
            ':stock_actual'       => (int) ($data['stock_actual'] ?? 0),
            ':stock_minimo'       => (int) ($data['stock_minimo'] ?? 5),
            ':tallas_disponibles' => trim($data['tallas_disponibles'] ?? 'S, M, L, XL'),
            ':color_predominante' => trim($data['color_predominante'] ?? 'Negro')
        ]);

        $id = (int) $this->db->lastInsertId();

        // Registrar movimiento inicial de auditoría
        if ($id && !empty($data['stock_actual']) && $data['stock_actual'] > 0) {
            $movSql = "INSERT INTO movimientos_inventario (id_prenda, tipo_movimiento, cantidad, motivo) 
                       VALUES (:id_prenda, 'entrada', :cantidad, 'Apertura de registro y alta en stock')";
            $movStmt = $this->db->prepare($movSql);
            $movStmt->execute([
                ':id_prenda' => $id,
                ':cantidad'  => (int) $data['stock_actual']
            ]);
        }

        return $id;
    }

    /**
     * Actualiza los datos de una prenda existente
     */
    public function update(int $id, array $data): bool {
        $sql = "UPDATE prendas SET 
                    sku = :sku,
                    nombre = :nombre,
                    descripcion = :descripcion,
                    id_categoria = :id_categoria,
                    precio_venta = :precio_venta,
                    stock_actual = :stock_actual,
                    stock_minimo = :stock_minimo,
                    tallas_disponibles = :tallas_disponibles,
                    color_predominante = :color_predominante
                WHERE id_prenda = :id";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':id'                 => $id,
            ':sku'                => strtoupper(trim($data['sku'])),
            ':nombre'             => trim($data['nombre']),
            ':descripcion'        => trim($data['descripcion'] ?? ''),
            ':id_categoria'       => (int) $data['id_categoria'],
            ':precio_venta'       => (float) $data['precio_venta'],
            ':stock_actual'       => (int) $data['stock_actual'],
            ':stock_minimo'       => (int) ($data['stock_minimo'] ?? 5),
            ':tallas_disponibles' => trim($data['tallas_disponibles'] ?? 'S, M, L, XL'),
            ':color_predominante' => trim($data['color_predominante'] ?? 'Negro')
        ]);
    }

    /**
     * Eliminación de prenda (eliminación física con integridad o soft-delete)
     */
    public function delete(int $id): bool {
        // Opción 1: Eliminación física directa (cascada en movimientos)
        $sql = "DELETE FROM prendas WHERE id_prenda = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([':id' => $id]);
    }

    /**
     * Retorna todas las categorías para selects del frontend
     */
    public function getCategorias(): array {
        $sql = "SELECT id_categoria, codigo, nombre, descripcion FROM categorias ORDER BY id_categoria ASC";
        return $this->db->query($sql)->fetchAll();
    }

    /**
     * Calcula métricas KPI consolidadas en tiempo real desde la Base de Datos
     */
    public function getKpis(): array {
        $sql = "SELECT 
                    COUNT(*) AS total_modelos,
                    COALESCE(SUM(stock_actual), 0) AS stock_total,
                    COALESCE(SUM(stock_actual * precio_venta), 0) AS valor_inventario,
                    SUM(CASE WHEN stock_actual <= stock_minimo THEN 1 ELSE 0 END) AS alerta_stock_bajo
                FROM prendas 
                WHERE estado = 'activo'";
        return $this->db->query($sql)->fetch();
    }
}
