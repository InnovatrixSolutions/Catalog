<?php
// header("Content-Type: application/json");
// header('Access-Control-Allow-Origin: *');
// header('Access-Control-Allow-Methods: GET, OPTIONS');
// header('Access-Control-Allow-Headers: Content-Type');
require __DIR__.'/vendor/autoload.php';
require_once 'cors_headers.php';
require_once 'Utils.php';

// Manejo de solicitudes OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

// Cargar variables de entorno desde el archivo .env
use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Obtener los valores de las variables de entorno
$servidor = $_ENV['DB_HOST'] . ':' . $_ENV['DB_PORT'];
$usuario = $_ENV['DB_USER'];
$contrasena = $_ENV['DB_PASS'];
$dbname = $_ENV['DB_NAME'];

try {
    $dsn = "mysql:host=$servidor;dbname=$dbname";
    $conexion = new PDO($dsn, $usuario, $contrasena);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Consulta para obtener todos los campos de la tabla 'codigos'
        $sqlSelect = "SELECT * FROM `codigos`  WHERE estado =:codigo";
        $stmt = $conexion->prepare($sqlSelect);
        $stmt->execute([':codigo' => 'activo']);
        $codigos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        // Respuesta JSON con todos los registros de la tabla 'codigos'
         Utils::responder(true, "Cupones",["codigos" => $codigos]);
        
    } else {
        // echo json_encode(["error" => "Método no permitido"]);
        Utils::responder(false, "Método no permitido");
    }
} catch (PDOException $error) {
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
}
?>
