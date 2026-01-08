<?php
// Debug script to check field values for order 184
require __DIR__ . '/vendor/autoload.php';
use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

$servidor = $_ENV['DB_HOST'] . ':' . $_ENV['DB_PORT'];
$usuario = $_ENV['DB_USER'];
$contrasena = $_ENV['DB_PASS'];
$dbname = $_ENV['DB_NAME'];

header('Content-Type: application/json');

try {
    $dsn = "mysql:host=$servidor;dbname=$dbname";
    $conexion = new PDO($dsn, $usuario, $contrasena);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $idPedido = 184;

    echo "=== FIELD VALUES FOR ORDER $idPedido ===\n\n";

    // 1. Check pedidos table
    $stmt1 = $conexion->prepare("SELECT idPedido, costo_envio FROM pedidos WHERE idPedido = :idPedido");
    $stmt1->execute([':idPedido' => $idPedido]);
    $pedido = $stmt1->fetch(PDO::FETCH_ASSOC);

    echo "1. PEDIDOS TABLE:\n";
    echo json_encode($pedido, JSON_PRETTY_PRINT) . "\n\n";

    // 2. Check pedido_asesores table
    $stmt2 = $conexion->prepare("
        SELECT 
            idPedidoAsesor, 
            idPedido, 
            valor_envio, 
            comision_valor, 
            valor_a_pagar_asesor,
            base_calculo,
            valor_pedido,
            total_cupon
        FROM pedido_asesores 
        WHERE idPedido = :idPedido
    ");
    $stmt2->execute([':idPedido' => $idPedido]);
    $asesor = $stmt2->fetch(PDO::FETCH_ASSOC);

    echo "2. PEDIDO_ASESORES TABLE:\n";
    echo json_encode($asesor, JSON_PRETTY_PRINT) . "\n\n";

    // 3. Simulate what pedidoAsesoresGet.php returns
    $stmt3 = $conexion->prepare("
        SELECT 
            pa.valor_envio,
            p.costo_envio,
            pa.comision_valor,
            pa.valor_a_pagar_asesor
        FROM pedido_asesores pa
        LEFT JOIN pedidos p ON p.idPedido = pa.idPedido
        WHERE pa.idPedido = :idPedido
    ");
    $stmt3->execute([':idPedido' => $idPedido]);
    $combined = $stmt3->fetch(PDO::FETCH_ASSOC);

    echo "3. COMBINED QUERY (like pedidoAsesoresGet.php):\n";
    echo json_encode($combined, JSON_PRETTY_PRINT) . "\n\n";

    // 4. Check if values match
    echo "4. COMPARISON:\n";
    echo "   pedidos.costo_envio = " . $pedido['costo_envio'] . "\n";
    echo "   pedido_asesores.valor_envio = " . $asesor['valor_envio'] . "\n";
    echo "   Match? " . ($pedido['costo_envio'] == $asesor['valor_envio'] ? "YES ✓" : "NO ✗") . "\n\n";

    // 5. Calculate what commission SHOULD be
    $valorPedido = (float) $asesor['valor_pedido'];
    $costoEnvio = (float) $pedido['costo_envio'];
    $totalCupon = (float) $asesor['total_cupon'];
    $baseCalculo = (float) $asesor['base_calculo'];
    
    $ingresoNeto = $valorPedido - $costoEnvio - $totalCupon;
    $comisionEsperada = max(0, $ingresoNeto - $baseCalculo);

    echo "5. EXPECTED COMMISSION CALCULATION:\n";
    echo "   valor_pedido: $valorPedido\n";
    echo "   costo_envio (from pedidos): $costoEnvio\n";
    echo "   total_cupon: $totalCupon\n";
    echo "   base_calculo: $baseCalculo\n";
    echo "   ingreso_neto: $ingresoNeto\n";
    echo "   Expected commission: $comisionEsperada\n";
    echo "   Actual commission in DB: " . $asesor['comision_valor'] . "\n";
    echo "   Match? " . (abs($comisionEsperada - $asesor['comision_valor']) < 0.01 ? "YES ✓" : "NO ✗") . "\n";

} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]) . "\n";
}
