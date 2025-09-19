<?php
// header("Content-Type: application/json");
// header('Access-Control-Allow-Origin: *');
// header('Access-Control-Allow-Methods: POST, OPTIONS');
// header('Access-Control-Allow-Headers: Content-Type');

require __DIR__.'/vendor/autoload.php';
require_once 'cors_headers.php';
require_once 'Utils.php';

// Manejo de solicitudes OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

use Dotenv\Dotenv;

require_once 'Utils.php';
require_once 'AddressManager.php';

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

$servidor = $_ENV['DB_HOST'] . ':' . $_ENV['DB_PORT'];
$usuario = $_ENV['DB_USER'];
$contrasena = $_ENV['DB_PASS'];
$dbname = $_ENV['DB_NAME'];


if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $dsn = "mysql:host=$servidor;dbname=$dbname";
    $conexion = new PDO($dsn, $usuario, $contrasena);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    if (empty($_POST['country_id']) || !is_numeric($_POST['country_id'])) {
        Utils::responder(false, "Parámetro country_id requerido o es inválido");
    }
    
    if (empty($_POST['state_id']) || !is_numeric($_POST['state_id'])) {
        Utils::responder(false, "Parámetro state_id requerido o es inválido");
    }

    $country_id = intval($_POST['country_id']);
    $state_id = intval($_POST['state_id']);
    $cities = AddressManager::getCities($conexion, $country_id,$state_id);

    if (empty($cities)) {
        Utils::responder(false, "No se encontraron ciudades para el país $country_id y states : $state_id");
    }

    Utils::responder(true, "Estados encontrados", ["states" => $cities]);
} else {
    Utils::responder(false, "Método no permitido");
}
?>