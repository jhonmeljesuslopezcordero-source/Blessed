<?php
/**
 * SISTEMA BLESSED • CAPA DE CONFIGURACIÓN Y PERSISTENCIA (DATABASE)
 * Asignatura: Análisis y Diseño de Sistemas (ADS-433) - IUJO
 * Conexión Singleton mediante PDO con emulación de prepares desactivada.
 */

namespace Config;

use PDO;
use PDOException;

class Database {
    private static ?PDO $instance = null;

    private static string $host = '127.0.0.1';
    private static string $dbName = 'blessed_db';
    private static string $username = 'root';
    private static string $password = ''; // Credencial por defecto en XAMPP
    private static string $charset = 'utf8mb4';

    /**
     * Retorna la instancia única de conexión PDO
     */
    public static function getConnection(): PDO {
        if (self::$instance === null) {
            $dsn = "mysql:host=" . self::$host . ";dbname=" . self::$dbName . ";charset=" . self::$charset;
            
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false, // Prevenir inyecciones SQL nativas
            ];

            try {
                self::$instance = new PDO($dsn, self::$username, self::$password, $options);
            } catch (PDOException $e) {
                http_response_code(500);
                header('Content-Type: application/json; charset=utf-8');
                echo json_encode([
                    'status' => 'error',
                    'statusCode' => 500,
                    'message' => 'Fallo crítico de conexión a la Base de Datos relacional.',
                    'details' => $e->getMessage()
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }
        }

        return self::$instance;
    }
}
