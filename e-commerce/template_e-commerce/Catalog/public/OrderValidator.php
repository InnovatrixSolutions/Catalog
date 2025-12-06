<?php
class OrderValidator {
    public static function validarTipoPedido(array $data): void {
        // Campo obligatorio
        if (empty($data['tipo_pedido'])) {
            throw new InvalidArgumentException("El campo 'tipo_pedido' es obligatorio.");
        }
        
        $tipo = strtolower($data['tipo_pedido']);
        $tiposValidos = ['catalogo', 'dropshipper'];
        
        // Validar tipo permitido
        if (!in_array($tipo, $tiposValidos)) {
            throw new InvalidArgumentException("Tipo de pedido no válido: " . $data['tipo_pedido']);
        }
        
        // Si es catálogo → No debe tener campos de dropshipper
        if ($data['tipo_pedido'] === 'catalogo') {
            $camposProhibidos = ['doc_asesor', 'pin_asesor'];
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

    // ========== FUNCIONES DE VALIDACIÓN ESPECÍFICAS ==========

    private static function validarCountry(int $countryId, PDO $conexion): void {
        $stmt = $conexion->prepare("
            SELECT id 
            FROM countries 
            WHERE id = :countryId 
            AND iso3 = :isoCode 
            AND is_active = 1
        ");
        
        $stmt->execute([
            ':countryId' => $countryId,
            ':isoCode' => 'COL' // Código ISO fijo según tu AddressManager
        ]);
        
        if (!$stmt->fetch()) {
            throw new RuntimeException("País no válido. Debe ser Colombia (ISO: COL) y estar activo");
        }
    }

    private static function validarState(int $stateId, int $countryId, PDO $conexion): void {
        $stmt = $conexion->prepare("
            SELECT id 
            FROM states 
            WHERE id = :stateId 
            AND country_id = :countryId 
            AND is_active = 1
        ");
        $stmt->execute([
            ':stateId' => $stateId,
            ':countryId' => $countryId
        ]);
        
        if (!$stmt->fetch()) {
            throw new RuntimeException("Estado no pertenece al país seleccionado");
        }
    }

    private static function validarCity(int $cityId, int $stateId, int $countryId, PDO $conexion): void {
        $stmt = $conexion->prepare("
            SELECT id 
            FROM cities 
            WHERE id = :cityId 
            AND state_id = :stateId 
            AND country_id = :CountryId 
            AND is_active = 1
        ");
        $stmt->execute([
            ':cityId' => $cityId,
            ':stateId' => $stateId,
            ':CountryId' => $countryId
        ]);
        
        if (!$stmt->fetch()) {
            throw new RuntimeException("Ciudad no pertenece al estado/país seleccionado");
        }
    }

    private static function validarFranjaHorario(string $franja, string $fieldName = 'franja_horario'): void {
        // Permite 1 o 2 dígitos para la hora, acepta ceros a la izquierda, minutos siempre de dos dígitos
        $pattern = '/^(0?[1-9]|1[0-2]):[0-5][0-9]-(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM|am|pm)(,\s?(0?[1-9]|1[0-2]):[0-5][0-9]-(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM|am|pm))?$/';
        if (!preg_match($pattern, $franja)) {
            throw new InvalidArgumentException(
                "El campo $fieldName debe tener el formato HH:MM-HH:MM AM/PM, HH:MM-HH:MM AM/PM. Ejemplo: 8:00-12:00 AM, 2:00-6:00 PM"
            );
        }
    }

    private static function validarTelefono(string $telefono, string $fieldName = 'telefono'): void {
        if (!preg_match('/^\+?\d{7,15}$/', $telefono)) {
            throw new InvalidArgumentException("Formato de $fieldName inválido");
        }
    }

    private static function validarFecha(string $fecha): void {
        $dateTime = DateTime::createFromFormat('Y-m-d H:i:s', $fecha);
        if (!$dateTime || $dateTime->format('Y-m-d H:i:s') !== $fecha) {
            throw new InvalidArgumentException("Formato de fecha inválido. Use Y-m-d H:i:s");
        }
    }

    private static function validarTotal($total): void {
        if (!is_numeric($total) || $total <= 0) {
            throw new InvalidArgumentException("Total debe ser un número positivo");
        }
    }

    private static function validarNombre(string $nombre): void {
        // Permite letras, espacios, tildes, ñ y apóstrofes
        if (!preg_match("/^[a-zA-ZáéíóúÁÉÍÓÚñÑ' ]+$/u", $nombre)) {
            throw new InvalidArgumentException("El nombre solo puede contener letras y espacios");
        }
        if (strlen($nombre) < 2) {
            throw new InvalidArgumentException("El nombre es demasiado corto");
        }
    }

    private static function validarDireccion(string $direccion): void {
        // Permite letras, números, espacios, puntos, comas, guiones y #
        if (!preg_match("/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ .,#-]+$/u", $direccion)) {
            throw new InvalidArgumentException("La dirección contiene caracteres no permitidos");
        }
        if (strlen($direccion) < 10) {
            throw new InvalidArgumentException("La dirección es demasiado corta");
        }
    }

    private static function validarTexto(string $texto,string $fieldName, int $maxLength = 255): void {
        // Elimina etiquetas HTML y espacios extremos
        $textoLimpio = trim(strip_tags($texto));
        if (strlen($textoLimpio) > $maxLength) {
            throw new InvalidArgumentException("El texto es demasiado largo en $fieldName (máx $maxLength caracteres)");
        }
    }

    // Validar estructura de productos
    public static function validarProductos(string $productosJson): void {
        $productos = json_decode($productosJson, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new InvalidArgumentException("Formato de productos inválido");
        }
        foreach ($productos as $producto) {
            if (empty($producto['idProducto']) || empty($producto['cantidad'])) {
                throw new InvalidArgumentException("Producto sin ID o cantidad");
            }
        }
    }

    // En OrderValidator.php
    public static function validarTotales(array &$data, PDO $conexion): void {
        // Calcular total de productos
        $totalProductos = OrdersManager::calcularTotalProductos($data['productos']);
        
        // Asignar al array original (por referencia)
        $data['total_productos'] = $totalProductos;

        // Validar según el tipo de pedido
        if ($data['tipo_pedido'] === 'dropshipper') {
            if ($totalProductos <= 0) {
                throw new InvalidArgumentException("El total de productos debe ser mayor a 0");
            }
            if ($data['total_pedido'] <= 0) {
                throw new InvalidArgumentException("El total del pedido debe ser mayor a 0");
            }
        } else {
            $tolerancia = 0.01;
            if (abs($totalProductos - $data['total_pedido']) > $tolerancia) {
                throw new InvalidArgumentException(
                    "El total del pedido ({$data['total_pedido']}) no coincide con la suma de productos ($totalProductos)"
                );
            }
        }
    }

    private static function validarMedioPago(string $medio): void {
        $medioNormalizado = strtolower($medio);
        $mediosValidos = ['transferencia','efectivo'];
        if (!in_array($medioNormalizado, $mediosValidos, true)) {
            throw new InvalidArgumentException("Medio de pago no válido: $medio");
        }
    }

    private static function validarFormaPago(string $medio): void {
        $medioNormalizado = strtolower(trim($medio));
        $mediosValidos = [
            'nequi',
            'bold (tarjeta)',
            'daviplata',
            'mercadopago',
            'sistecredito',
            'transfiya',
            'otro'
        ];

        if (!in_array($medioNormalizado, $mediosValidos, true)) {
            throw new InvalidArgumentException("Forma de pago no válido: $medio");
        }
    }    

    // Validar campos comunes a todos los pedidos
    public static function validarCamposComunes(array $data, PDO $conexion): void {
        $camposRequeridos = [
            'tipo_pedido', 'productos', 'nombre_cliente', 'medio_pago','forma_pago',
            'telefono_cliente','telefono_tran', 'direccion_entrega', 'country_id','state_id','city_id', 'nota','franja_horario','pago_recibir',
            'fecha_despacho', 'total_pedido'
        ];
        foreach ($camposRequeridos as $campo) {
            if (empty($data[$campo])) {
                throw new InvalidArgumentException("Campo requerido: $campo");
            }
        }
        // Validaciones específicas
        self::validarProductos($data['productos']);
        self::validarNombre($data['nombre_cliente']);
        self::validarTelefono($data['telefono_cliente'],'telefono_cliente');
        self::validarTelefono($data['telefono_tran'],'telefono_tran');
        self::validarDireccion($data['direccion_entrega']);
        self::validarFecha($data['fecha_despacho']);
        self::validarTotal($data['total_pedido']);
        self::validarMedioPago($data['medio_pago']);
        if ($data['medio_pago'] === 'transferencia') {
            self::validarFormaPago($data['forma_pago']);
        }
        // Validar jerarquía de ubicaciones
        self::validarCountry($data['country_id'], $conexion);
        self::validarState($data['state_id'], $data['country_id'], $conexion);
        self::validarCity($data['city_id'], $data['state_id'], $data['country_id'],$conexion);
        // Validaciones opcionales (si existen en $data)
        if (isset($data['nota'])) {
            self::validarTexto($data['nota'], 'nota', 150);
        }
        if (isset($data['franja_horario'])) {
            self::validarFranjaHorario($data['franja_horario'], 'franja_horario');
        }
    }

    private static function validarMedioPagoAsesor(string $medio): void {
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

    public static function validarDropshipper(array $data, PDO $conexion): void {
        // ========== CAMPOS REQUERIDOS ==========
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
            if (empty($data[$campo])) {
                throw new InvalidArgumentException("Campo requerido para dropshipper: $campo");
            }
        }

        // ========== VALIDACIÓN DE FORMATOS ==========
        self::validarDocumento($data['doc_asesor']);
        self::validarPin($data['pin_asesor']);
        self::validarTelefono($data['telefono_asesor'], 'teléfono asesor');
        self::validarTelefono($data['telefono_whatsapp'], 'teléfono WhatsApp');
        self::validarEmail($data['email']);
        self::validarMedioPagoAsesor($data['medio_pago_asesor']);

        // ========== VALIDACIÓN EN BASE DE DATOS ==========
        $stmt = $conexion->prepare("SELECT tipo, pin  FROM asesores 
            WHERE documento = :doc_asesor ");
        $stmt->execute([':doc_asesor' => $data['doc_asesor']]);
        $asesor = $stmt->fetch();

        if (!$asesor) {
            // Insertar asesor automáticamente
            self::crearAsesorDesdePedido($conexion,$data);
            $stmt->execute([':doc_asesor' => $data['doc_asesor']]);
            $asesor = $stmt->fetch();

            if (!$asesor) {
                throw new RuntimeException("Error al crear el asesor");
            }
        }

        if ($asesor && $asesor['pin'] !== $data['pin_asesor']) {
            throw new RuntimeException("PIN incorrecto");
        }

        // ========== VALIDAR TIPO ==========
        if ($asesor && $asesor['tipo'] !== 'dropshipper') {
            throw new RuntimeException("El asesor no es tipo dropshipper");
        }
    }

    // ========== FUNCIONES AUXILIARES ==========

    private static function validarEmail(string $email, string $fieldName = 'email'): void {
        if (empty($email)) {
            throw new InvalidArgumentException("El campo $fieldName es obligatorio.");
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new InvalidArgumentException("El campo $fieldName no es un email válido.");
        }
        if (strlen($email) > 255) {
            throw new InvalidArgumentException("El campo $fieldName es demasiado largo (máx 255 caracteres).");
        }
    }

    private static function validarDocumento(string $doc): void {
        if (!preg_match('/^\d{8,15}$/', $doc)) {
            throw new InvalidArgumentException("Documento debe tener 8-15 dígitos");
        }
    }

    private static function validarPin(string $pin): void {
        if (!preg_match('/^[A-Z0-9]{8,10}$/i', $pin)) {
            throw new InvalidArgumentException("PIN debe ser 8-10 caracteres alfanuméricos");
        }
    }
    
    public static function actualizarDatosAsesor(PDO $conexion, string $docAsesor, array $datos): void {
        // Mapeo de campos frontend → BD
        $mapeoCampos = [
            'pin' => 'pin',
            'nombre_asesor' => 'nombre_completo',
            'medio_pago_asesor' => 'medio_pago_comision',
            'telefono_asesor' => 'telefono',
            'telefono_whatsapp' => 'telefono_whatsapp',
            'email' => 'email'
        ];

        // Filtrar y mapear datos
        $datosFiltrados = [];
        foreach ($mapeoCampos as $frontend => $bd) {
            if (isset($datos[$frontend])) {
                $datosFiltrados[$bd] = $datos[$frontend];
            }
        }

        // Validaciones específicas (usamos $datos originales)
        if (isset($datos['pin'])) {
            self::validarPin($datos['pin']);
        }
        if (isset($datos['telefono_asesor'])) {
            self::validarTelefono($datos['telefono_asesor'], 'teléfono');
        }
        if (isset($datos['telefono_whatsapp'])) {
            self::validarTelefono($datos['telefono_whatsapp'], 'teléfono WhatsApp');
        }
        if (isset($datos['email'])) {
            self::validarEmail($datos['email']);
        }
        if (isset($datos['medio_pago_asesor'])) {
            self::validarMedioPagoAsesor($datos['medio_pago_asesor']);
        }

        // Construir consulta SQL dinámica
        $setParts = [];
        foreach ($datosFiltrados as $campo => $valor) {
            $setParts[] = "`$campo` = :$campo"; // Usar backticks para evitar conflictos con palabras reservadas
        }
        
        if (empty($setParts)) {
            return; // No hay campos válidos para actualizar
        }

        $sql = "UPDATE asesores 
                SET " . implode(', ', $setParts) . " 
                WHERE documento = :doc";
       
        $stmt = $conexion->prepare($sql);
        $stmt->bindValue(':doc', $docAsesor, PDO::PARAM_STR);
        
        foreach ($datosFiltrados as $campo => $valor) {
            $stmt->bindValue(":$campo", $valor);
        }
      
        if (!$stmt->execute()) {
            throw new RuntimeException("Error al actualizar datos del asesor");
        }
    }

    private static function crearAsesorDesdePedido(PDO $conexion, array $data): void {
        $tipo_asesor = trim($data['tipo_pedido']);
        $doc_asesor = trim($data['doc_asesor']);
        $pin_asesor = trim($data['pin_asesor']);
        $nombre_asesor = trim($data['nombre_asesor']);
        $phone_asesor = trim($data['telefono_asesor']);
        $phone_asesor2 = trim($data['telefono_whatsapp']);
        $medio_pago_asesor = trim($data['medio_pago_asesor']);
        $email = trim($data['email']);
      
        // Insertar datos
        $sqlInsert = "INSERT INTO asesores (documento, pin, tipo, nombre_completo, telefono, telefono_whatsapp, email, estado)
                      VALUES (:doc, :pin, :tipo, :nombre, :phone, :phonewhatsapp, :email, :estado)";
        
        $stmt = $conexion->prepare($sqlInsert);
        $stmt->execute([
            ':doc' => $doc_asesor,
            ':pin' => !empty($pin_asesor) ? $pin_asesor : null,
            ':tipo' => $tipo_asesor,
            ':nombre' => $nombre_asesor,
            ':phone' => $phone_asesor,
            ':phonewhatsapp' => $phone_asesor2,
            ':email' => !empty($email) ? $email : null,
            ':estado' => 1
        ]);
    }
}
