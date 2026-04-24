<?php
require __DIR__ . '/vendor/autoload.php';
use Dotenv\Dotenv;
$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

$servidor = $_ENV['DB_HOST'] . ':' . $_ENV['DB_PORT'];
$dbname = $_ENV['DB_NAME'];
$usuario = $_ENV['DB_USER'];
$contrasena = $_ENV['DB_PASS'];

try {
    $conn = new PDO("mysql:host=$servidor;dbname=$dbname", $usuario, $contrasena);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $stmt = $conn->query("SELECT tipo_pedido, COUNT(*) as count FROM pedidos GROUP BY tipo_pedido");
    echo "tipo_pedido\tcount\n";
    foreach($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        echo $row['tipo_pedido'] . "\t" . $row['count'] . "\n";
    }
} catch(Exception $e) {
    echo "Error: " . $e->getMessage();
}
