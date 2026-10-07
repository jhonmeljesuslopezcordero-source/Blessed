<?php
/**
 * SISTEMA BLESSED • CONTROLADOR RESTful DE PRENDAS DE ROPA
 * Asignatura: Análisis y Diseño de Sistemas (ADS-433) - IUJO
 * Orquesta validaciones DTO, llamadas a modelo y respuestas semánticas.
 */

namespace Controllers;

use Models\Prenda;
use Helpers\Response;

class PrendaController {
    private Prenda $model;

    public function __construct() {
        $this->model = new Prenda();
    }

    /**
     * GET /api/prendas - Listado paginado o total con filtros
     * Código esperado: 200 OK
     */
    public function index(): void {
        $categoria = $_GET['categoria'] ?? null;
        $busqueda = $_GET['q'] ?? $_GET['busqueda'] ?? null;

        $prendas = $this->model->getAll($categoria, $busqueda);
        Response::json($prendas, 200, 'Catálogo de prendas obtenido exitosamente.');
    }

    /**
     * GET /api/prendas/:id - Consulta detallada de una entidad específica
     * Código esperado: 200 OK / 404 Not Found
     */
    public function show(int $id): void {
        $prenda = $this->model->getById($id);

        if (!$prenda) {
            Response::error("La prenda con ID {$id} no fue encontrada en el catálogo.", 404);
        }

        Response::json($prenda, 200, 'Detalle de la prenda recuperado correctamente.');
    }

    /**
     * POST /api/prendas - Inserción de nuevo registro con validación de payload
     * Código esperado: 201 Created / 400 Bad Request
     */
    public function store(): void {
        $input = $this->getJsonInput();

        $errors = $this->validatePayload($input);
        if (!empty($errors)) {
            Response::error('Error de validación en la captura de datos.', 400, $errors);
        }

        // Validación de unicidad de SKU
        if ($this->model->getBySku($input['sku'])) {
            Response::error("El código SKU '{$input['sku']}' ya se encuentra asignado a otra prenda.", 400, [
                'sku' => 'El SKU debe ser único en todo el catálogo.'
            ]);
        }

        $idGenerado = $this->model->create($input);

        if (!$idGenerado) {
            Response::error('No se pudo registrar la prenda en la base de datos.', 500);
        }

        $nuevaPrenda = $this->model->getById($idGenerado);
        Response::json($nuevaPrenda, 201, 'Prenda agregada al inventario con éxito.');
    }

    /**
     * PUT/PATCH /api/prendas/:id - Actualización de campos permitidos
     * Código esperado: 200 OK / 422 Unprocessable / 404 Not Found
     */
    public function update(int $id): void {
        $existente = $this->model->getById($id);
        if (!$existente) {
            Response::error("No se puede editar: la prenda con ID {$id} no existe.", 404);
        }

        $input = $this->getJsonInput();

        $errors = $this->validatePayload($input, true);
        if (!empty($errors)) {
            Response::error('Datos no procesables para actualización de la prenda.', 422, $errors);
        }

        // Validación de unicidad de SKU excluyendo el ID actual
        if ($this->model->getBySku($input['sku'], $id)) {
            Response::error("El código SKU '{$input['sku']}' está en uso por otro artículo.", 422, [
                'sku' => 'El SKU ya pertenece a otra prenda registrada.'
            ]);
        }

        $exito = $this->model->update($id, $input);
        if (!$exito) {
            Response::error('Fallo al actualizar el registro en la base de datos.', 500);
        }

        $actualizada = $this->model->getById($id);
        Response::json($actualizada, 200, 'Prenda actualizada con éxito.');
    }

    /**
     * DELETE /api/prendas/:id - Eliminación de estado o registro
     * Código esperado: 200 OK / 204 No Content
     */
    public function destroy(int $id): void {
        $existente = $this->model->getById($id);
        if (!$existente) {
            Response::error("La prenda con ID {$id} no existe o ya fue eliminada.", 404);
        }

        $exito = $this->model->delete($id);
        if (!$exito) {
            Response::error('No se pudo eliminar el registro de la base de datos.', 500);
        }

        Response::json(['id_eliminado' => $id, 'nombre' => $existente['nombre']], 200, 'Prenda eliminada exitosamente del inventario.');
    }

    /**
     * GET /api/kpis - Métricas en tiempo real para el Dashboard
     */
    public function kpis(): void {
        $kpis = $this->model->getKpis();
        Response::json($kpis, 200, 'Métricas operativas consolidadas en tiempo real.');
    }

    /**
     * GET /api/categorias - Lista de categorías para selects
     */
    public function categorias(): void {
        $categorias = $this->model->getCategorias();
        Response::json($categorias, 200, 'Listado de categorías del sistema.');
    }

    /**
     * Extrae el payload JSON desde el cuerpo de la petición HTTP
     */
    private function getJsonInput(): array {
        $raw = file_get_contents('php://input');
        if (empty($raw)) {
            // Si vino por POST tradicional de formulario
            return $_POST ?: [];
        }

        $decoded = json_decode($raw, true);
        return is_array($decoded) ? $decoded : [];
    }

    /**
     * Valida reglas de integridad y negocio
     */
    private function validatePayload(array $data, bool $isUpdate = false): array {
        $errors = [];

        // Nombre
        if (empty($data['nombre']) || strlen(trim($data['nombre'])) < 3) {
            $errors['nombre'] = 'El nombre de la prenda es obligatorio y debe tener al menos 3 caracteres.';
        }

        // SKU
        if (empty($data['sku']) || strlen(trim($data['sku'])) < 3) {
            $errors['sku'] = 'El SKU es obligatorio (ejemplo: BLS-HD-001).';
        }

        // Categoría
        if (empty($data['id_categoria']) || !is_numeric($data['id_categoria'])) {
            $errors['id_categoria'] = 'Debe seleccionar una categoría válida.';
        }

        // Precio
        if (!isset($data['precio_venta']) || !is_numeric($data['precio_venta']) || (float)$data['precio_venta'] <= 0) {
            $errors['precio_venta'] = 'El precio de venta debe ser un número mayor a 0.';
        }

        // Stock
        if (!isset($data['stock_actual']) || !is_numeric($data['stock_actual']) || (int)$data['stock_actual'] < 0) {
            $errors['stock_actual'] = 'El stock actual debe ser un número entero mayor o igual a 0.';
        }

        return $errors;
    }
}
