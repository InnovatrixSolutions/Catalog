<?php
// Cargar variables de entorno desde el archivo .env
require __DIR__ . '/vendor/autoload.php';
require_once 'cors_headers.php';
require_once 'Utils.php';

// Manejo solicitudes OPTIONS (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Configuración DB
$servidor   = $_ENV['DB_HOST'] . ':' . $_ENV['DB_PORT'];
$usuario    = $_ENV['DB_USER'];
$contrasena = $_ENV['DB_PASS'];
$dbname     = $_ENV['DB_NAME'];

try {
    $dsn = "mysql:host=$servidor;dbname=$dbname;charset=utf8mb4";
    $conexion = new PDO($dsn, $usuario, $contrasena);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $metodo = $_SERVER['REQUEST_METHOD'];

    if ($metodo === 'GET') {

        // ------------------------------
        // FILTROS OPCIONALES
        // ------------------------------
        $idAsesor       = isset($_GET['idAsesor']) ? (int) $_GET['idAsesor'] : null;
        $idPedido       = isset($_GET['idPedido']) ? (int) $_GET['idPedido'] : null;
        $estadoComision = isset($_GET['estado_comision']) ? trim($_GET['estado_comision']) : null;

        // NUEVO: filtros de fecha para la liquidación (por fecha_pago_comision)
        // Formato esperado: YYYY-MM-DD
        $fechaDesde     = isset($_GET['fecha_desde']) ? $_GET['fecha_desde'] : null;
        $fechaHasta     = isset($_GET['fecha_hasta']) ? $_GET['fecha_hasta'] : null;

        $where  = [];
        $params = [];

        if ($idAsesor) {
            $where[] = 'pa.idAsesor = :idAsesor';
            $params[':idAsesor'] = $idAsesor;
        }

        if ($idPedido) {
            $where[] = 'pa.idPedido = :idPedido';
            $params[':idPedido'] = $idPedido;
        }

        if ($estadoComision) {
            $where[] = 'pa.estado_comision = :estado_comision';
            $params[':estado_comision'] = $estadoComision;
        }

        // 🔑 AQUÍ definimos la columna de fecha que se usa para la liquidación
        // Si quisieras usar otra, la cambias aquí.
        // Opciones típicas:
        //   - Solo por fecha de pago de comisión:
        //       $columnaFecha = 'pa.fecha_pago_comision';
        //
        //   - Fallback: fecha de pago o, si no existe, fecha de creación del pedido:
        //       $columnaFecha = 'COALESCE(pa.fecha_pago_comision, p.createdAt)';
        //
        $columnaFecha = 'pa.fecha_pago_comision';

        if ($fechaDesde) {
            $where[] = "DATE($columnaFecha) >= :fecha_desde";
            $params[':fecha_desde'] = $fechaDesde;
        }

        if ($fechaHasta) {
            $where[] = "DATE($columnaFecha) <= :fecha_hasta";
            $params[':fecha_hasta'] = $fechaHasta;
        }

        $whereSql = empty($where) ? '' : 'WHERE ' . implode(' AND ', $where);

        // ------------------------------
        // CONSULTA COMPLETA
        // ------------------------------
        $sqlSelect = "
            SELECT 
                pa.idRelacion,
                pa.idPedido,
                pa.idAsesor,

                -- datos de liquidación
                pa.base_calculo,
                pa.valor_pedido,
                pa.valor_envio,
                pa.porcentaje_comision,
                pa.comision_tipo,
                pa.comision_valor,
                pa.valor_a_pagar_asesor,
                pa.total_cupon,
                pa.medio_pago_comision,
                pa.estado_comision,
                pa.fecha_pago_comision,
                pa.observaciones,

                -- ---------------------
                -- DATOS DEL PEDIDO
                -- ---------------------
                p.tipo_pedido,
                p.estado              AS pedido_estado,
                p.productos,
                p.total               AS pedido_total,
                p.costo_envio,
                p.total_productos,
                p.total_costo_compra,
                p.total_cupon         AS pedido_total_cupon,
                p.valor_cupon,
                p.tipo_cupon,
                p.nota                AS pedido_nota,
                p.nombre              AS pedido_cliente_nombre,
                p.codigo              AS pedido_codigo,
                p.entrega,
                p.city_id,
                p.state_id,
                p.country_id,
                p.fecha_despacho,
                p.franja_horario,
                p.telefono            AS pedido_cliente_telefono,
                p.telefono_tran,
                p.pago                AS pedido_pago,
                p.forma_pago,
                p.pagado              AS pedido_pagado,
                p.pagoRecibir,
                p.createdAt           AS pedido_createdAt,

                -- ---------------------
                -- DATOS DEL ASESOR
                -- ---------------------
                a.nombre_completo     AS asesor_nombre,
                a.telefono            AS asesor_telefono,
                a.telefono_whatsapp   AS asesor_whatsapp,
                a.medio_pago_comision AS asesor_medio_pago,
                a.email               AS asesor_email,
                a.tipo                AS asesor_tipo,
                a.estado              AS asesor_estado

            FROM pedido_asesores pa
            LEFT JOIN pedidos  p ON p.idPedido  = pa.idPedido
            LEFT JOIN asesores a ON a.idAsesor = pa.idAsesor
            $whereSql
            ORDER BY pa.idRelacion DESC
        ";

        $sentencia = $conexion->prepare($sqlSelect);

        foreach ($params as $key => $value) {
            $sentencia->bindValue($key, $value);
        }

        if ($sentencia->execute()) {
            $resultado = $sentencia->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                "ok"             => true,
                "total"          => count($resultado),
                "pedidos_asesores" => $resultado,
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                "ok"    => false,
                "error" => implode(', ', $sentencia->errorInfo())
            ]);
        }

    } else {
        http_response_code(405);
        echo json_encode([
            "ok"    => false,
            "error" => "Método no permitido"
        ]);
    }

} catch (PDOException $error) {
    http_response_code(500);
    echo json_encode([
        "ok"    => false,
        "error" => "Error de conexión: " . $error->getMessage()
    ]);

} catch (Exception $error) {
    http_response_code(500);
    echo json_encode([
        "ok"    => false,
        "error" => "Error desconocido: " . $error->getMessage()
    ]);
}
