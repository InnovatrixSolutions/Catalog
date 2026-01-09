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
$rutaweb = $_ENV['RUTA_WEB'];
$mensaje = "";
$carpetaImagenes = './imagenes_productos'; // Cambia la ruta de la carpeta

try {
    $dsn = "mysql:host=$servidor;dbname=$dbname";
    $conexion = new PDO($dsn, $usuario, $contrasena);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $idProducto = isset($_REQUEST['idProducto']) ? $_REQUEST['idProducto'] : null;

    
        if (!$idProducto) {
            echo json_encode(["error" => "Se requiere proporcionar un ID de producto para actualizar las imágenes."]);
            exit;
        }

        $nombreImagen1 = $_FILES['imagen1']['name'];
        $rutaImagen1Completa = null;
        if (!empty($nombreImagen1)) {
            $rutaImagen1 = $carpetaImagenes . '/' . $nombreImagen1;
            if (move_uploaded_file($_FILES['imagen1']['tmp_name'], $rutaImagen1)) {
                $rutaImagen1Completa = $rutaweb . $rutaImagen1;
            } else {
                echo json_encode(["error" => "Error al mover el archivo de imagen1"]);
                exit;
            }
        } elseif (isset($_POST['imagen1_url'])) {
            $rutaImagen1Completa = $_POST['imagen1_url'];
        }

        $nombreImagen2 = $_FILES['imagen2']['name'];
        $rutaImagen2Completa = null;
        if (!empty($nombreImagen2)) {
            $rutaImagen2 = $carpetaImagenes . '/' . $nombreImagen2;
            if (move_uploaded_file($_FILES['imagen2']['tmp_name'], $rutaImagen2)) {
                $rutaImagen2Completa = $rutaweb . $rutaImagen2;
            } else {
                echo json_encode(["error" => "Error al mover el archivo de imagen2"]);
                exit;
            }
        } elseif (isset($_POST['imagen2_url'])) {
            $rutaImagen2Completa = $_POST['imagen2_url'];
        }

        $nombreImagen3 = $_FILES['imagen3']['name'];
        $rutaImagen3Completa = null;
        if (!empty($nombreImagen3)) {
            $rutaImagen3 = $carpetaImagenes . '/' . $nombreImagen3;
            if (move_uploaded_file($_FILES['imagen3']['tmp_name'], $rutaImagen3)) {
                $rutaImagen3Completa = $rutaweb . $rutaImagen3;
            } else {
                echo json_encode(["error" => "Error al mover el archivo de imagen3"]);
                exit;
            }
        } elseif (isset($_POST['imagen3_url'])) {
            $rutaImagen3Completa = $_POST['imagen3_url'];
        }

        $nombreImagen4 = $_FILES['imagen4']['name'];
        $rutaImagen4Completa = null;
        if (!empty($nombreImagen4)) {
            $rutaImagen4 = $carpetaImagenes . '/' . $nombreImagen4;
            if (move_uploaded_file($_FILES['imagen4']['tmp_name'], $rutaImagen4)) {
                $rutaImagen4Completa = $rutaweb . $rutaImagen4;
            } else {
                echo json_encode(["error" => "Error al mover el archivo de imagen4"]);
                exit;
            }
        } elseif (isset($_POST['imagen4_url'])) {
            $rutaImagen4Completa = $_POST['imagen4_url'];
        }

        $sqlSelect = "SELECT imagen1, imagen2, imagen3, imagen4 FROM productos WHERE idProducto = :idProducto"; // Cambia de publicaciones a productos
        $sentenciaSelect = $conexion->prepare($sqlSelect);
        $sentenciaSelect->bindParam(':idProducto', $idProducto, PDO::PARAM_INT);
        $sentenciaSelect->execute();
        $valoresActuales = $sentenciaSelect->fetch(PDO::FETCH_ASSOC);
    
        // Si es NULL, entonces conservamos el valor actual (no mandaron nada para esta posición??)
        // Ojo: Si el usuario mandó string vacío, $rutaImagenXCompleta es '', así que NO entra aquí, y se guardará vacío (borrado).
        if ($rutaImagen1Completa === null) $rutaImagen1Completa = $valoresActuales['imagen1'];
        if ($rutaImagen2Completa === null) $rutaImagen2Completa = $valoresActuales['imagen2'];
        if ($rutaImagen3Completa === null) $rutaImagen3Completa = $valoresActuales['imagen3'];
        if ($rutaImagen4Completa === null) $rutaImagen4Completa = $valoresActuales['imagen4'];

        $sqlUpdate = "UPDATE productos SET imagen1 = :imagen1, imagen2 = :imagen2, imagen3 = :imagen3, imagen4 = :imagen4 WHERE idProducto = :idProducto"; // Cambia de publicaciones a productos
        $sentenciaUpdate = $conexion->prepare($sqlUpdate);
        $sentenciaUpdate->bindParam(':imagen1', $rutaImagen1Completa);
        $sentenciaUpdate->bindParam(':imagen2', $rutaImagen2Completa);
        $sentenciaUpdate->bindParam(':imagen3', $rutaImagen3Completa);
        $sentenciaUpdate->bindParam(':imagen4', $rutaImagen4Completa);
        $sentenciaUpdate->bindParam(':idProducto', $idProducto, PDO::PARAM_INT);
    
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

