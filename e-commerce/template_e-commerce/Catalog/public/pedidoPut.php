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
            // =========================================================================
            // RECALCULO COMISIÓN DROPSHIPPER (Si se actualizó el costo de envío)
            // =========================================================================
            if ($costoEnvio !== null) {
                try {
                    // 1. Verificar si este pedido tiene relación con un asesor
                    // Traemos también el base_calculo anterior que es el Costo Dropshipper (según la lógica nueva en OrdersManager)
                    $stmtAsesor = $conexion->prepare("
                        SELECT idPedidoAsesor, base_calculo, total_cupon, valor_pedido 
                        FROM pedido_asesores 
                        WHERE idPedido = :idPedido 
                        LIMIT 1
                    ");
                    $stmtAsesor->execute([':idPedido' => $idPedido]);
                    $relacion = $stmtAsesor->fetch(PDO::FETCH_ASSOC);

                    if ($relacion) {
                        // 2. Recalcular
                        // Fórmula: Ganancia = Valor Pedido - Nuevo Envío - Costo Dropshipper - Cupón
                        $valorPedidoDb       = (float) $relacion['valor_pedido'];
                        $totalCuponDb        = (float) $relacion['total_cupon'];
                        $costoBaseDropshipper= (float) $relacion['base_calculo'];
                        
                        // Nuevo ingreso neto
                        $ingresoNeto = $valorPedidoDb - $costoEnvio - $totalCuponDb;
                        
                        // Nueva comisión
                        $nuevaComision = max(0, $ingresoNeto - $costoBaseDropshipper);
                        
                        // 3. Actualizar tabla pedido_asesores
                        $stmtUpdateCom = $conexion->prepare("
                            UPDATE pedido_asesores 
                            SET 
                                valor_envio = :nuevoEnvio,
                                comision_valor = :nuevaComision,
                                valor_a_pagar_asesor = :nuevaComision
                            WHERE idPedidoAsesor = :idRelacion
                        ");
                        $stmtUpdateCom->execute([
                            ':nuevoEnvio'     => $costoEnvio,
                            ':nuevaComision'  => $nuevaComision,
                            ':idRelacion'     => $relacion['idPedidoAsesor']
                        ]);
                    }
                } catch (Exception $e) {
                    // Si falla el recálculo, no detenemos el update principal pero alertamos/logueamos
                    // En este contexto JSON, podríamos agregar una advertencia al mensaje de éxito si fuera crítico
                    // error_log("Error recalculando comisión: " . $e->getMessage());
                }
            }
            
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
