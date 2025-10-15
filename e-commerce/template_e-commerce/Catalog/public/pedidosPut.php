<?php
header("Content-Type: application/json");
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Cargar variables de entorno desde el archivo .env
require __DIR__ . '/vendor/autoload.php';

use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Obtener los valores de las variables de entorno
$servidor = $_ENV['DB_HOST'] . ':' . $_ENV['DB_PORT'];
$usuario = $_ENV['DB_USER'];
$contrasena = $_ENV['DB_PASS'];
$dbname = $_ENV['DB_NAME'];

// Función para parsear multipart/form-data en PUT
function parsePutMultipartFormData()
{
    $input = file_get_contents('php://input');
    $contentType = isset($_SERVER['CONTENT_TYPE']) ? $_SERVER['CONTENT_TYPE'] : '';

    preg_match('/boundary=(.*)$/', $contentType, $matches);
    $boundary = $matches[1] ?? '';

    $data = [];

    if (!empty($boundary)) {
        $parts = preg_split("/--?" . preg_quote($boundary, '/') . "/", $input);

        foreach ($parts as $part) {
            if (trim($part) === '' || trim($part) === '--') continue;

            if (preg_match('/name="([^"]+)"/', $part, $nameMatches)) {
                $fieldName = $nameMatches[1];
                $valueStart = strpos($part, "\r\n\r\n");
                if ($valueStart !== false) {
                    $fieldValue = substr($part, $valueStart + 4);
                    $fieldValue = rtrim($fieldValue, "\r\n-");
                    $data[$fieldName] = $fieldValue;
                }
            }
        }
    }

    return $data;
}

try {
    $dsn = "mysql:host=$servidor;dbname=$dbname;charset=utf8mb4";
    $conexion = new PDO($dsn, $usuario, $contrasena);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        // Obtener datos del PUT
        $contentType = isset($_SERVER['CONTENT_TYPE']) ? $_SERVER['CONTENT_TYPE'] : '';

        if (strpos($contentType, 'multipart/form-data') !== false) {
            $requestData = parsePutMultipartFormData();
        } else {
            parse_str(file_get_contents('php://input'), $requestData);
        }

        // Obtener ID del pedido a actualizar
        $idPedido = $requestData['idpedido'] ?? $requestData['idPedido'] ?? null;

        if (!$idPedido) {
            echo json_encode(["error" => "ID de pedido requerido"]);
            exit;
        }

        // Recuperar datos del pedido
        $estado = $requestData['estado'] ?? null;
        $productos = isset($requestData['productos']) ? json_decode($requestData['productos'], true) : null;
        $total = $requestData['total'] ?? null;
        $nombre = $requestData['nombre_cliente'] ?? null;
        $telefono = $requestData['telefono'] ?? null;
        $entrega = $requestData['entrega'] ?? null;
        $nota = $requestData['nota'] ?? null;
        $codigo = $requestData['codigo'] ?? null;
        $pago = $requestData['pago'] ?? null;
        $pagado = $requestData['pagado'] ?? null;
        $pagoRecibir = $requestData['pagoRecibir'] ?? null;

        // Verificar si el pedido existe
        $sqlCheckPedido = "SELECT idPedido FROM pedidos WHERE idPedido = :idPedido";
        $stmtCheck = $conexion->prepare($sqlCheckPedido);
        $stmtCheck->bindParam(':idPedido', $idPedido);
        $stmtCheck->execute();

        if ($stmtCheck->rowCount() === 0) {
            echo json_encode(["error" => "Pedido no encontrado"]);
            exit;
        }

        // Construir query UPDATE dinámico
        $updateFields = [];
        $params = [':idPedido' => $idPedido];

        if ($estado !== null) {
            $updateFields[] = "estado = :estado";
            $params[':estado'] = $estado;
        }
        if ($productos !== null) {
            $updateFields[] = "productos = :productos";
            $params[':productos'] = $requestData['productos']; // JSON original
        }
        if ($total !== null) {
            $updateFields[] = "total = :total";
            $params[':total'] = $total;
        }
        if ($nombre !== null) {
            $updateFields[] = "nombre = :nombre";
            $params[':nombre'] = $nombre;
        }
        if ($telefono !== null) {
            $updateFields[] = "telefono = :telefono";
            $params[':telefono'] = $telefono;
        }
        if ($entrega !== null) {
            $updateFields[] = "entrega = :entrega";
            $params[':entrega'] = $entrega;
        }
        if ($nota !== null) {
            $updateFields[] = "nota = :nota";
            $params[':nota'] = $nota;
        }
        if ($codigo !== null) {
            $updateFields[] = "codigo = :codigo";
            $params[':codigo'] = $codigo;
        }
        if ($pago !== null) {
            $updateFields[] = "pago = :pago";
            $params[':pago'] = $pago;
        }
        if ($pagado !== null) {
            $updateFields[] = "pagado = :pagado";
            $params[':pagado'] = $pagado;
        }
        if ($pagoRecibir !== null) {
            $updateFields[] = "pagoRecibir = :pagoRecibir";
            $params[':pagoRecibir'] = $pagoRecibir;
        }

        if (empty($updateFields)) {
            echo json_encode(["error" => "No hay campos para actualizar"]);
            exit;
        }


        // Ejecutar actualización
        $sqlUpdatePedido = "UPDATE pedidos SET " . implode(', ', $updateFields) . " WHERE idPedido = :idPedido";
        $stmtUpdate = $conexion->prepare($sqlUpdatePedido);

        foreach ($params as $key => $value) {
            $stmtUpdate->bindValue($key, $value);
        }

        $stmtUpdate->execute();

        // Respuesta exitosa
        echo json_encode([
            "mensaje" => "Pedido N°$idPedido actualizado correctamente",
            "idPedido" => $idPedido,
            "estado" => $estado,
            "productos" => $productos,
            "total" => $total,
            "nombre" => $nombre,
            "telefono" => $telefono,
            "entrega" => $entrega,
            "nota" => $nota,
            "codigo" => $codigo,
            "pago" => $pago,
            "pagado" => $pagado,
            "pagoRecibir" => $pagoRecibir,
            "campos_actualizados" => $updateFields
        ]);
    } else {
        echo json_encode(["error" => "Método no permitido"]);
    }
} catch (PDOException $error) {
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
}
