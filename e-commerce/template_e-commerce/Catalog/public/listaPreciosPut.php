<?php
require __DIR__.'/vendor/autoload.php';
require_once 'cors_headers.php';
require_once 'Utils.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

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

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(["error" => "Método no permitido"]);
        exit;
    }

    $idListaPrecio = $_POST['idListaPrecio'] ?? null;
    $precio = $_POST['precio'] ?? null;

    if (!$idListaPrecio || !is_numeric($idListaPrecio)) {
        echo json_encode(["error" => "idListaPrecio inválido"]);
        exit;
    }

    if ($precio === null || $precio === '' || !is_numeric($precio) || $precio < 0) {
        echo json_encode(["error" => "precio inválido"]);
        exit;
    }

    // Verificar existe
    $stmt = $conexion->prepare("SELECT COUNT(*) FROM lista_precios WHERE idListaPrecio = :id");
    $stmt->execute([":id" => (int)$idListaPrecio]);
    if ((int)$stmt->fetchColumn() === 0) {
        echo json_encode(["error" => "Registro no encontrado"]);
        exit;
    }

    // Update SOLO precio
    $stmt = $conexion->prepare("UPDATE lista_precios SET precio = :precio WHERE idListaPrecio = :id");
    $stmt->execute([
        ":precio" => $precio,
        ":id" => (int)$idListaPrecio
    ]);

    echo json_encode(["mensaje" => "Precio actualizado exitosamente"]);

} catch (PDOException $e) {
    echo json_encode(["error" => "Error de conexión: " . $e->getMessage()]);
}
