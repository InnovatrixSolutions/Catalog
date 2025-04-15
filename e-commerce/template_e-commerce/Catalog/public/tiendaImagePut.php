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
$rutaweb = $_ENV['RUTA_WEB'];
$mensaje = "";
$carpetaImagenes = './imagenes_tienda'; // Cambia la ruta de la carpeta

try {
    $dsn = "mysql:host=$servidor;dbname=$dbname";
    $conexion = new PDO($dsn, $usuario, $contrasena);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $idTienda = isset($_REQUEST['idTienda']) ? $_REQUEST['idTienda'] : null;

        if (!$idTienda) {
            echo json_encode(["error" => "Se requiere proporcionar un ID de tienda para actualizar las imágenes."]);
            exit;
        }

        // Manejo de imagen1
        $nombreImagen1 = isset($_FILES['imagen1']) ? $_FILES['imagen1']['name'] : '';
        $rutaImagen1Completa = '';
        if (!empty($nombreImagen1)) {
            $rutaImagen1 = $carpetaImagenes . '/' . $nombreImagen1;
            if (move_uploaded_file($_FILES['imagen1']['tmp_name'], $rutaImagen1)) {
                $rutaImagen1Completa = $rutaweb . $rutaImagen1;
            } else {
                echo json_encode(["error" => "Error al mover el archivo de imagen1"]);
                exit;
            }
        }

      
        $sqlSelect = "SELECT imagen1 FROM tienda WHERE idTienda = :idTienda";
        $sentenciaSelect = $conexion->prepare($sqlSelect);
        $sentenciaSelect->bindParam(':idTienda', $idTienda, PDO::PARAM_INT);
        $sentenciaSelect->execute();
        $valoresActuales = $sentenciaSelect->fetch(PDO::FETCH_ASSOC);

        $rutaImagen1Completa = $rutaImagen1Completa ?: $valoresActuales['imagen1'];

        $sqlUpdate = "UPDATE tienda SET imagen1 = :imagen1 WHERE idTienda = :idTienda";
        $sentenciaUpdate = $conexion->prepare($sqlUpdate);
        $sentenciaUpdate->bindParam(':imagen1', $rutaImagen1Completa);
        $sentenciaUpdate->bindParam(':idTienda', $idTienda, PDO::PARAM_INT);

        if ($sentenciaUpdate->execute()) {
            echo json_encode(["mensaje" => "Imágenes actualizadas correctamente"]);
        } else {
            echo json_encode(["error" => "Error al actualizar las imágenes: " . implode(", ", $sentenciaUpdate->errorInfo())]);
        }
        exit;
    }
} catch (PDOException $error) {
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
}
?>
