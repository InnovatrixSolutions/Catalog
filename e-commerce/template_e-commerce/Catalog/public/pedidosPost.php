<?php
require __DIR__ . '/vendor/autoload.php';
require_once 'cors_headers.php';
require_once 'Utils.php';
require_once 'OrderValidator.php';
require_once 'OrdersManager.php';

// Manejo OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

$servidor   = $_ENV['DB_HOST'] . ':' . $_ENV['DB_PORT'];
$usuario    = $_ENV['DB_USER'];
$contrasena = $_ENV['DB_PASS'];
$dbname     = $_ENV['DB_NAME'];

try {
    $dsn = "mysql:host=$servidor;dbname=$dbname";
    $conexion = new PDO($dsn, $usuario, $contrasena);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        Utils::responder(false, "Método no permitido");
    }

    $conexion->beginTransaction();

    // VALIDACIONES
    OrderValidator::validarTipoPedido($_POST);
    OrderValidator::validarCamposComunes($_POST, $conexion);
    OrderValidator::validarTotales($_POST, $conexion);

    if ($_POST['tipo_pedido'] === 'dropshipper') {
        OrderValidator::validarDropshipper($_POST, $conexion);
    }

    // CREAR PEDIDO
    $orderId = OrdersManager::crearPedido($conexion, $_POST);

    // SI ES DROPSHIPPER CREA LIQUIDACIÓN
    if ($_POST['tipo_pedido'] === 'dropshipper') {

        OrdersManager::crearRelacionPedidoAsesor(
            $conexion,
            $orderId,
            $_POST['doc_asesor'],
            $_POST  // ← SE ENVÍA TODO EL ARRAY CON TOTALES YA CALCULADOS
        );
    }

    $conexion->commit();

    Utils::responder(true, "Pedido creado exitosamente", ['id' => $orderId]);

} catch (InvalidArgumentException $e) {
    if ($conexion->inTransaction()) $conexion->rollBack();
    http_response_code(400);
    Utils::responder(false, $e->getMessage());

} catch (RuntimeException $e) {
    if ($conexion->inTransaction()) $conexion->rollBack();
    http_response_code(422);
    Utils::responder(false, $e->getMessage());

} catch (Exception $e) {
    if ($conexion->inTransaction()) $conexion->rollBack();
    http_response_code(500);
    Utils::responder(false, "Error interno: ".$e->getMessage());
}
