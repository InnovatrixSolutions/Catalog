<?php
require_once 'OrdersManager.php';

class OrderValidator
{
    public static function validarTipoPedido(array $data): void
    {
        if (empty($data['tipo_pedido'])) {
            throw new InvalidArgumentException("El campo 'tipo_pedido' es obligatorio.");
        }

        $tipo = strtolower(trim((string)$data['tipo_pedido']));
        $tiposValidos = ['catalogo', 'dropshipper'];

        if (!in_array($tipo, $tiposValidos, true)) {
            throw new InvalidArgumentException("Tipo de pedido no válido: " . $data['tipo_pedido']);
        }

        // Si es catálogo → No debe tener campos de dropshipper
        if ($tipo === 'catalogo') {
            $camposProhibidos = ['doc_asesor', 'pin_asesor', 'nombre_asesor', 'telefono_asesor', 'telefono_whatsapp', 'medio_pago_asesor', 'email'];
            foreach ($camposProhibidos as $campo) {
                if (!empty($data[$campo])) {
                    throw new InvalidArgumentException("Pedido tipo catálogo no debe incluir $campo");
                }
            }
        }

        // Si es dropshipper → Debe tener doc_asesor
        if ($tipo === 'dropshipper' && empty($data['doc_asesor'])) {
            throw new InvalidArgumentException("Los pedidos dropshipper requieren doc_asesor.");
        }
    }

