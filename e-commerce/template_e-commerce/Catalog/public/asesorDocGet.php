<?php
require __DIR__.'/vendor/autoload.php';
require_once 'cors_headers.php';
require_once 'Utils.php';

// Manejo de solicitudes OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

// fetch('http://localhost/api/endpoint.php', {
//   method: 'POST',
//   credentials: 'include',
//   headers: {
//     'Content-Type': 'application/json',
//     'X-API-KEY': 'miclave123'
//   },
//   body: JSON.stringify({ ... })
// });


use Dotenv\Dotenv;
$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

$servidor = $_ENV['DB_HOST'] . ':' . $_ENV['DB_PORT'];
$usuario = $_ENV['DB_USER'];
$contrasena = $_ENV['DB_PASS'];
$dbname = $_ENV['DB_NAME'];
// $apiKey = $_ENV['API_KEY'] ?? '';
// $validateSession = ($_ENV['SESSION_VALIDATE'] ?? 'true') === 'true';


// if (!isset($_SERVER['HTTP_X_API_KEY'])) {
//     file_put_contents('error.log', "Header X-API-KEY no recibido\n", FILE_APPEND);
//     Utils::responder(false, "No autorizado");
//     exit;
// }

// if ($_SERVER['HTTP_X_API_KEY'] !== $apiKey) {
//     $apiKey= $_SERVER['HTTP_X_API_KEY'] ;
//     file_put_contents('error.log', "Clave incorrecta: " .$apiKey. "\n", FILE_APPEND);
//     Utils::responder(false, "No autorizado");
//     exit;
// }

// if ($validateSession) {
//     session_start();
//     if (!isset($_SESSION['usuario_id'])) {
//         Utils::responder(false, "No autorizado. Inicia sesión primero.");
//         exit;
//     }
// }

try {
    $dsn = "mysql:host=$servidor;dbname=$dbname";
    $conexion = new PDO($dsn, $usuario, $contrasena);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // 1. Validar campos requeridos
        Utils::validarCampos($_POST);

        $doc_asesor = trim($_POST['doc_asesor']);
        $tipo_asesor = trim($_POST['tipo_asesor']);
        $pin_asesor = trim($_POST['pin_asesor']);

        // 2. Validaciones de formato
        Utils::validarDocumento($doc_asesor);
        Utils::validarTipo($tipo_asesor);
        Utils::validarPin($pin_asesor);

        // // 3. Buscar asesor
        $sql = "SELECT idAsesor,  tipo,documento, nombre_completo, 
                   telefono,telefono_whatsapp, 
                  medio_pago_comision,email, estado, fecha_registro, pin
                FROM asesores WHERE documento = :doc";

        $stmt = $conexion->prepare($sql);
        $stmt->execute([':doc' => $doc_asesor]);
        $asesor = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$asesor) {
            Utils::responder(false, "Documento no existe");
        }

        // 4. Validar PIN
        if ($asesor['pin'] !== $pin_asesor) {
            Utils::responder(false, "PIN incorrecto");
        }
        if (strtolower($asesor['tipo']) !== strtolower($tipo_asesor)) {
            Utils::responder(false, "Tipo de asesor incorrecto");
        }
        // 5. Todo OK, devolver datos
        unset($asesor['pin']); // Por seguridad, no enviar el PIN
        Utils::responder(true, "PIN correcto", $asesor);

        

    } else {
         Utils::responder(false, "Método no permitido");
    }
} catch (PDOException $error) {
    Utils::responder(false, "Error de base de datos: ", $error->getMessage());
    // responder(false, "Error de base de datos: " . $error->getMessage());
}
?>
