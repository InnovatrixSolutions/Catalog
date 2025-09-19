<?php
// header("Content-Type: application/json");
// header('Access-Control-Allow-Origin: *');
// header('Access-Control-Allow-Methods: POST, OPTIONS');
// header('Access-Control-Allow-Headers: Content-Type');

// Cargar variables de entorno desde el archivo .env
require __DIR__.'/vendor/autoload.php';
require_once 'cors_headers.php';
require_once 'Utils.php';

// Manejo de solicitudes OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}


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

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $datos = $_POST['datos'];
        $tipo = $_POST['tipo'];
        $estado = $_POST['estado'];

        if (!empty($tipo) && !empty($estado)) {
            // Proceder con la inserción en la tabla `metodos`
            $sqlInsert = "INSERT INTO `metodos` (datos, tipo, estado) VALUES (:datos, :tipo, :estado)";
            $stmt = $conexion->prepare($sqlInsert);
            $stmt->bindParam(':datos', $datos);
            $stmt->bindParam(':tipo', $tipo);
            $stmt->bindParam(':estado', $estado);

            $stmt->execute();

            // Obtener el ID de la última inserción
            $lastId = $conexion->lastInsertId();

            // Respuesta JSON con el mensaje y el ID del nuevo registro
            echo json_encode([
                "mensaje" => "Método creado exitosamente",
                "idMetodo" => $lastId
            ]);
        } else {
            echo json_encode(["error" => "Por favor, complete todos los campos correctamente"]);
        }
    } else {
        echo json_encode(["error" => "Método no permitido"]);
    }
} catch (PDOException $error) {
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
}
?>
