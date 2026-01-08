<?php
require __DIR__ . '/vendor/autoload.php';
use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

$servidor = $_ENV['DB_HOST'] . ':' . $_ENV['DB_PORT'];
$usuario = $_ENV['DB_USER'];
$contrasena = $_ENV['DB_PASS'];
$dbname = $_ENV['DB_NAME'];

header('Content-Type: text/plain');

try {
    $dsn = "mysql:host=$servidor;dbname=$dbname";
    $conexion = new PDO($dsn, $usuario, $contrasena);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $idPedido = 184; // The problematic order
    $nuevoCostoEnvio = 27000; // The value we think we are setting

    echo "--- Debugging Order $idPedido ---\n";
    echo "Simulating update with costo_envio = $nuevoCostoEnvio\n\n";

    // 1. Fetch current data from pedido_asesores
    $stmt = $conexion->prepare("
        SELECT *
        FROM pedido_asesores 
        WHERE idPedido = :idPedido 
    ");
    $stmt->execute([':idPedido' => $idPedido]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "Found " . count($rows) . " rows in pedido_asesores for this order.\n";

    foreach ($rows as $row) {
        echo "Row ID: " . $row['idPedidoAsesor'] . "\n";
        echo "  valor_pedido (Venta): " . $row['valor_pedido'] . "\n";
        echo "  base_calculo (Costo Dropshipper): " . $row['base_calculo'] . "\n";
        echo "  total_cupon: " . $row['total_cupon'] . "\n";
        echo "  valor_envio (Current in DB): " . $row['valor_envio'] . "\n";
        echo "  comision_valor (Current in DB): " . $row['comision_valor'] . "\n";
        
        // Manual Calc
        $valorPedidoDb = (float) $row['valor_pedido'];
        $totalCuponDb = (float) $row['total_cupon'];
        $costoBaseDropshipper = (float) $row['base_calculo'];
        
        $ingresoNeto = $valorPedidoDb - $nuevoCostoEnvio - $totalCuponDb;
        $nuevaComision = max(0, $ingresoNeto - $costoBaseDropshipper);
        
        echo "\n  --- Calculation ---\n";
        echo "  Ingreso Neto = $valorPedidoDb - $nuevoCostoEnvio - $totalCuponDb = $ingresoNeto\n";
        echo "  Nueva Comision = $ingresoNeto - $costoBaseDropshipper = $nuevaComision\n";
        
        echo "  EXPECTED DB UPDATE: comision_valor -> $nuevaComision\n";
        echo "------------------------------------------------\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
