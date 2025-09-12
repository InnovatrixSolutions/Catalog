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

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

$servidor = $_ENV['DB_HOST'] . ':' . $_ENV['DB_PORT'];
$usuario = $_ENV['DB_USER'];
$contrasena = $_ENV['DB_PASS'];
$dbname = $_ENV['DB_NAME'];

try {
    $dsn = "mysql:host=$servidor;dbname=$dbname";
    $conexion = new PDO($dsn, $usuario, $contrasena);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Recibir los campos desde el frontend
        $codigo = $_POST['codigo'];
        $descuento = $_POST['descuento'];
        $tipo = $_POST['tipo'];
        $desde = $_POST['desde'];
        $hasta = $_POST['hasta'];
        $limite = $_POST['limite'];
        $productos = json_decode($_POST['productos'], true);
        $idCategoria = $_POST['idCategoria'];
        // Validar que el código no esté vacío
        if (!empty($codigo) && !empty($tipo) && !empty($desde) && !empty($hasta)) {
            // Verificar si el código ya existe
            $sqlCheck = "SELECT idCodigo FROM `codigos` WHERE codigo = :codigo";
            $stmtCheck = $conexion->prepare($sqlCheck);
            $stmtCheck->bindParam(':codigo', $codigo);
            $stmtCheck->execute();

            if ($stmtCheck->rowCount() > 0) {
                // El código ya existe, devolver un error
                echo json_encode(["error" => "El código ya existe"]);
            } else {
                // Inserción en la base de datos con todos los campos
                $sqlInsert = "INSERT INTO `codigos` (codigo, descuento, tipo, desde, hasta, limite, productos,idCategoria) 
                              VALUES (:codigo, :descuento, :tipo, :desde, :hasta, :limite, :productos,:idCategoria)";
                $stmt = $conexion->prepare($sqlInsert);
                $stmt->bindParam(':codigo', $codigo);
                $stmt->bindParam(':descuento', $descuento);
                $stmt->bindParam(':tipo', $tipo);
                $stmt->bindParam(':desde', $desde);
                $stmt->bindParam(':hasta', $hasta);
                $stmt->bindParam(':limite', $limite);
                $stmt->bindParam(':productos', $_POST['productos']);
                $stmt->bindParam(':idCategoria', $idCategoria);
                $stmt->execute();

                // Obtener el ID de la última inserción
                $lastId = $conexion->lastInsertId();

                // Respuesta JSON con ID del código creado
                echo json_encode([
                    "mensaje" => "Código creado exitosamente",
                    "idCodigo" => $lastId,
                    "codigo" => $codigo,
                    "descuento" => $descuento,
                    "tipo" => $tipo,
                    "desde" => $desde,
                    "hasta" => $hasta
                ]);
            }
        } else {
            echo json_encode(["error" => "Por favor, complete todos los campos"]);
        }
    } else {
        echo json_encode(["error" => "Método no permitido"]);
    }
} catch (PDOException $error) {
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
}
?>