    /* =========================
       VALIDACIONES DE UBICACIÓN
    ========================= */
    private static function validarCountry(int $countryId, PDO $conexion): void
    {
        $stmt = $conexion->prepare("
            SELECT id
            FROM countries
            WHERE id = :countryId
              AND iso3 = :isoCode
              AND is_active = 1
            LIMIT 1
        ");

        $stmt->execute([
            ':countryId' => $countryId,
            ':isoCode' => 'COL'
        ]);

        if (!$stmt->fetch()) {
            throw new RuntimeException("País no válido. Debe ser Colombia (ISO: COL) y estar activo");
        }
    }

    private static function validarState(int $stateId, int $countryId, PDO $conexion): void
    {
        $stmt = $conexion->prepare("
            SELECT id
            FROM states
            WHERE id = :stateId
              AND country_id = :countryId
              AND is_active = 1
            LIMIT 1
        ");

        $stmt->execute([
            ':stateId' => $stateId,
            ':countryId' => $countryId
        ]);

        if (!$stmt->fetch()) {
            throw new RuntimeException("Estado no pertenece al país seleccionado");
        }
    }

    private static function validarCity(int $cityId, int $stateId, int $countryId, PDO $conexion): void
    {
        $stmt = $conexion->prepare("
            SELECT id
            FROM cities
            WHERE id = :cityId
              AND state_id = :stateId
              AND country_id = :countryId
              AND is_active = 1
            LIMIT 1
        ");

        $stmt->execute([
            ':cityId' => $cityId,
            ':stateId' => $stateId,
            ':countryId' => $countryId
        ]);

        if (!$stmt->fetch()) {
            throw new RuntimeException("Ciudad no pertenece al estado/país seleccionado");
        }
    }

    /* =========================
       VALIDACIONES DE FORMATO
    ========================= */
    private static function validarTelefono(string $telefono, string $fieldName = 'telefono'): void
    {
        $telefono = trim($telefono);
        if (!preg_match('/^\+?\d{7,15}$/', $telefono)) {
            throw new InvalidArgumentException("Formato de $fieldName inválido");
        }
    }

    private static function validarFechaNullable(?string $fecha, string $fieldName = 'fecha'): void
    {
        if ($fecha === null || trim($fecha) === '') return;

        $fecha = trim($fecha);
        $dateTime = DateTime::createFromFormat('Y-m-d H:i:s', $fecha);
        if (!$dateTime || $dateTime->format('Y-m-d H:i:s') !== $fecha) {
            throw new InvalidArgumentException("Formato de $fieldName inválido. Use Y-m-d H:i:s");
        }
    }

    private static function validarTotal($total): void
    {
        if (!is_numeric($total) || (float)$total <= 0) {
            throw new InvalidArgumentException("Total debe ser un número positivo");
        }
    }

    private static function validarNombre(string $nombre): void
    {
        $nombre = trim($nombre);
        if (!preg_match("/^[a-zA-ZáéíóúÁÉÍÓÚñÑ' ]+$/u", $nombre)) {
            throw new InvalidArgumentException("El nombre solo puede contener letras y espacios");
        }
        if (mb_strlen($nombre) < 2) {
            throw new InvalidArgumentException("El nombre es demasiado corto");
        }
    }

    private static function validarDireccion(string $direccion): void
    {
        $direccion = trim($direccion);
        if (!preg_match("/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ .,#-]+$/u", $direccion)) {
            throw new InvalidArgumentException("La dirección contiene caracteres no permitidos");
        }
        if (mb_strlen($direccion) < 5) { // bajamos el mínimo para no bloquear direcciones válidas cortas
            throw new InvalidArgumentException("La dirección es demasiado corta");
        }
    }

    private static function validarTexto(string $texto, string $fieldName, int $maxLength = 255): void
    {
        $textoLimpio = trim(strip_tags($texto));
        if (mb_strlen($textoLimpio) > $maxLength) {
            throw new InvalidArgumentException("El texto es demasiado largo en $fieldName (máx $maxLength caracteres)");
        }
    }

    /**
     * Acepta formatos como:
     * - "08:00-08:00 PM"
     * - "8:00-12:00 AM"
     * - "8:00-12:00 AM, 2:00-6:00 PM"
     */
    private static function validarFranjaHorario(string $franja, string $fieldName = 'franja_horario'): void
    {
        $franja = trim($franja);

        // Permite hora 0-12 o 00-12 con minutos, y AM/PM al final del segmento.
        $pattern = '/^(0?\d|1[0-2]):[0-5]\d-(0?\d|1[0-2]):[0-5]\d\s?(AM|PM|am|pm)(,\s?(0?\d|1[0-2]):[0-5]\d-(0?\d|1[0-2]):[0-5]\d\s?(AM|PM|am|pm))*$/';
        if (!preg_match($pattern, $franja)) {
            throw new InvalidArgumentException(
                "El campo $fieldName debe tener el formato HH:MM-HH:MM AM/PM. Ejemplo: 08:00-12:00 PM"
            );
        }
    }

    // Validar estructura de productos
    public static function validarProductos(string $productosJson): void
    {
        $productos = json_decode($productosJson, true);
        if (json_last_error() !== JSON_ERROR_NONE || !is_array($productos)) {
            throw new InvalidArgumentException("Formato de productos inválido");
        }

        foreach ($productos as $producto) {
            if (empty($producto['idProducto']) || empty($producto['cantidad'])) {
                throw new InvalidArgumentException("Producto sin ID o cantidad");
            }
        }
    }

    /* =========================
       VALIDACIÓN DE TOTALES
    ========================= */
public static function validarTotales(array &$data, PDO $conexion): void
{
    if (empty($data['productos'])) {
        throw new InvalidArgumentException("Campo requerido: productos");
    }

    if (empty($data['tipo_pedido'])) {
        throw new InvalidArgumentException("Campo requerido: tipo_pedido");
    }

    $tipo = strtolower(trim((string)$data['tipo_pedido']));

    // Calcula desde BD (lista_precios) y no desde el front
    $totales = OrdersManager::calcularTotalesDesdeBD($conexion, (string)$data['productos'], $tipo);

    $data['total_productos'] = (float)$totales['total_productos'];
    $data['total_costo_compra'] = (float)$totales['total_costo_compra'];

    // Defaults seguros
    $data['costo_envio']  = isset($data['costo_envio']) ? (float)$data['costo_envio'] : 0.0;
    $data['total_cupon']  = isset($data['total_cupon']) ? (float)$data['total_cupon'] : 0.0;

    // Validaciones base
    if ($data['total_productos'] <= 0) {
        throw new InvalidArgumentException("El total de productos debe ser mayor a 0");
    }

    if (!isset($data['total_pedido']) || (float)$data['total_pedido'] <= 0) {
        throw new InvalidArgumentException("El total del pedido debe ser mayor a 0");
    }

    // Catálogo: total debe cuadrar exacto (con tolerancia)
    if ($tipo === 'catalogo') {
        $tolerancia = 0.01;
        if (abs(((float)$data['total_pedido']) - $data['total_productos']) > $tolerancia) {
            throw new InvalidArgumentException(
                "El total del pedido ({$data['total_pedido']}) no coincide con la suma de productos ({$data['total_productos']})"
            );
        }
    }

    // Dropshipper: total puede incluir envío/cupon etc, pero no debe ser menor que total_productos
    if ($tipo === 'dropshipper') {
        if (((float)$data['total_pedido']) < $data['total_productos']) {
            throw new InvalidArgumentException(
                "El total del pedido ({$data['total_pedido']}) no puede ser menor al total de productos ({$data['total_productos']})"
            );
        }
    }
}


    private static function validarMedioPago(string $medio): void
    {
        $medioNormalizado = strtolower(trim($medio));
        $mediosValidos = ['transferencia', 'efectivo'];

        if (!in_array($medioNormalizado, $mediosValidos, true)) {
            throw new InvalidArgumentException("Medio de pago no válido: $medio");
        }
    }

    private static function validarFormaPago(string $forma): void
    {
        $formaNormalizada = strtolower(trim($forma));

        $formasValidas = [
            'nequi',
            'bold (tarjeta)',
            'daviplata',
            'mercadopago',
            'sistecredito',
            'transfiya',
            'otro'
        ];

        if (!in_array($formaNormalizada, $formasValidas, true) && !str_starts_with($formaNormalizada, 'otro:')) {
            throw new InvalidArgumentException("Forma de pago no válida: $forma");
        }
    }

    // Validar campos comunes a todos los pedidos
    public static function validarCamposComunes(array $data, PDO $conexion): void
    {
        $camposRequeridos = [
            'tipo_pedido',
            'productos',
            'nombre_cliente',
            'medio_pago',
            'forma_pago',
            'telefono_cliente',
            'telefono_tran',
            'direccion_entrega',
            'country_id',
            'state_id',
            'city_id',
            'nota',
            'franja_horario',
            'pago_recibir',
            'total_pedido'
        ];

        foreach ($camposRequeridos as $campo) {
            if (!isset($data[$campo]) || $data[$campo] === '' || $data[$campo] === null) {
                throw new InvalidArgumentException("Campo requerido: $campo");
            }
        }

        self::validarProductos((string)$data['productos']);
        self::validarNombre((string)$data['nombre_cliente']);
        self::validarTelefono((string)$data['telefono_cliente'], 'telefono_cliente');
        self::validarTelefono((string)$data['telefono_tran'], 'telefono_tran');
        self::validarDireccion((string)$data['direccion_entrega']);
        self::validarTotal($data['total_pedido']);
        self::validarMedioPago((string)$data['medio_pago']);

        // forma_pago se valida siempre (siempre llega desde front)
        self::validarFormaPago((string)$data['forma_pago']);

        // fecha_despacho: puede ser null (catálogo). Dropshipper sí la manda.
        self::validarFechaNullable($data['fecha_despacho'] ?? null, 'fecha_despacho');

        if (isset($data['nota'])) {
            self::validarTexto((string)$data['nota'], 'nota', 150);
        }

        if (isset($data['franja_horario'])) {
            self::validarFranjaHorario((string)$data['franja_horario'], 'franja_horario');
        }

        // Validar jerarquía de ubicaciones
        self::validarCountry((int)$data['country_id'], $conexion);
        self::validarState((int)$data['state_id'], (int)$data['country_id'], $conexion);
        self::validarCity((int)$data['city_id'], (int)$data['state_id'], (int)$data['country_id'], $conexion);
    }

    private static function validarMedioPagoAsesor(string $medio): void
    {
        $medioNormalizado = strtolower(trim($medio));

        $mediosValidos = [
            'nequi',
            'bancolombia',
            'bold (tarjeta)',
            'daviplata',
            'mercadopago',
            'addi',
            'sistecredito',
            'otro'
        ];

        if (!in_array($medioNormalizado, $mediosValidos, true)) {
            throw new InvalidArgumentException("Medio de pago asesor no válido: $medio");
        }
    }

    public static function validarDropshipper(array $data, PDO $conexion): void
    {
        $camposRequeridos = [
            'doc_asesor',
            'pin_asesor',
            'nombre_asesor',
            'telefono_asesor',
            'telefono_whatsapp',
            'medio_pago_asesor',
            'email'
        ];

        foreach ($camposRequeridos as $campo) {
            if (!isset($data[$campo]) || trim((string)$data[$campo]) === '') {
                throw new InvalidArgumentException("Campo requerido para dropshipper: $campo");
            }
        }

        self::validarDocumento((string)$data['doc_asesor']);
        self::validarPin((string)$data['pin_asesor']);
        self::validarTelefono((string)$data['telefono_asesor'], 'telefono_asesor');
        self::validarTelefono((string)$data['telefono_whatsapp'], 'telefono_whatsapp');
        self::validarEmail((string)$data['email']);
        self::validarMedioPagoAsesor((string)$data['medio_pago_asesor']);

        // Buscar asesor por documento
        $stmt = $conexion->prepare("
            SELECT idAsesor, tipo, pin
            FROM asesores
            WHERE documento = :doc
            LIMIT 1
        ");
        $stmt->execute([':doc' => trim((string)$data['doc_asesor'])]);
        $asesor = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$asesor) {
            self::crearAsesorDesdePedido($conexion, $data);

            $stmt->execute([':doc' => trim((string)$data['doc_asesor'])]);
            $asesor = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$asesor) {
                throw new RuntimeException("Error al crear el asesor");
            }
        }

        if (!empty($asesor['pin']) && $asesor['pin'] !== (string)$data['pin_asesor']) {
            throw new RuntimeException("PIN incorrecto");
        }

        if (strtolower((string)$asesor['tipo']) !== 'dropshipper') {
            throw new RuntimeException("El asesor no es tipo dropshipper");
        }
    }

    /* =========================
       AUXILIARES DROPSHIPPER
    ========================= */
    private static function validarEmail(string $email, string $fieldName = 'email'): void
    {
        $email = trim($email);
        if ($email === '') {
            throw new InvalidArgumentException("El campo $fieldName es obligatorio.");
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new InvalidArgumentException("El campo $fieldName no es un email válido.");
        }
        if (mb_strlen($email) > 255) {
            throw new InvalidArgumentException("El campo $fieldName es demasiado largo (máx 255 caracteres).");
        }
    }

    private static function validarDocumento(string $doc): void
    {
        $doc = trim($doc);
        if (!preg_match('/^\d{8,15}$/', $doc)) {
            throw new InvalidArgumentException("Documento debe tener 8-15 dígitos");
        }
    }

    private static function validarPin(string $pin): void
    {
        $pin = trim($pin);
        if (!preg_match('/^[A-Z0-9]{8,10}$/i', $pin)) {
            throw new InvalidArgumentException("PIN debe ser 8-10 caracteres alfanuméricos");
        }
    }

    private static function crearAsesorDesdePedido(PDO $conexion, array $data): void
    {
        $tipo_asesor = trim((string)$data['tipo_pedido']); // dropshipper
        $doc_asesor = trim((string)$data['doc_asesor']);
        $pin_asesor = trim((string)$data['pin_asesor']);
        $nombre_asesor = trim((string)$data['nombre_asesor']);
        $phone_asesor = trim((string)$data['telefono_asesor']);
        $phone_asesor2 = trim((string)$data['telefono_whatsapp']);
        $medio_pago_asesor = trim((string)$data['medio_pago_asesor']);
        $email = trim((string)$data['email']);

        $sqlInsert = "INSERT INTO asesores (
                documento, pin, tipo, nombre_completo, telefono, telefono_whatsapp, medio_pago_comision, email, estado
            ) VALUES (
                :doc, :pin, :tipo, :nombre, :phone, :phonewhatsapp, :medio_pago, :email, :estado
            )";

        $stmt = $conexion->prepare($sqlInsert);
        $stmt->execute([
            ':doc' => $doc_asesor,
            ':pin' => $pin_asesor,
            ':tipo' => $tipo_asesor,
            ':nombre' => $nombre_asesor,
            ':phone' => $phone_asesor,
            ':phonewhatsapp' => $phone_asesor2,
            ':medio_pago' => $medio_pago_asesor,
            ':email' => $email,
            ':estado' => 1
        ]);
    }
}
