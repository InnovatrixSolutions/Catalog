<?php
// Test script to directly update order 184 and recalculate commission
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
    $costoEnvio = 32450;

    echo json_encode(["message" => "Starting test for order $idPedido with shipping cost $costoEnvio"]) . "\n\n";

    // 1. Update pedidos table
    $stmt = $conexion->prepare("UPDATE pedidos SET costo_envio = :costo_envio WHERE idPedido = :idPedido");
    $result = $stmt->execute([
        ':costo_envio' => $costoEnvio,
        ':idPedido' => $idPedido
    ]);

    echo json_encode(["step" => 1, "message" => "Updated pedidos table", "success" => $result]) . "\n";

    // 2. Get asesor relation
    $stmtAsesor = $conexion->prepare("
        SELECT idRelacion as idPedidoAsesor, base_calculo, total_cupon, valor_pedido 
        FROM pedido_asesores 
        WHERE idPedido = :idPedido 
        LIMIT 1
    ");
    $stmtAsesor->execute([':idPedido' => $idPedido]);
    $relacion = $stmtAsesor->fetch(PDO::FETCH_ASSOC);

    if (!$relacion) {
        echo json_encode(["error" => "No asesor relation found for order $idPedido"]) . "\n";
        exit;
    }

    echo json_encode(["step" => 2, "message" => "Found asesor relation", "data" => $relacion]) . "\n";

    // 3. Calculate new commission
    $valorPedidoDb = (float) $relacion['valor_pedido'];
    $totalCuponDb = (float) $relacion['total_cupon'];
    $costoBaseDropshipper = (float) $relacion['base_calculo'];
    
    $ingresoNeto = $valorPedidoDb - $costoEnvio - $totalCuponDb;
    $nuevaComision = max(0, $ingresoNeto - $costoBaseDropshipper);

    echo json_encode([
        "step" => 3,
        "message" => "Calculated new commission",
        "calculation" => [
            "valor_pedido" => $valorPedidoDb,
            "costo_envio" => $costoEnvio,
            "total_cupon" => $totalCuponDb,
            "base_calculo" => $costoBaseDropshipper,
            "ingreso_neto" => $ingresoNeto,
            "nueva_comision" => $nuevaComision
        ]
    ]) . "\n";

    // 4. Update pedido_asesores
    $stmtUpdateCom = $conexion->prepare("
        UPDATE pedido_asesores 
        SET 
            valor_envio = :nuevoEnvio,
            comision_valor = :nuevaComision,
            valor_a_pagar_asesor = :nuevaComision
        WHERE idRelacion = :idRelacion
    ");
    
    $updateResult = $stmtUpdateCom->execute([
        ':nuevoEnvio' => $costoEnvio,
        ':nuevaComision' => $nuevaComision,
        ':idRelacion' => $relacion['idPedidoAsesor']
    ]);

    echo json_encode([
        "step" => 4,
        "message" => "Updated pedido_asesores",
        "success" => $updateResult,
        "rows_affected" => $stmtUpdateCom->rowCount()
    ]) . "\n";

    // 5. Verify the update
    $stmtVerify = $conexion->prepare("
        SELECT valor_envio, comision_valor, valor_a_pagar_asesor
        FROM pedido_asesores 
        WHERE idPedido = :idPedido
    ");
    $stmtVerify->execute([':idPedido' => $idPedido]);
    $verified = $stmtVerify->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        "step" => 5,
        "message" => "Verification",
        "current_values" => $verified,
        "expected_comision" => $nuevaComision,
        "match" => (abs($verified['comision_valor'] - $nuevaComision) < 0.01)
    ]) . "\n";

} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]) . "\n";
}
