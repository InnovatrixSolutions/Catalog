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

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        
        $fechaDesde = isset($_GET['fecha_desde']) ? $_GET['fecha_desde'] : null;
        $fechaHasta = isset($_GET['fecha_hasta']) ? $_GET['fecha_hasta'] : null;
        
        // Base WHERE: solo pedidos de catálogo (o lo que no sea dropshipper)
        // Adjust logic if 'catalogo' is the specific type
        $where = ["p.tipo_pedido = 'catalogo'"];
        $params = [];

        if ($fechaDesde) {
            $where[] = "DATE(p.createdAt) >= :fecha_desde";
            $params[':fecha_desde'] = $fechaDesde;
        }

        if ($fechaHasta) {
            $where[] = "DATE(p.createdAt) <= :fecha_hasta";
            $params[':fecha_hasta'] = $fechaHasta;
        }
        
        // Add more filters if needed (e.g. status)

        $whereSql = implode(' AND ', $where);

        $sql = "
            SELECT 
                p.idPedido,
                p.tipo_pedido,
                p.estado,
                p.createdAt,
                p.total AS total_venta,
                p.costo_envio,
                p.total_productos,
                p.total_costo_compra,
                p.total_cupon,
                p.incluye_envio,
                p.pagado,
                p.pago,
                p.forma_pago
            FROM pedidos p
            WHERE $whereSql
            ORDER BY p.idPedido DESC
        ";

        $stmt = $conexion->prepare($sql);
        $stmt->execute($params);
        $pedidos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Post-processing to calculate utility if not strictly stored
        // Utilidad Bruta = Total Venta - Costo Compra (Productos) - Cupón ?? 
        // Let's stick to the logic seen in OrdersManager:
        /*
           Utilidad Bruta (Catálogo) = (Total Venta - Cupon) - Costo Compra
           *Nota: Total Venta incluye envío si el cliente paga envío? 
            - Si incluye_envio=1, Total Venta lo tiene sumado? 
            - Usualmente en catalogo el precio venta es el final. 
           
           Revisando lógica de dropshipper:
             IngresoNeto = ValorPedido - (Envío si incluye) - Cupón
             UtilidadBruta = IngresoNeto - CostoCompra? No.
             
             En Dropshipper:
               UtilidadBruta = CostoBaseDropshipper (lo que pagó el drop a plataforma) - CostoCompraReal
             
             En Catálogo (Venta Directa):
               UtilidadBruta = (Total Venta - Cupon - (Envío si incluye)) - CostoCompraReal
               
               Si incluye_envio = 1 (La tienda cobra envío dentro del total):
                  NetoVenta = Total - Envio - Cupon
               Si incluye_envio = 0 (Envio aparte o gratis real?):
                  NetoVenta = Total - Cupon
                  
               Utilidad Bruta = NetoVenta - CostoCompra
               Utilidad Neta = Utilidad Bruta (menos otros gastos? Envio real pagado a transportadora?)
               
               Si la tienda paga el envío a la transportadora, entonces:
               Utilidad Neta = Utilidad Bruta - CostoEnvioReal (que solemos tomar del mismo campo costo_envio)
        */

        $resultados = [];
        foreach ($pedidos as $p) {
            $incluyeEnvio = (int)$p['incluye_envio'];
            $totalVenta   = (float)$p['total_venta'];
            $costoEnvio   = (float)$p['costo_envio'];
            $totalCupon   = (float)$p['total_cupon'];
            $costoCompra  = (float)$p['total_costo_compra'];
            
            // Calculo Venta Neta (Sin envío ni cupones)
            if ($incluyeEnvio === 1) {
                $ventaNeta = $totalVenta - $costoEnvio - $totalCupon;
            } else {
                $ventaNeta = $totalVenta - $totalCupon;
            }
            
            $utilidadBruta = $ventaNeta - $costoCompra;
            
            // Utilidad Neta (Descontando envío si la tienda lo asumió/cobró y debe pagarlo)
            // Si incluye_envio=1, ya lo restamos para hallar la venta del producto.
            // Pero el costo del envío sale del bolsillo? 
            // Si incluye_envio=1, el cliente pagó el envío. Entra plata, sale plata. Efecto nulo si coinciden.
            // Si incluye_envio=0, el cliente no pagó envío (o lo pagó aparte). 
            
            // SIMPLIFIED LOGIC based on previous conversation:
            // "cuando el envio se incluye debe restarla, cuando el envio no se incluye no debe restarla" (referring to Utility Net)
            
            // Let's compute Utilidad Bruta as simply Margen Comercial:
            // U.Bruta = (Total - Cupones) - CostoProductos
            // (Ignoring shipping logic for Bruta per user request previously? No, user said for Neta logic)
            //
            // Let's replicate the user's latest logic request:
            // "Utilidad Neta: cuando incluye envío, restar envío. Si no, no."
            
            // So:
            // Utilidad Bruta = (Total Venta - Cupon) - Costo Compra
            // (We deduct shipping ONLY from Neta if included)
            
            $uBruta = ($totalVenta - $totalCupon) - $costoCompra; 
            // Wait, if totalVenta has shipping included, U.Bruta is inflated by shipping.
            // User: "Utilidad Bruta" ... "No se resta el costo de envío".
            // So if TotalVenta = 120 (100 prod + 20 ship)
            // Costo = 50
            // U.Bruta = 120 - 50 = 70.
            
            $uNeta = $uBruta;
            if ($incluyeEnvio === 1) {
                $uNeta = $uBruta - $costoEnvio; 
                // 70 - 20 = 50. Correct logic.
            }
            
            $p['utilidad_bruta'] = $uBruta;
            $p['utilidad_neta']  = $uNeta;
            
            $resultados[] = $p;
        }

        echo json_encode([
            "ok" => true,
            "total" => count($resultados),
            "data" => $resultados
        ]);

    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
