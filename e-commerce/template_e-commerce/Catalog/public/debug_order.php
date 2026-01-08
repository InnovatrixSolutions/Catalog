<?php
require __DIR__.'/vendor/autoload.php';
use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

$servidor = $_ENV['DB_HOST'] . ':' . $_ENV['DB_PORT'];
$usuario = $_ENV['DB_USER'];
$contrasena = $_ENV['DB_PASS'];
$dbname = $_ENV['DB_NAME'];

try {
    $conexion = new PDO("mysql:host=$servidor;dbname=$dbname;charset=utf8mb4", $usuario, $contrasena);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $id = 184;

    echo "=== DIGNOSTICO PEDIDO $id ===\n";

    // 1. Datos en tabla PEDIDOS
    $stmt = $conexion->query("SELECT idPedido, costo_envio, estado, pagado FROM pedidos WHERE idPedido = $id");
    $pedido = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "TABLA PEDIDOS:\n";
    print_r($pedido);

    // 2. Datos en tabla PEDIDO_ASESORES
    $stmt2 = $conexion->query("SELECT idPedidoAsesor, valor_envio, base_calculo, comision_valor FROM pedido_asesores WHERE idPedido = $id");
    $asesor = $stmt2->fetch(PDO::FETCH_ASSOC);
    echo "\nTABLA PEDIDO_ASESORES (Comisiones):\n";
    print_r($asesor);

    if ($pedido['costo_envio'] > 0 && $asesor['valor_envio'] == 0) {
        echo "\n[ALERTA] Desincronizacion detectada: El pedido tiene envio pero la comision no lo refleja.\n";
    } elseif ($pedido['costo_envio'] == 0) {
         echo "\n[INFO] El pedido tiene costo_envio = 0 en la base de datos principal.\n";
    }

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
