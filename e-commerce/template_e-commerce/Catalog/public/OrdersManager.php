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

    /* ============================================================
       CREAR RELACIÓN pedido_asesores
    ============================================================ */
    public static function crearRelacionPedidoAsesor(PDO $conexion, int $idPedido, string $docAsesor, array $datos): void
    {
        // 1. Buscar asesor
        $stmt = $conexion->prepare("
            SELECT idAsesor, medio_pago_comision
            FROM asesores
            WHERE documento = :doc
        ");
        $stmt->execute([':doc' => $docAsesor]);
        $asesor = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$asesor) {
            throw new RuntimeException("Asesor no encontrado con documento: $docAsesor");
        }

        // 2. Tomar datos del pedido enviados desde el front
        $valorPedido = isset($datos['total_pedido']) ? (float)$datos['total_pedido'] : 0;
        $valorEnvio  = isset($datos['costo_envio']) ? (float)$datos['costo_envio'] : 0;
        $totalCupon  = isset($datos['total_cupon']) ? (float)$datos['total_cupon'] : 0;

        $totalProductos = isset($datos['total_productos'])
            ? (float)$datos['total_productos']
            : 0;

        // Base de cálculo real:
        $baseCalculo = max(0, $valorPedido - $valorEnvio - $totalCupon);

        // Comisión fija del 10%
        $porcentajeComision = 10;

        $comisionValor = round($baseCalculo * ($porcentajeComision / 100), 2);

        $valorAPagarAsesor = $comisionValor;

        $medioPagoComision = !empty($asesor['medio_pago_comision'])
            ? $asesor['medio_pago_comision']
            : "por definir";

        $sql = "
            INSERT INTO pedido_asesores (
                idPedido, idAsesor, base_calculo, valor_pedido, valor_envio,
                comision_tipo, porcentaje_comision, comision_valor,
                valor_a_pagar_asesor, total_cupon, medio_pago_comision,
                estado_comision
            )
            VALUES (
                :idPedido, :idAsesor, :base_calculo, :valor_pedido, :valor_envio,
                'porcentaje', :porcentaje, :comision_valor,
                :valor_a_pagar_asesor, :total_cupon, :medio_pago_comision,
                'pendiente'
            )
        ";

        $stmt = $conexion->prepare($sql);

        $stmt->execute([
            ':idPedido'              => $idPedido,
            ':idAsesor'              => $asesor['idAsesor'],
            ':base_calculo'          => $baseCalculo,
            ':valor_pedido'          => $valorPedido,
            ':valor_envio'           => $valorEnvio,
            ':porcentaje'            => $porcentajeComision,
            ':comision_valor'        => $comisionValor,
            ':valor_a_pagar_asesor'  => $valorAPagarAsesor,
            ':total_cupon'           => $totalCupon,
            ':medio_pago_comision'   => $medioPagoComision,
        ]);
    }

    /* ============================================================
       CREAR PEDIDO
    ============================================================ */
    public static function crearPedido(PDO $conexion, array $datos): int
    {
        try {

            $forma_pago = strtolower($datos['forma_pago']);
            $forma_pago_otro = empty($datos['forma_pago_otro']) ? 'vacio' : strtolower($datos['forma_pago_otro']);

            if ($forma_pago === 'otro') {
                $forma_pago = "otro:" . $forma_pago_otro;
            }

            $defaults = [
                'estado'      => 'Pendiente',
                'pagado'      => 'No',
                'codigo'      => '',
                'pago'        => strtolower($datos['medio_pago']),
                'formaPago'   => strtolower($forma_pago)
            ];

            $datos = array_merge($defaults, $datos);

            $sanitizedData = [
                ':tipo'              => strtolower($datos['tipo_pedido']),
                ':estado'            => $datos['estado'],
                ':productos'         => $datos['productos'],
                ':total'             => (float)$datos['total_pedido'],
                ':total_productos'   => (float)$datos['total_productos'],
                ':costo_envio'       => isset($datos['costo_envio']) ? (float)$datos['costo_envio'] : 0,
                ':nota'              => strtolower($datos['nota']),
                ':nombre'            => strtolower($datos['nombre_cliente']),
                ':codigo'            => $datos['codigo'] ?? '',
                ':entrega'           => $datos['direccion_entrega'],
                ':city_id'           => $datos['city_id'],
                ':state_id'          => $datos['state_id'],
                ':country_id'        => $datos['country_id'],
                ':fechaDespacho'     => $datos['fecha_despacho'],
                ':franja_horario'    => $datos['franja_horario'],
                ':telefono'          => $datos['telefono_cliente'],
                ':telefono_tran'     => $datos['telefono_tran'],
                ':pago'              => strtolower($datos['medio_pago']),
                ':formaPago'         => $datos['formaPago'],
                ':pagado'            => $datos['pagado'],
                ':pagoRecibir'       => $datos['pago_recibir'] ?? 'no',
                ':transportadora'    => $datos['transportadora'] ?? null,
                ':numero_guia'       => $datos['numero_guia'] ?? null
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

            return $conexion->lastInsertId();

        } catch (PDOException $e) {
            throw new RuntimeException("Error al crear pedido: " . $e->getMessage());
        }
    }
}
