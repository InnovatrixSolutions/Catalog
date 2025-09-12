<?php
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
$rutaweb = $_ENV['RUTA_WEB'];
$mensaje = "";

try {
    $dsn = "mysql:host=$servidor;dbname=$dbname";
    $conexion = new PDO($dsn, $usuario, $contrasena);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Verificar si se envió la imagen
        if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
            // Crear carpeta para imágenes si no existe
            $carpetaImagenes = './imagenes_banners';
            if (!file_exists($carpetaImagenes)) {
                mkdir($carpetaImagenes, 0777, true);
            }

            // Inicializar ruta de la imagen
            $rutaImagenCompleta = '';

            // Subir la imagen
            $nombreImagen = $_FILES['imagen']['name'];
            $rutaImagen = $carpetaImagenes . '/' . $nombreImagen;
            move_uploaded_file($_FILES['imagen']['tmp_name'], $rutaImagen);
            $rutaImagenCompleta = $rutaweb . $rutaImagen;

            // Verificar si ya existen banners en la base de datos
            $sqlCount = "SELECT COUNT(*) FROM `banner`";
            $stmtCount = $conexion->prepare($sqlCount);
            $stmtCount->execute();
            $count = $stmtCount->fetchColumn();

            // Determinar el valor de 'seleccion'
            $seleccion = $count == 0 ? "Si" : "No";

            // Almacenar enlace completo y 'seleccion' en la base de datos
            $sqlInsert = "INSERT INTO `banner` (imagen, seleccion) VALUES (:imagen, :seleccion)";
            $stmt = $conexion->prepare($sqlInsert);
            $stmt->bindParam(':imagen', $rutaImagenCompleta);
            $stmt->bindParam(':seleccion', $seleccion);
            $stmt->execute();

            // Obtener el ID de la última inserción
            $lastId = $conexion->lastInsertId();

            // Obtener la fecha de creación actualizada
            $sqlSelect = "SELECT createdAt FROM `banner` WHERE idBanner = :lastId";
            $stmtSelect = $conexion->prepare($sqlSelect);
            $stmtSelect->bindParam(':lastId', $lastId);
            $stmtSelect->execute();
            $createdAt = $stmtSelect->fetchColumn();

            // Respuesta JSON con enlace de la imagen, fecha de creación y seleccion
            echo json_encode([
                "mensaje" => "Banner creado exitosamente",
                "imagen" => $rutaImagenCompleta,
                "createdAt" => $createdAt,
                "seleccion" => $seleccion
            ]);
        } else {
            echo json_encode(["error" => "Debe enviarse una imagen"]);
        }
    } else {
        echo json_encode(["error" => "Método no permitido"]);
    }
} catch (PDOException $error) {
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
}
?>
