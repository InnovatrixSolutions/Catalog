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
    
    $idPedido = 183;
    
    $stmt = $conexion->prepare("
        SELECT 
            p.costo_envio as pedido_costo_envio,
            pa.idRelacion, pa.valor_pedido, pa.total_cupon, pa.base_calculo, pa.valor_envio, pa.comision_valor, pa.valor_a_pagar_asesor
        FROM pedidos p
        LEFT JOIN pedido_asesores pa ON p.idPedido = pa.idPedido
        WHERE p.idPedido = :idPedido
    ");
    $stmt->execute([':idPedido' => $idPedido]);
    $data = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode($data, JSON_PRETTY_PRINT) . "\n";
    
} catch (Exception $e) {
    echo $e->getMessage();
}
