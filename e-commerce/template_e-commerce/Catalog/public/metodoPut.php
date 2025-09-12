<?php
// header('Content-Type: application/json');
// header('Access-Control-Allow-Origin: *');
// header('Access-Control-Allow-Methods: PUT, OPTIONS');
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

    if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        $idMetodo = isset($_GET['idMetodo']) ? $_GET['idMetodo'] : null;
        $data = json_decode(file_get_contents("php://input"), true);
        $nuevoDato = $data['datos'] ?? null; // Datos puede ser opcional
        $nuevoTipo = $data['tipo'] ?? null;
        $nuevoEstado = $data['estado'] ?? null;

        // Validar que tipo y estado estén presentes
        if ($idMetodo && $nuevoTipo && $nuevoEstado) {
            $sqlUpdate = "UPDATE metodos SET datos = :datos, tipo = :tipo, estado = :estado WHERE idMetodo = :idMetodo";
            $sentenciaUpdate = $conexion->prepare($sqlUpdate);
            $sentenciaUpdate->bindParam(':datos', $nuevoDato);
            $sentenciaUpdate->bindParam(':tipo', $nuevoTipo);
            $sentenciaUpdate->bindParam(':estado', $nuevoEstado);
            $sentenciaUpdate->bindParam(':idMetodo', $idMetodo, PDO::PARAM_INT);

            if ($sentenciaUpdate->execute()) {
                echo json_encode(["mensaje" => "Método actualizado correctamente"]);
            } else {
                echo json_encode(["error" => "Error al actualizar el método: " . implode(", ", $sentenciaUpdate->errorInfo())]);
            }
        } else {
            echo json_encode(["error" => "Se requiere el tipo y estado para actualizar el método."]);
        }
        exit;
    }
} catch (PDOException $error) {
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
}
?>
