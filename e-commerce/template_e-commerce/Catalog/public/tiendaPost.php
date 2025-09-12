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
$rutaweb = $_ENV['RUTA_WEB'];
$mensaje = "";

try {
    $dsn = "mysql:host=$servidor;dbname=$dbname";
    $conexion = new PDO($dsn, $usuario, $contrasena);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Depuración: Mostrar los datos recibidos
        error_log(print_r($_POST, true));
        error_log(print_r($_FILES, true));
      
        $nombre = $_POST['nombre'];
        $telefono = $_POST['telefono'];
        $email = $_POST['email'];
        $eslogan = $_POST['eslogan'];
        $direccion = $_POST['direccion'];
        $facebook = $_POST['facebook'];
        $instagram = $_POST['instagram'];

        if (!empty($telefono) && !empty($nombre) && !empty($direccion)) {
            $imagenesPresentes = isset($_FILES['imagen1']) || isset($_FILES['imagen2']);
            
            if ($imagenesPresentes) {
                $carpetaImagenes = './imagenes_tienda';
                if (!file_exists($carpetaImagenes)) {
                    mkdir($carpetaImagenes, 0777, true);
                }

                $rutaImagenCompleta1 = '';
                $rutaImagenCompleta2 = '';
             
                if (isset($_FILES['imagen1']) && $_FILES['imagen1']['error'] === UPLOAD_ERR_OK) {
                    $nombreImagen1 = $_FILES['imagen1']['name'];
                    $rutaImagen1 = $carpetaImagenes . '/' . $nombreImagen1;
                    move_uploaded_file($_FILES['imagen1']['tmp_name'], $rutaImagen1);
                    $rutaImagenCompleta1 = $rutaweb . $rutaImagen1;
                }

                if ($rutaImagenCompleta1 === '' && $rutaImagenCompleta2 === '') {
                    echo json_encode(["error" => "Debe seleccionar al menos una imagen"]);
                    exit;
                }

                $sqlInsert = "INSERT INTO `tienda` (nombre, telefono, email, direccion, facebook, instagram, imagen1, eslogan) 
                VALUES (:nombre, :telefono, :email, :direccion, :facebook, :instagram, :imagen1, :eslogan)";
                $stmt = $conexion->prepare($sqlInsert);
                $stmt->bindParam(':imagen1', $rutaImagenCompleta1);
                $stmt->bindParam(':nombre', $nombre);
                $stmt->bindParam(':telefono', $telefono);
                $stmt->bindParam(':email', $email);
                $stmt->bindParam(':direccion', $direccion);
                $stmt->bindParam(':facebook', $facebook);
                $stmt->bindParam(':instagram', $instagram);
                $stmt->bindParam(':eslogan', $eslogan);
                $stmt->execute();

                $lastId = $conexion->lastInsertId();
                $sqlSelect = "SELECT createdAt FROM `tienda` WHERE idTienda = :lastId";
                $stmtSelect = $conexion->prepare($sqlSelect);
                $stmtSelect->bindParam(':lastId', $lastId);
                $stmtSelect->execute();
                $createdAt = $stmtSelect->fetchColumn();

                echo json_encode([
                    "mensaje" => "Tienda creada exitosamente",
                    "imagen1" => $rutaImagenCompleta1,
                    "imagen2" => $rutaImagenCompleta2,
                    "createdAt" => $createdAt
                ]);
            } else {
                echo json_encode(["error" => "Debe seleccionar al menos una imagen"]);
            }
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
