<?php
require __DIR__ . '/vendor/autoload.php';
require_once 'cors_headers.php';
require_once 'Utils.php';
require_once 'OrderValidator.php';
require_once 'OrdersManager.php';

// Manejo de solicitudes OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

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

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $conexion->beginTransaction();
        $pedidoId=[];
        

        // Validar tipo de pedido y campos básicos
        OrderValidator::validarTipoPedido($_POST);
        
        // Validaciones comunes para todos los pedidos
        OrderValidator::validarCamposComunes($_POST, $conexion);
        
        
        //Validar totales (nueva función)
        OrderValidator::validarTotales($_POST, $conexion);

        if ($_POST['tipo_pedido'] === 'dropshipper') {
            OrderValidator::validarDropshipper($_POST, $conexion);
            // Validación adicional: Margen de venta (opcional)
            $margenMinimo = $_POST['total_pedido'] >= $_POST['total_productos'];
            if (!$margenMinimo) {
                throw new RuntimeException("El valor total del pedido no puede ser menor al valor total de productos");
            }
        }
       //validar cupon.
    //    adicionar la logica necesaria para calcular totalcupon

        // Crear pedido principal
        $orderId = OrdersManager::crearPedido($conexion, $_POST);

        if ($_POST['tipo_pedido'] === 'dropshipper') {
            // Pasar los datos necesarios para la comisión
            OrdersManager::crearRelacionPedidoAsesor(
                $conexion,
                $orderId,
                $_POST['doc_asesor'] // string
            );
        }

        if ($_POST['tipo_pedido'] === 'dropshipper') {
            // Actualizar datos del asesor
            OrderValidator::actualizarDatosAsesor(
                $conexion,
                $_POST['doc_asesor'],
                $_POST // Solo se usarán campos permitidos
            );
        }
        
        $conexion->commit();
         Utils::responder(true, "Pedido creado exitosamente", ['id' => $orderId]);
    } else {
        http_response_code(405);
        Utils::responder(false, "Método no permitido");
    }
} catch (InvalidArgumentException $e) {
    if (isset($conexion) && $conexion->inTransaction()) {
        $conexion->rollBack();
    }
    http_response_code(400);
    Utils::responder(false, $e->getMessage());
} catch (RuntimeException $e) {
    if (isset($conexion) && $conexion->inTransaction()) {
        $conexion->rollBack();
    }
    http_response_code(422);
    Utils::responder(false, $e->getMessage());
} catch (Exception $e) {
    if (isset($conexion) && $conexion->inTransaction()) {
        $conexion->rollBack();
    }
    http_response_code(500);
    Utils::responder(false, "Error interno: " . $e->getMessage());
}
