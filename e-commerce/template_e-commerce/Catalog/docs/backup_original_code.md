# Backup of Original Code

## public/OrdersManager.php
```php
<?php
require_once 'Utils.php';

class OrdersManager
{
    /* ============================================================
       CALCULAR TOTAL PRODUCTOS
    ============================================================ */
    public static function calcularTotalProductos(string $productosJson): float
    {
        $productos = json_decode($productosJson, true);

        if (json_last_error() !== JSON_ERROR_NONE || !is_array($productos)) {
            throw new InvalidArgumentException("Formato de productos inválido");
        }

        $total = 0.0;

        foreach ($productos as $producto) {
            if (!isset($producto['precio']) || !isset($producto['cantidad'])) {
                throw new InvalidArgumentException("Producto sin precio o cantidad");
            }

            $precio = (float)$producto['precio'];
            $cantidad = (int)$producto['cantidad'];

            if ($precio < 0 || $cantidad < 1) {
                throw new InvalidArgumentException("Precio o cantidad inválidos");
            }

            $total += ($precio * $cantidad);
        }

        return (float)$total;
    }

    /* ============================================================
       CREAR RELACIÓN pedido_asesores (DROPSHIPPER)
    ============================================================ */
    public static function crearRelacionPedidoAsesor(PDO $conexion, int $idPedido, string $docAsesor, array $datos): void
    {
        $docAsesor = trim($docAsesor);
        $pinAsesor = isset($datos['pin_asesor']) ? trim((string)$datos['pin_asesor']) : '';

        // 1) Buscar asesor POR documento + pin (seguro para dropshipper)
        $stmt = $conexion->prepare("
            SELECT idAsesor, medio_pago_comision
            FROM asesores
            WHERE documento = :doc AND pin = :pin
            LIMIT 1
        ");
        $stmt->execute([':doc' => $docAsesor, ':pin' => $pinAsesor]);
        $asesor = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$asesor) {
            throw new RuntimeException("Asesor no encontrado o PIN incorrecto para documento: $docAsesor");
        }

        // 2) Tomar datos del pedido enviados desde el front
        $valorPedido = isset($datos['total_pedido']) ? (float)$datos['total_pedido'] : 0.0;
        $valorEnvio  = isset($datos['costo_envio']) ? (float)$datos['costo_envio'] : 0.0;
        $comisionTipo =isset($datos['comision_tipo']) ? $datos['comision_tipo'] : 'auto';
        $totalCupon  = isset($datos['total_cupon']) ? (float)$datos['total_cupon'] : 0.0;

        // Base de cálculo real:
        $baseCalculo = max(0.0, $valorPedido - $valorEnvio - $totalCupon);

        // Comisión fija del 10%
        $porcentajeComision = 10.0;

        $comisionValor = round($baseCalculo * ($porcentajeComision / 100.0), 2);
        if ($comisionValor <= 0) {
            throw new RuntimeException("La comisión calculada es inválida (base_calculo=$baseCalculo)");
        }

        $valorAPagarAsesor = $comisionValor;

        // 3) Medio de pago comisión: preferimos el valor del pedido (front),
        // si no, el que tiene el asesor en BD.
        $medioPagoComision = '';
        if (!empty($datos['medio_pago_asesor'])) {
            $medioPagoComision = trim((string)$datos['medio_pago_asesor']);
        } elseif (!empty($asesor['medio_pago_comision'])) {
            $medioPagoComision = trim((string)$asesor['medio_pago_comision']);
        }

        if ($medioPagoComision === '') {
            throw new RuntimeException("Medio de pago de comisión no definido para el asesor");
        }

        $sql = "
            INSERT INTO pedido_asesores (
                idPedido, idAsesor, base_calculo, valor_pedido, valor_envio,
                comision_tipo, porcentaje_comision, comision_valor,
                valor_a_pagar_asesor, total_cupon, medio_pago_comision,
                estado_comision
            )
            VALUES (
                :idPedido, :idAsesor, :base_calculo, :valor_pedido, :valor_envio,
                :comision_tipo, :porcentaje_comision, :comision_valor,
                :valor_a_pagar_asesor, :total_cupon, :medio_pago_comision,
                'pendiente'
            )
        ";

        try {
            $stmt = $conexion->prepare($sql);
            $stmt->execute([
                ':idPedido'              => $idPedido,
                ':idAsesor'              => (int)$asesor['idAsesor'],
                ':base_calculo'          => $baseCalculo,
                ':valor_pedido'          => $valorPedido,
                ':valor_envio'           => $valorEnvio,
                ':comision_tipo'         => $comisionTipo,
                ':porcentaje_comision'   => $porcentajeComision,
                ':comision_valor'        => $comisionValor,
                ':valor_a_pagar_asesor'  => $valorAPagarAsesor,
                ':total_cupon'           => $totalCupon,
                ':medio_pago_comision'   => $medioPagoComision,
            ]);
        } catch (PDOException $e) {
            throw new RuntimeException("Error al insertar relación pedido_asesores: " . $e->getMessage());
        }
    }

    /* ============================================================
       CREAR PEDIDO
    ============================================================ */
    public static function crearPedido(PDO $conexion, array $datos): int
    {
        try {
            // forma_pago: puede venir "Otro" + forma_pago_otro
            $forma_pago = isset($datos['forma_pago']) ? strtolower(trim((string)$datos['forma_pago'])) : '';
            $forma_pago_otro = empty($datos['forma_pago_otro']) ? '' : strtolower(trim((string)$datos['forma_pago_otro']));

            if ($forma_pago === 'otro') {
                $forma_pago = "otro:" . ($forma_pago_otro !== '' ? $forma_pago_otro : 'sin_detalle');
            }

            // defaults
            $defaults = [
                'estado'    => 'Pendiente',
                'pagado'    => 'No',
                'codigo'    => '',
                'pago'      => strtolower(trim((string)($datos['medio_pago'] ?? ''))),
                'formaPago' => $forma_pago,
            ];

            $datos = array_merge($defaults, $datos);

            $sanitizedData = [
                ':tipo'              => strtolower(trim((string)$datos['tipo_pedido'])),
                ':estado'            => (string)$datos['estado'],
                ':productos'         => (string)$datos['productos'],
                ':total'             => (float)$datos['total_pedido'],
                ':total_productos'   => (float)$datos['total_productos'],
                ':costo_envio'       => isset($datos['costo_envio']) ? (float)$datos['costo_envio'] : 0.0,
                ':nota'              => strtolower(trim((string)$datos['nota'])),
                ':nombre'            => strtolower(trim((string)$datos['nombre_cliente'])),
                ':codigo'            => (string)($datos['codigo'] ?? ''),
                ':entrega'           => (string)$datos['direccion_entrega'],
                ':city_id'           => (int)$datos['city_id'],
                ':state_id'          => (int)$datos['state_id'],
                ':country_id'        => (int)$datos['country_id'],
                // Puede ser null en catálogo: insertamos null
                ':fechaDespacho'     => !empty($datos['fecha_despacho']) ? (string)$datos['fecha_despacho'] : null,
                ':franja_horario'    => (string)$datos['franja_horario'],
                ':telefono'          => (string)$datos['telefono_cliente'],
                ':telefono_tran'     => (string)$datos['telefono_tran'],
                ':pago'              => strtolower(trim((string)$datos['medio_pago'])),
                ':formaPago'         => strtolower(trim((string)$datos['formaPago'])),
                ':pagado'            => (string)$datos['pagado'],
                ':pagoRecibir'       => (string)($datos['pago_recibir'] ?? 'no'),
                ':transportadora'    => $datos['transportadora'] ?? null,
                ':numero_guia'       => $datos['numero_guia'] ?? null,
                ':total_costo_compra' => isset($datos['total_costo_compra']) ? (float)$datos['total_costo_compra'] : 0.0,
                ':total_cupon'        => isset($datos['total_cupon']) ? (float)$datos['total_cupon'] : 0.0,

            ];

            $sql = "
                INSERT INTO pedidos (
                    tipo_pedido, estado, productos, total,
                    total_productos, costo_envio, nota,
                    nombre, codigo, entrega, city_id, state_id, country_id,
                    fecha_despacho, franja_horario, telefono, telefono_tran,
                    pago, forma_pago, pagado, pagoRecibir,
                    transportadora, numero_guia, createdAt
                )
                VALUES (
                    :tipo, :estado, :productos, :total,
                    :total_productos, :costo_envio, :nota,
                    :nombre, :codigo, :entrega, :city_id, :state_id, :country_id,
                    :fechaDespacho, :franja_horario, :telefono, :telefono_tran,
                    :pago, :formaPago, :pagado, :pagoRecibir,
                    :transportadora, :numero_guia, NOW()
                )
            ";

            $stmt = $conexion->prepare($sql);
            $stmt->execute($sanitizedData);

            return (int)$conexion->lastInsertId();
        } catch (PDOException $e) {
            throw new RuntimeException("Error al crear pedido: " . $e->getMessage());
        }
    }

    /* ============================================================
   CALCULAR TOTALES DESDE BD (precio venta desde lista_precios)
============================================================ */
public static function calcularTotalesDesdeBD(PDO $conexion, string $productosJson, string $tipoPedido): array
{
    $productos = json_decode($productosJson, true);

    if (json_last_error() !== JSON_ERROR_NONE || !is_array($productos)) {
        throw new InvalidArgumentException("Formato de productos inválido");
    }

    $tipoPedido = strtolower(trim($tipoPedido));
    if (!in_array($tipoPedido, ['catalogo', 'dropshipper'], true)) {
        throw new InvalidArgumentException("Tipo de pedido inválido para cálculo");
    }

    $totalVenta = 0.0;       // suma con lista_precios (precio venta)
    $totalCosto = 0.0;       // suma con productos.precio (costo compra)
    $ids = [];

    foreach ($productos as $p) {
        if (empty($p['idProducto']) || empty($p['cantidad'])) {
            throw new InvalidArgumentException("Producto sin ID o cantidad");
        }
        if (!is_numeric($p['idProducto']) || !is_numeric($p['cantidad'])) {
            throw new InvalidArgumentException("ID o cantidad inválidos");
        }
        $ids[] = (int)$p['idProducto'];
    }

    $ids = array_values(array_unique($ids));
    if (count($ids) === 0) {
        throw new InvalidArgumentException("Lista de productos vacía");
    }

    // placeholders (?, ?, ?)
    $placeholders = implode(',', array_fill(0, count($ids), '?'));

    // Trae precio de venta ACTUAL por tipoLista + costoCompra (productos.precio)
    $sql = "
        SELECT
            p.idProducto,
            p.precio AS costoCompra,
            lp.precio AS precioVenta
        FROM productos p
        LEFT JOIN lista_precios lp
            ON lp.idProducto = p.idProducto
            AND lp.estado = 'Actual'
            AND LOWER(lp.tipoLista) = ?
        WHERE p.idProducto IN ($placeholders)
    ";

    $params = array_merge([$tipoPedido], $ids);
    $stmt = $conexion->prepare($sql);
    $stmt->execute($params);

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // index por idProducto
    $map = [];
    foreach ($rows as $r) {
        $map[(int)$r['idProducto']] = $r;
    }

    foreach ($productos as $p) {
        $id = (int)$p['idProducto'];
        $cantidad = (int)$p['cantidad'];

        if ($cantidad < 1) {
            throw new InvalidArgumentException("Cantidad inválida para idProducto=$id");
        }

        if (!isset($map[$id])) {
            throw new RuntimeException("Producto no existe en BD: idProducto=$id");
        }

        $costoCompra = (float)($map[$id]['costoCompra'] ?? 0);
        $precioVenta = $map[$id]['precioVenta'];

        if ($precioVenta === null || (float)$precioVenta <= 0) {
            throw new RuntimeException("No hay precio ACTUAL en lista_precios para idProducto=$id (tipoLista=$tipoPedido)");
        }

        $precioVenta = (float)$precioVenta;

        $totalVenta += $precioVenta * $cantidad;
        $totalCosto += $costoCompra * $cantidad;
    }

    return [
        'total_productos' => round($totalVenta, 2),
        'total_costo_compra' => round($totalCosto, 2),
    ];
}

}
```

