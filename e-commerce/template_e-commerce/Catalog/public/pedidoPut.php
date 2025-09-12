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
$mensaje = "";

try {
    $dsn = "mysql:host=$servidor;dbname=$dbname";
    $conexion = new PDO($dsn, $usuario, $contrasena);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        $idPedido = isset($_GET['idPedido']) ? $_GET['idPedido'] : null;
        $data = json_decode(file_get_contents("php://input"), true);
        $nuevoEstado = isset($data['estado']) ? $data['estado'] : null;
        $pagado = isset($data['pagado']) ? $data['pagado'] : null; // Captura el campo pagado

        // Validar que se haya proporcionado un ID de pedido, un nuevo estado y el campo pagado
        if ($idPedido && $nuevoEstado !== null && $pagado !== null) {
            // Actualizar el estado del pedido y el campo pagado
            $sqlUpdatePedido = "UPDATE pedidos SET estado = :estado, pagado = :pagado WHERE idPedido = :idPedido";
            $sentenciaUpdatePedido = $conexion->prepare($sqlUpdatePedido);
            $sentenciaUpdatePedido->bindParam(':estado', $nuevoEstado);
            $sentenciaUpdatePedido->bindParam(':pagado', $pagado); 
            $sentenciaUpdatePedido->bindParam(':idPedido', $idPedido, PDO::PARAM_INT);

            if ($sentenciaUpdatePedido->execute()) {
                echo json_encode(["mensaje" => "Estado del pedido y campo pagado actualizados correctamente"]);
            } else {
                echo json_encode(["error" => "Error al actualizar el pedido: " . implode(", ", $sentenciaUpdatePedido->errorInfo())]);
            }
        } else {
            echo json_encode(["error" => "ID de pedido, estado o campo pagado no proporcionados"]);
        }
        exit;
    }
} catch (PDOException $error) {
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
}
?>
