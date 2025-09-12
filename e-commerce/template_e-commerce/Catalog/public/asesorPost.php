<?php
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

function documentoExiste($conexion, $doc_asesor) {
    $sql = "SELECT COUNT(*) FROM asesores WHERE documento = :doc";
    $stmt = $conexion->prepare($sql);
    $stmt->bindValue(':doc', $doc_asesor, PDO::PARAM_STR);
    $stmt->execute();
    return $stmt->fetchColumn() > 0;
}

try {
    $dsn = "mysql:host=$servidor;dbname=$dbname";
    $conexion = new PDO($dsn, $usuario, $contrasena);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Recibir datos como multipart/form-data
        $doc_asesor = trim($_POST['doc_asesor'] ?? '');
        $pin_asesor = trim($_POST['pin_asesor'] ?? '');
        $tipo_asesor = trim($_POST['tipo'] ?? '');
        $nombre_asesor = trim($_POST['nombre_completo'] ?? '');
        $phone_asesor = trim($_POST['telefono_whatsapp'] ?? '');
        $email = trim($_POST['email'] ?? '');

        // Validar campos obligatorios según tabla
        $camposObligatorios = [
            'documento' => $doc_asesor,
            'pin' => $pin_asesor,
            'tipo' => $tipo_asesor,
            'nombre_completo' => $nombre_asesor,
            'telefono_whatsapp' => $phone_asesor,
            'email' => $email,
        ];

        foreach ($camposObligatorios as $campo => $valor) {
            if (empty($valor)) {
                echo json_encode(["error" => "El campo '$campo' es obligatorio"]);
                exit;
            }
        }

        // Validación de PIN (opcional)
        if (!empty($pin_asesor) && !preg_match('/^[a-zA-Z0-9]{8,10}$/', $pin_asesor)) {
            echo json_encode(["error" => "El PIN debe tener entre 8 y 10 caracteres alfanuméricos"]);
            exit;
        }

        // Validar documento único
        if (documentoExiste($conexion, $doc_asesor)) {
            echo json_encode(["error" => "El documento $doc_asesor ya está registrado"]);
            exit;
        }

        // Insertar datos
        $sqlInsert = "INSERT INTO asesores (documento, pin, tipo, nombre_completo, telefono_whatsapp, email)
                      VALUES (:doc, :pin, :tipo, :nombre, :phonewhatsapp, :email)";
        
        $stmt = $conexion->prepare($sqlInsert);
        $stmt->execute([
            ':doc' => $doc_asesor,
            ':pin' => !empty($pin_asesor) ? $pin_asesor : null,
            ':tipo' => $tipo_asesor, // Corregido: estaba usando $pin_asesor aquí
            ':nombre' => $nombre_asesor,
            ':phonewhatsapp' => $phone_asesor,
            ':email' => !empty($email) ? $email : null
        ]);

        echo json_encode(["mensaje" => "Asesor creado exitosamente"]);

    } else {
        echo json_encode(["error" => "Método no permitido"]);
    }
} catch (PDOException $error) {
    echo json_encode(["error" => "Error de base de datos: " . $error->getMessage()]);
}
?>
