<?php
require __DIR__ . '/vendor/autoload.php';
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
    echo "--- TABLE: pedidos ---\n";
    $stmt = $conexion->query("SHOW COLUMNS FROM pedidos");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach($columns as $col) {
        echo $col['Field'] . "\t" . $col['Type'] . "\n";
    }

    echo "\n--- TABLE: pedido_asesores ---\n";
    $stmt = $conexion->query("SHOW COLUMNS FROM pedido_asesores");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach($columns as $col) {
        echo $col['Field'] . "\t" . $col['Type'] . "\n";
    }
} catch (Exception $e) {
    echo $e->getMessage();
}
