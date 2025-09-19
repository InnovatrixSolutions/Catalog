<?php
require_once 'cors_headers.php';
require_once 'Utils.php';

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
        $idBanner = isset($_GET['idBanner']) ? $_GET['idBanner'] : null;
        $input = json_decode(file_get_contents('php://input'), true);
        $nuevoSeleccion = isset($input['seleccion']) ? $input['seleccion'] : null;

        // Validar que se haya proporcionado un id de banner y un valor para seleccion
        if ($idBanner && $nuevoSeleccion) {
            // Si el nuevo valor de seleccion es "Si", desactivar cualquier otro "Si" existente
            if ($nuevoSeleccion === 'Si') {
                $sqlResetSeleccion = "UPDATE banner SET seleccion = 'No' WHERE seleccion = 'Si'";
                $stmtReset = $conexion->prepare($sqlResetSeleccion);
                $stmtReset->execute();
            }

            // Actualizar el campo seleccion del banner específico
            $sqlUpdate = "UPDATE banner SET seleccion = :seleccion WHERE idBanner = :idBanner";
            $stmtUpdate = $conexion->prepare($sqlUpdate);
            $stmtUpdate->bindParam(':seleccion', $nuevoSeleccion);
            $stmtUpdate->bindParam(':idBanner', $idBanner, PDO::PARAM_INT);

            if ($stmtUpdate->execute()) {
                echo json_encode(["mensaje" => "Banner actualizado correctamente", "seleccion" => $nuevoSeleccion]);
            } else {
                echo json_encode(["error" => "Error al actualizar el banner: " . implode(", ", $stmtUpdate->errorInfo())]);
            }
        } else {
            echo json_encode(["error" => "Se requiere un id de banner y un valor para seleccion para actualizar."]);
        }
        exit;
    }
} catch (PDOException $error) {
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
}
?>
