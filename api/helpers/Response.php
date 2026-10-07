<?php
/**
 * SISTEMA BLESSED • HELPER DE RESPUESTAS HTTP RESTful
 * Estandariza payloads JSON y códigos de estado semánticos.
 */

namespace Helpers;

class Response {
    /**
     * Enviar respuesta exitosa en JSON
     */
    public static function json($data, int $statusCode = 200, string $message = 'Operación ejecutada con éxito'): void {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'status'     => 'success',
            'statusCode' => $statusCode,
            'message'    => $message,
            'data'       => $data,
            'timestamp'  => date('c')
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }

    /**
     * Enviar respuesta de error en JSON
     */
    public static function error(string $message, int $statusCode = 400, array $errors = []): void {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'status'     => 'error',
            'statusCode' => $statusCode,
            'message'    => $message,
            'errors'     => $errors,
            'timestamp'  => date('c')
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }
}
