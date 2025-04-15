<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, PUT, OPTIONS');
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

    // Lógica para el método GET (obtener el primer estado en la tabla)
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Consulta para obtener el primer estado en la tabla
        $sqlSelect = "SELECT * FROM estado ORDER BY idEstado ASC LIMIT 1";
        $sentenciaSelect = $conexion->prepare($sqlSelect);

        if ($sentenciaSelect->execute()) {
            $resultado = $sentenciaSelect->fetch(PDO::FETCH_ASSOC);
            if ($resultado) {
                echo json_encode($resultado);
            } else {
                echo json_encode(["error" => "Estado no encontrado"]);
            }
        } else {
            echo json_encode(["error" => "Error al obtener el estado: " . implode(", ", $sentenciaSelect->errorInfo())]);
        }
        exit;
    }

    // Lógica para el método PUT (actualizar el primer estado en la tabla)
    if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        $data = json_decode(file_get_contents("php://input"), true);
        $nuevoEstado = isset($data['nuevoEstado']) ? $data['nuevoEstado'] : null;

        // Verificar que el nuevo estado no esté vacío
        if (empty($nuevoEstado)) {
            echo json_encode(["error" => "El nuevo estado es obligatorio"]);
            exit;
        }

        // Construir la consulta SQL de actualización para el primer estado en la tabla
        $sqlUpdate = "UPDATE estado SET estado = :estado WHERE idEstado = (
            SELECT idEstado FROM (SELECT idEstado FROM estado ORDER BY idEstado ASC LIMIT 1) AS subquery
        )";
        $sentenciaUpdate = $conexion->prepare($sqlUpdate);
        $sentenciaUpdate->bindParam(':estado', $nuevoEstado);

        // Ejecutar la consulta y verificar el resultado
        if ($sentenciaUpdate->execute()) {
            echo json_encode(["mensaje" => "Actualizado correctamente"]);
        } else {
            echo json_encode(["error" => "Error al actualizar: " . implode(", ", $sentenciaUpdate->errorInfo())]);
        }
        exit;
    }
} catch (PDOException $error) {
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
}
?>
