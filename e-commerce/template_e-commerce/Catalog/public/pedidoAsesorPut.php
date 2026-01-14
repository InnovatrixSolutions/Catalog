<?php
require __DIR__ . '/vendor/autoload.php';
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
    $dsn = "mysql:host=$servidor;dbname=$dbname;charset=utf8mb4";
    $conexion = new PDO($dsn, $usuario, $contrasena);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        $input = json_decode(file_get_contents("php://input"), true);
        
        $action = $input['action'] ?? 'pay_single'; // 'pay_single' or 'pay_bulk'

        if ($action === 'pay_single') {
            // --- PAGO INDIVIDUAL ---
            $idRelacion = $input['idRelacion'] ?? null;
            if (!$idRelacion) {
                echo json_encode(['error' => 'Falta idRelacion']);
                exit;
            }

            $sql = "UPDATE pedido_asesores 
                    SET estado_comision = 'Pagada', fecha_pago_comision = NOW() 
                    WHERE idRelacion = :idRelacion";
            
            $stmt = $conexion->prepare($sql);
            if ($stmt->execute([':idRelacion' => $idRelacion])) {
                echo json_encode(['success' => true, 'mensaje' => 'Comisión pagada correctamente']);
            } else {
                echo json_encode(['error' => 'Error al actualizar la comisión']);
            }

        } elseif ($action === 'pay_bulk') {
            // --- PAGO MASIVO (POR ASESOR) ---
            $idAsesor = $input['idAsesor'] ?? null;
            if (!$idAsesor) {
                echo json_encode(['error' => 'Falta idAsesor']);
                exit;
            }

            $fechaDesde = $input['fechaDesde'] ?? null;
            $fechaHasta = $input['fechaHasta'] ?? null;

            // Base query: update pending commissions for this advisor
            // Important: We should also check the date range if the user is filtering
            $where = ['pa.idAsesor = :idAsesor', "pa.estado_comision != 'Pagada'"];
            $params = [':idAsesor' => $idAsesor];

            // If filtering by date, we must match the logic in pedidoAsesoresGet.php (using p.createdAt)
            if ($fechaDesde || $fechaHasta) {
                // Join needed to filter by p.createdAt
                $join = "JOIN pedidos p ON p.idPedido = pa.idPedido";
            } else {
                $join = ""; // No join needed if no date filter
            }

            if ($fechaDesde) {
                $where[] = "DATE(p.createdAt) >= :fechaDesde";
                $params[':fechaDesde'] = $fechaDesde;
            }
            if ($fechaHasta) {
                $where[] = "DATE(p.createdAt) <= :fechaHasta";
                $params[':fechaHasta'] = $fechaHasta;
            }

            $whereSql = implode(' AND ', $where);

            $sql = "UPDATE pedido_asesores pa
                    $join
                    SET pa.estado_comision = 'Pagada', pa.fecha_pago_comision = NOW()
                    WHERE $whereSql";

            $stmt = $conexion->prepare($sql);
            if ($stmt->execute($params)) {
                $count = $stmt->rowCount();
                echo json_encode(['success' => true, 'mensaje' => "Se pagaron $count comisiones exitosamente."]);
            } else {
                echo json_encode(['error' => 'Error al realizar el pago masivo']);
            }

        } else {
            echo json_encode(['error' => 'Acción inválida']);
        }

    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Método no permitido']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error del servidor: ' . $e->getMessage()]);
}
