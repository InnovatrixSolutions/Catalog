<?php
require_once 'Utils.php';
class OrdersManager {

    public static function calcularTotalProductos(string $productosJson): float {
            $productos = json_decode($productosJson, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new InvalidArgumentException("Formato de productos inválido");
            }

            $total = 0;
            foreach ($productos as $producto) {
                if (!isset($producto['precio']) || !isset($producto['cantidad'])) {
                    throw new InvalidArgumentException("Producto sin precio o cantidad");
                }
                if ($producto['precio'] < 0 || $producto['cantidad'] < 1) {
                    throw new InvalidArgumentException("Precio o cantidad inválidos");
                }
                $total += ($producto['precio'] * $producto['cantidad']);
            }

            return $total;
        }

   
        // Asegúrate que el parámetro esté bien nombrado
    public static function crearRelacionPedidoAsesor(PDO $conexion,int $idPedido, string $docAsesor): void {
            // 1. Buscar el ID del asesor
            $sql = "SELECT idAsesor,medio_pago_comision FROM asesores WHERE documento = :doc";
            $stmt = $conexion->prepare($sql);
            $stmt->execute([':doc' => $docAsesor]);
            $asesor = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$asesor) {
                throw new RuntimeException("Asesor no encontrado con documento: $docAsesor");
            }

            // 2. Valores por defecto (internos, no dependen del POST)
            $defaults = [
                'comision_estado' => 'pendiente',
                'tipo_comision' => 'manual',
                'valor_comision' => 0,
                'medio_pago_comision' => 'por definir'
            ];

            // 3. Insertar con valores por defecto
            $sql = "INSERT INTO pedido_asesores (
                idPedido, 
                idAsesor, 
                comision_tipo, 
                comision_valor, 
                medio_pago_comision, 
                estado_comision
            ) VALUES (
                :pedido, 
                :asesor, 
                :tipo_comision, 
                :valor_comision,
                :medio_pago,
                :estado_comision
            )";

            $stmt = $conexion->prepare($sql);
            $stmt->execute([
                ':pedido' => $idPedido,
                ':asesor' => $asesor['idAsesor'],
                ':tipo_comision' => $defaults['tipo_comision'],
                ':valor_comision' => $defaults['valor_comision'],
                ':medio_pago' => empty($asesor['medio_pago_comision']) ? $defaults['medio_pago_comision'] : $asesor['medio_pago_comision'],
                ':estado_comision' => $defaults['comision_estado']
            ]);
        }

 
 
    public static function crearPedido(PDO $conexion, array $datos): int {
        try {
            // ========== VALORES POR DEFECTO ==========
            // 'franja_horario' => 'sin especificar',
            $forma_pago = strtolower($datos['forma_pago']);
            $forma_pago_otro =empty($datos['forma_pago_otro']) ? 'vacio' : strtolower($datos['forma_pago_otro']);
            $pago_recibir =empty($datos['pago_recibir']) ? 'no' : strtolower($datos['pago_recibir']);
            if(strtolower($datos['forma_pago'])=='otro'){
                $forma_pago=strtolower($datos['forma_pago']).":".strtolower($forma_pago_otro);
            }
            
            
            $defaults = [
                'estado' => 'Pendiente',
                'pagado' => 'No', //por defecto no, en admin se cambia
                'pagoRecibir' =>ucfirst(strtolower($pago_recibir)),
                'codigo' => '',
                'pago' =>strtolower($datos['medio_pago']),
                'formaPago' =>strtolower($forma_pago)
            ];
            
            $datos = array_merge($defaults, $datos);

            // ========== SANITIZACIÓN SEGURA ==========
            $sanitizedData = [
                ':tipo' =>strtolower(htmlspecialchars($datos['tipo_pedido'], ENT_QUOTES, 'UTF-8')),
                ':estado' =>ucfirst(strtolower(htmlspecialchars($datos['estado'], ENT_QUOTES, 'UTF-8'))),
                ':productos' => $datos['productos'],
                ':total' => (float)$datos['total_pedido'],
                ':nombre' =>strtolower(htmlspecialchars($datos['nombre_cliente'], ENT_QUOTES, 'UTF-8')),
                ':telefono' => filter_var($datos['telefono_cliente'], FILTER_SANITIZE_NUMBER_INT),
                ':telefono_tran' => filter_var($datos['telefono_tran'], FILTER_SANITIZE_NUMBER_INT),
                ':entrega' => htmlspecialchars($datos['direccion_entrega'], ENT_QUOTES, 'UTF-8'),
                ':nota' =>strtolower(htmlspecialchars($datos['nota'], ENT_QUOTES, 'UTF-8')),
                ':codigo' => htmlspecialchars($datos['codigo'], ENT_QUOTES, 'UTF-8'),
                ':pago' => htmlspecialchars($datos['pago'], ENT_QUOTES, 'UTF-8'),
                ':formaPago' => htmlspecialchars($forma_pago, ENT_QUOTES, 'UTF-8'),
                ':pagado' => htmlspecialchars($datos['pagado'], ENT_QUOTES, 'UTF-8'),
                ':pagoRecibir' => htmlspecialchars($datos['pagoRecibir'], ENT_QUOTES, 'UTF-8'),
                ':fechaDespacho' => htmlspecialchars($datos['fecha_despacho'], ENT_QUOTES, 'UTF-8'),
                ':franja_horario' => htmlspecialchars($datos['franja_horario'], ENT_QUOTES, 'UTF-8'),
                ':city_id' => $datos['city_id'] ?? null,
                ':state_id' => $datos['state_id'] ?? null,
                ':country_id' => $datos['country_id'] ?? null,
                ':total_productos' => (float)$datos['total_productos'] // Nuevo campo
            ];

            // ========== CONSULTA SQL ACTUALIZADA ==========
            $sql = "INSERT INTO pedidos (
                tipo_pedido, estado, productos, total, total_productos, nota, 
                nombre, codigo, entrega, city_id, state_id, country_id, 
                fecha_despacho, franja_horario, telefono, 
                telefono_tran, pago,forma_pago, pagado, pagoRecibir, createdAt
            ) VALUES (
                :tipo, :estado, :productos, :total, :total_productos, :nota, 
                :nombre, :codigo, :entrega, :city_id, :state_id, :country_id, 
                 :fechaDespacho, :franja_horario, :telefono, 
                :telefono_tran, :pago,:formaPago, :pagado, :pagoRecibir, NOW()
            )";

            $stmt = $conexion->prepare($sql);
            $stmt->execute($sanitizedData);
            return $conexion->lastInsertId();

        } catch (PDOException $e) {
            throw new RuntimeException("Error al crear pedido: " . $e->getMessage());
        }


   

}

}
       
    

?>
