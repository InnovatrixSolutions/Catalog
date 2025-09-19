<?php
// 
// Cargar variables de entorno desde el archivo .env
require __DIR__.'/vendor/autoload.php';
require_once 'cors_headers.php';
require_once 'Utils.php';

// Manejo de solicitudes OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}



use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Obtener los valores de las variables de entorno
$servidor = $_ENV['DB_HOST'] . ':' . $_ENV['DB_PORT'];
$usuario = $_ENV['DB_USER'];
$contrasena = $_ENV['DB_PASS'];
$dbname = $_ENV['DB_NAME'];

try {
    $dsn = "mysql:host=$servidor;dbname=$dbname";
    $conexion = new PDO($dsn, $usuario, $contrasena);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Recuperar datos del pedido
        $estado = $_POST['estado'];
        $productos = json_decode($_POST['productos'], true);
        $total = $_POST['total'];
        $nombre = $_POST['nombre'];
        $telefono = $_POST['telefono'];
        $entrega = $_POST['entrega'];
        $nota = $_POST['nota'];
        $codigo = $_POST['codigo'];
        $pago = $_POST['pago'];
        $pagado = $_POST['pagado'];
        $pagoRecibir = $_POST['pagoRecibir'];
        $createdAt = $_POST['createdAt'];

        // Validar que los campos no estén vacíos
        if (!empty($estado) && !empty($productos) && !empty($total)  && !empty($entrega) && !empty($pagado)  && !empty($createdAt) && !empty($pago)) {
            
            // Verificar si el código de descuento es válido
            if (!empty($codigo)) {
                $sqlCodigo = "SELECT tipo, descuento, desde, hasta, limite, idCategoria, productos FROM codigos WHERE codigo = :codigo";
                $stmtCodigo = $conexion->prepare($sqlCodigo);
                $stmtCodigo->bindParam(':codigo', $codigo);
                $stmtCodigo->execute();
                $codigoData = $stmtCodigo->fetch(PDO::FETCH_ASSOC);

                if ($codigoData) {
                    // Obtener la fecha actual
                    $fechaActual = date('Y-m-d H:i:s');

                    // Comprobar si la fecha actual está dentro del rango
                    if ($fechaActual >= $codigoData['desde'] && $fechaActual <= $codigoData['hasta']) {
                        // Verificar si se ha excedido el límite de usos del código
                        $sqlContarUsos = "SELECT COUNT(*) as cantidad FROM pedidos WHERE codigo = :codigo";
                        $stmtContarUsos = $conexion->prepare($sqlContarUsos);
                        $stmtContarUsos->bindParam(':codigo', $codigo);
                        $stmtContarUsos->execute();
                        $usosData = $stmtContarUsos->fetch(PDO::FETCH_ASSOC);
                        $cantidadUsos = $usosData['cantidad'];
                        $limite = $codigoData['limite'];

                        // Aplicar el descuento solo si no se ha excedido el límite
                        if ($limite == 0 || $cantidadUsos < $limite) {
                            // Verificar si el código es aplicable a los productos o categoría
                            $productosCodigo = json_decode($codigoData['productos'], true);
                            $idCategoriaCodigo = $codigoData['idCategoria'];

                            $aplicable = false; // Variable para verificar si se puede aplicar el código

                            // Verificar si algún producto del pedido coincide con los productos o categorías del código
                            foreach ($productos as $producto) {
                                // Verificar si el idProducto está en los productos del código
                                if (!empty($productosCodigo)) {
                                    foreach ($productosCodigo as $productoCodigo) {
                                        if ($producto['idProducto'] == $productoCodigo['idProducto']) {
                                            $aplicable = true;
                                            break 2;
                                        }
                                    }
                                }

                                // Verificar si la idCategoria del producto coincide con la idCategoria del código
                                if (!empty($idCategoriaCodigo) && !empty($producto['idCategoria'])) {
                                    if ($producto['idCategoria'] == $idCategoriaCodigo) {
                                        $aplicable = true;
                                        break;
                                    }
                                }
                            }

                            if ($aplicable) {
                                // Aplicar descuento en función del tipo
                                $tipo = $codigoData['tipo'];
                                $descuento = $codigoData['descuento'];

                                if ($tipo == 'porcentaje') {
                                    // Descuento en porcentaje
                                    $total -= ($total * ($descuento / 100));
                                } elseif ($tipo == 'fijo') {
                                    // Descuento fijo
                                    $total -= $descuento;
                                }
                            } 
                        }
                    }
                }
            }

            // Asegurarse de que el total no sea negativo
            if ($total < 0) {
                $total = 0;
            }

            // Insertar el pedido en la base de datos con la fecha de creación proporcionada por el cliente
            $sqlInsertPedido = "INSERT INTO `pedidos` (estado, productos, total, nombre, telefono, entrega, nota, codigo, pago, pagado, pagoRecibir, createdAt) 
            VALUES (:estado, :productos, :total, :nombre, :telefono, :entrega, :nota, :codigo, :pago, :pagado,:pagoRecibir, :createdAt)";
            $stmtPedido = $conexion->prepare($sqlInsertPedido);
            $stmtPedido->bindParam(':estado', $estado);
            $stmtPedido->bindParam(':productos', $_POST['productos']);
            $stmtPedido->bindParam(':total', $total);
            $stmtPedido->bindParam(':nombre', $nombre);
            $stmtPedido->bindParam(':telefono', $telefono);
            $stmtPedido->bindParam(':entrega', $entrega); 
            $stmtPedido->bindParam(':nota', $nota);
            $stmtPedido->bindParam(':codigo', $codigo);
            $stmtPedido->bindParam(':pago', $pago);
            $stmtPedido->bindParam(':pagado', $pagado);
            $stmtPedido->bindParam(':pagoRecibir', $pagoRecibir);
            $stmtPedido->bindParam(':createdAt', $createdAt);
            $stmtPedido->execute();

// Obtener el ID del último pedido insertado
$lastPedidoId = $conexion->lastInsertId();

// Respuesta JSON con el mensaje y el ID del nuevo pedido
echo json_encode([
"mensaje" => "$nombre, tu pedido es el N°$lastPedidoId",
"idPedido" => $lastPedidoId
]);
} else {
echo json_encode(["error" => "Por favor, complete todos los campos correctamente"]);
}
} else {
echo json_encode(["error" => "Método no permitido"]);
}
} catch (PDOException $error) {
echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
}
?>