## public/pedidoPut.php
```php
<?php
require __DIR__.'/vendor/autoload.php';
require_once 'cors_headers.php';
require_once 'Utils.php';

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

    if ($_SERVER['REQUEST_METHOD'] === 'PUT') {

        $idPedido = isset($_GET['idPedido']) ? $_GET['idPedido'] : null;
        $data = json_decode(file_get_contents("php://input"), true);

        if (!$idPedido) {
            echo json_encode(["error" => "ID de pedido no proporcionado"]);
            exit;
        }

        // Campos que pueden venir del admin
        $nuevoEstado      = $data['estado']          ?? null;
        $pagado           = $data['pagado']          ?? null;
        $transportadora   = $data['transportadora']  ?? null;
        $numeroGuia       = $data['numero_guia']     ?? null;
        $costoEnvio       = isset($data['costo_envio']) ? (float)$data['costo_envio'] : null;

        // Debe haber al menos un campo para actualizar
        if ($nuevoEstado === null && $pagado === null && 
            $transportadora === null && $numeroGuia === null && $costoEnvio === null) 
        {
            echo json_encode(["error" => "No se enviaron campos válidos para actualizar"]);
            exit;
        }

        // Construir SQL dinámico
        $fields = [];
        $params = [":idPedido" => $idPedido];

        if ($nuevoEstado !== null) {
            $fields[] = "estado = :estado";
            $params[":estado"] = $nuevoEstado;
        }

        if ($pagado !== null) {
            $fields[] = "pagado = :pagado";
            $params[":pagado"] = $pagado;
        }

        if ($transportadora !== null) {
            $fields[] = "transportadora = :transportadora";
            $params[":transportadora"] = $transportadora;
        }

        if ($numeroGuia !== null) {
            $fields[] = "numero_guia = :numero_guia";
            $params[":numero_guia"] = $numeroGuia;
        }

        if ($costoEnvio !== null) {
            $fields[] = "costo_envio = :costo_envio";
            $params[":costo_envio"] = $costoEnvio;
        }

        // Unir los campos dinámicos
        $sql = "UPDATE pedidos SET " . implode(", ", $fields) . " WHERE idPedido = :idPedido";

        $stmt = $conexion->prepare($sql);

        if ($stmt->execute($params)) {
            echo json_encode(["success" => true, "mensaje" => "Pedido actualizado correctamente"]);
        } else {
            echo json_encode(["error" => "Error al actualizar el pedido"]);
        }

        exit;
    }

} catch (PDOException $error) {
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
}
?>
```
