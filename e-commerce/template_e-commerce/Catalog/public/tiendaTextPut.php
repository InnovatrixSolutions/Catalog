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
        $idTienda = isset($_REQUEST['idTienda']) ? $_REQUEST['idTienda'] : null;
        $data = json_decode(file_get_contents("php://input"), true);

        $nuevoNombre = isset($data['nuevoNombre']) ? $data['nuevoNombre'] : null;
        $nuevoTelefono = isset($data['nuevoTelefono']) ? $data['nuevoTelefono'] : null;
        $nuevoEmail = isset($data['nuevoEmail']) ? $data['nuevoEmail'] : null;
        $nuevoEslogan = isset($data['nuevoEslogan']) ? $data['nuevoEslogan'] : null;
        $nuevaDireccion = isset($data['nuevaDireccion']) ? $data['nuevaDireccion'] : null;
        $nuevoFacebook = isset($data['nuevoFacebook']) ? $data['nuevoFacebook'] : null;
        $nuevoInstagram = isset($data['nuevoInstagram']) ? $data['nuevoInstagram'] : null;

        // Verificar que el ID de la tienda no esté vacío
        if (empty($idTienda)) {
            echo json_encode(["error" => "ID de tienda es obligatorio"]);
            exit;
        }

        // Construir la consulta SQL de actualización
        $sqlUpdate = "UPDATE tienda SET 
            nombre = :nombre, 
            telefono = :telefono, 
            email = :email,
            eslogan = :eslogan,
            direccion = :direccion,
            facebook = :facebook,
            instagram = :instagram
        WHERE idTienda = :idTienda";

        $sentenciaUpdate = $conexion->prepare($sqlUpdate);
        $sentenciaUpdate->bindParam(':nombre', $nuevoNombre);
        $sentenciaUpdate->bindParam(':telefono', $nuevoTelefono);
        $sentenciaUpdate->bindParam(':email', $nuevoEmail);
        $sentenciaUpdate->bindParam(':eslogan', $nuevoEslogan);
        $sentenciaUpdate->bindParam(':direccion', $nuevaDireccion);
        $sentenciaUpdate->bindParam(':facebook', $nuevoFacebook);
        $sentenciaUpdate->bindParam(':instagram', $nuevoInstagram);
        $sentenciaUpdate->bindParam(':idTienda', $idTienda, PDO::PARAM_INT);

        // Ejecutar la consulta y verificar el resultado
        if ($sentenciaUpdate->execute()) {
            echo json_encode(["mensaje" => "Tienda actualizada correctamente"]);
        } else {
            echo json_encode(["error" => "Error al actualizar la tienda: " . implode(", ", $sentenciaUpdate->errorInfo())]);
        }
        exit;
    }
} catch (PDOException $error) {
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
}
?>
