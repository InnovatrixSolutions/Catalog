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

    $idPedido = 184;

    echo "=== VERIFICATION SCRIPT FOR ORDER $idPedido ===\n\n";

    // 1. Check current state in pedido_asesores
    echo "--- Current State in pedido_asesores ---\n";
    $stmt = $conexion->prepare("
        SELECT 
            idPedidoAsesor,
            valor_pedido,
            base_calculo,
            total_cupon,
            valor_envio,
            comision_valor,
            valor_a_pagar_asesor
        FROM pedido_asesores 
        WHERE idPedido = :idPedido 
    ");
    $stmt->execute([':idPedido' => $idPedido]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($row) {
        echo "ID Relación: " . $row['idPedidoAsesor'] . "\n";
        echo "Valor Pedido: " . number_format($row['valor_pedido'], 2) . "\n";
        echo "Base Cálculo (Costo Dropshipper): " . number_format($row['base_calculo'], 2) . "\n";
        echo "Total Cupón: " . number_format($row['total_cupon'], 2) . "\n";
        echo "Valor Envío: " . number_format($row['valor_envio'], 2) . "\n";
        echo "Comisión Valor: " . number_format($row['comision_valor'], 2) . "\n";
        echo "Valor a Pagar Asesor: " . number_format($row['valor_a_pagar_asesor'], 2) . "\n\n";

        // 2. Calculate expected values
        echo "--- Expected Calculation ---\n";
        $valorPedido = (float) $row['valor_pedido'];
        $baseCalculo = (float) $row['base_calculo'];
        $totalCupon = (float) $row['total_cupon'];
        $valorEnvio = (float) $row['valor_envio'];

        $ingresoNeto = $valorPedido - $valorEnvio - $totalCupon;
        $comisionEsperada = max(0, $ingresoNeto - $baseCalculo);

        echo "Ingreso Neto = $valorPedido - $valorEnvio - $totalCupon = " . number_format($ingresoNeto, 2) . "\n";
        echo "Comisión Esperada = $ingresoNeto - $baseCalculo = " . number_format($comisionEsperada, 2) . "\n\n";

        // 3. Verify if values match
        echo "--- Verification ---\n";
        if (abs($row['comision_valor'] - $comisionEsperada) < 0.01) {
            echo "✓ COMISIÓN CORRECTA: " . number_format($row['comision_valor'], 2) . "\n";
        } else {
            echo "✗ COMISIÓN INCORRECTA\n";
            echo "  Actual: " . number_format($row['comision_valor'], 2) . "\n";
            echo "  Esperada: " . number_format($comisionEsperada, 2) . "\n";
            echo "  Diferencia: " . number_format($row['comision_valor'] - $comisionEsperada, 2) . "\n";
        }

        if (abs($row['valor_a_pagar_asesor'] - $comisionEsperada) < 0.01) {
            echo "✓ VALOR A PAGAR CORRECTO: " . number_format($row['valor_a_pagar_asesor'], 2) . "\n";
        } else {
            echo "✗ VALOR A PAGAR INCORRECTO\n";
            echo "  Actual: " . number_format($row['valor_a_pagar_asesor'], 2) . "\n";
            echo "  Esperado: " . number_format($comisionEsperada, 2) . "\n";
        }
    } else {
        echo "No se encontró relación en pedido_asesores para el pedido $idPedido\n";
    }

    echo "\n=== END VERIFICATION ===\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
