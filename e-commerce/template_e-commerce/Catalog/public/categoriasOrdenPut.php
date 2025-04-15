<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejo de solicitudes OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

// Cargar variables de entorno desde el archivo .env
require __DIR__.'/vendor/autoload.php';
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
        // Obtener los IDs de las categorías y el nuevo orden desde el cuerpo de la solicitud
        $data = json_decode(file_get_contents("php://input"), true);
        $idCategoria1 = isset($data['idCategoria1']) ? $data['idCategoria1'] : null;
        $idCategoria2 = isset($data['idCategoria2']) ? $data['idCategoria2'] : null;
        $nuevoOrden1 = isset($data['nuevoOrden1']) ? $data['nuevoOrden1'] : null;
        $nuevoOrden2 = isset($data['nuevoOrden2']) ? $data['nuevoOrden2'] : null;

        // Validar los parámetros
        if (!$idCategoria1 || !$idCategoria2 || !$nuevoOrden1 || !$nuevoOrden2) {
            echo json_encode(["error" => "Se requieren dos IDs de categoría y sus respectivos nuevos órdenes."]);
            exit;
        }

        // Iniciar la transacción
        $conexion->beginTransaction();

        // Actualizar el orden de la primera categoría
        $sqlUpdate1 = "UPDATE categorias SET orden = :nuevoOrden1 WHERE idCategoria = :idCategoria1";
        $stmtUpdate1 = $conexion->prepare($sqlUpdate1);
        $stmtUpdate1->bindParam(':nuevoOrden1', $nuevoOrden1, PDO::PARAM_INT);
        $stmtUpdate1->bindParam(':idCategoria1', $idCategoria1, PDO::PARAM_INT);

        // Actualizar el orden de la segunda categoría
        $sqlUpdate2 = "UPDATE categorias SET orden = :nuevoOrden2 WHERE idCategoria = :idCategoria2";
        $stmtUpdate2 = $conexion->prepare($sqlUpdate2);
        $stmtUpdate2->bindParam(':nuevoOrden2', $nuevoOrden2, PDO::PARAM_INT);
        $stmtUpdate2->bindParam(':idCategoria2', $idCategoria2, PDO::PARAM_INT);

        // Ejecutar las actualizaciones
        if ($stmtUpdate1->execute() && $stmtUpdate2->execute()) {
            // Confirmar la transacción
            $conexion->commit();
            echo json_encode(["mensaje" => "Órdenes actualizadas correctamente"]);
        } else {
            // Revertir la transacción en caso de error
            $conexion->rollBack();
            echo json_encode(["error" => "Error al actualizar los órdenes."]);
        }

        exit;
    }
} catch (PDOException $error) {
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
}
?>
