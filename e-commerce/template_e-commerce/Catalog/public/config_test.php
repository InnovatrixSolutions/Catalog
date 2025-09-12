<?php
header("Content-Type: application/json");
require __DIR__.'/vendor/autoload.php';
use Dotenv\Dotenv;
require_once 'Utils.php';

$apiKey = $_ENV['API_KEY'] ?? '';
$validateSession = ($_ENV['SESSION_VALIDATE'] ?? 'true') === 'true';


if (!isset($_SERVER['HTTP_X_API_KEY'])) {
    file_put_contents('error.log', "Header X-API-KEY no recibido\n", FILE_APPEND);
    Utils::responder(false, "No autorizado");
    exit;
}

if ($_SERVER['HTTP_X_API_KEY'] !== $apiKey) {
    file_put_contents('error.log', "Clave incorrecta: " . $_SERVER['HTTP_X_API_KEY'] . "\n", FILE_APPEND);
    Utils::responder(false, "No autorizado");
    exit;
}

if ($validateSession) {
    session_start();
    if (!isset($_SESSION['usuario_id'])) {
        Utils::responder(false, "No autorizado. Inicia sesión primero.");
        exit;
    }
}


echo json_encode([
    'received_headers' => apache_request_headers(),
    'server_env' => $_SERVER
]);
?>