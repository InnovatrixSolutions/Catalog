<?php
require __DIR__.'/vendor/autoload.php';
require_once 'cors_headers.php';
require_once 'Utils.php';

use Dotenv\Dotenv;

// Manejo de solicitudes OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

// Cargar .env
$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

$servidor   = $_ENV['DB_HOST'] . ':' . $_ENV['DB_PORT'];
$usuario    = $_ENV['DB_USER'];
$contrasena = $_ENV['DB_PASS'];
$dbname     = $_ENV['DB_NAME'];

header('Content-Type: application/json; charset=utf-8');

try {
    // IMPORTANTE: charset
    $dsn = "mysql:host=$servidor;dbname=$dbname;charset=utf8mb4";
    $conexion = new PDO($dsn, $usuario, $contrasena);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Solo aceptamos PUT
    if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
        http_response_code(405);
        echo json_encode(["error" => "Método no permitido"]);
        exit;
    }

    // Leer JSON crudo
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);

    if (!is_array($data)) {
        http_response_code(400);
        echo json_encode(["error" => "JSON inválido"]);
        exit;
    }

    // idProducto puede venir por GET o en el body
    $idProducto = $_GET['idProducto'] ?? $data['idProducto'] ?? null;

    if (empty($idProducto) || !is_numeric($idProducto)) {
        echo json_encode(["error" => "ID de producto inválido"]);
        exit;
    }

    // Mapear campos desde el payload (usando los nombres de React)
    $titulo         = trim($data['nuevoTitulo']        ?? '');
    $descripcion    = strip_tags(trim($data['nuevaDescripcion'] ?? ''));
    $precio         = $data['nuevoPrecio']             ?? '';
    $idCategoria    = $data['nuevaCategoria']          ?? '';
    $idSubCategoria = $data['nuevaSubCategoria']       ?? 0;
    $precioAnterior = $data['precioAnterior']          ?? 0;
    $stock          = $data['stock']                   ?? 0;
    $sku            = strtoupper(trim($data['sku']     ?? ''));
    $masVendido     = $data['masVendido']              ?? 'No';
    $verItems       = $data['verItems']                ?? 'No';

    // Items / variaciones
    $item1  = $data['item1']  ?? '';
    $item2  = $data['item2']  ?? '';
    $item3  = $data['item3']  ?? '';
    $item4  = $data['item4']  ?? '';
    $item5  = $data['item5']  ?? '';
    $item6  = $data['item6']  ?? '';
    $item7  = $data['item7']  ?? '';
    $item8  = $data['item8']  ?? '';
    $item9  = $data['item9']  ?? '';
    $item10 = $data['item10'] ?? '';

    // Normalizar masVendido y verItems
    $masVendido = strtolower(trim($masVendido));
    $verItems   = strtolower(trim($verItems));

    $masVendido = ($masVendido === 'si' || $masVendido === 'Si') ? 'Si' : 'No';
    $verItems   = ($verItems   === 'si' || $verItems   === 'Si') ? 'Si' : 'No';

    // === VALIDACIONES (igual estilo que el POST) ===
    if (empty($titulo) || empty($descripcion) || empty($precio) || empty($sku)) {
        echo json_encode(["error" => "Por favor, complete todos los campos obligatorios"]);
        exit;
    }

    if (strlen($titulo) < 3 || strlen($titulo) > 100) {
        echo json_encode(["error" => "El título debe tener entre 3 y 100 caracteres."]);
        exit;
    }

    if (!preg_match('/^[\p{L}\p{N}\s\.\,\-\_\!\?]+$/u', $titulo)) {
        echo json_encode(["error" => "El título solo puede contener letras, números y signos básicos."]);
        exit;
    }

    if (strpos($titulo, '/') !== false || strpos($titulo, '\\') !== false) {
        echo json_encode(["error" => "El título no debe contener caracteres como / o \\"]);
        exit;
    }

    if (strlen($descripcion) < 10 || strlen($descripcion) > 1000) {
        echo json_encode(["error" => "La descripción debe tener entre 10 y 1000 caracteres."]);
        exit;
    }

    if (!is_numeric($precio) || $precio <= 0) {
        echo json_encode(["error" => "El precio debe ser un número positivo"]);
        exit;
    }

    if (!is_numeric($stock) || $stock < 0) {
        echo json_encode(["error" => "El stock debe ser un número no negativo"]);
        exit;
    }

    if (!preg_match('/^[A-Z0-9]+$/', $sku)) {
        echo json_encode(["error" => "El SKU solo puede contener letras y números, sin espacios ni símbolos."]);
        exit;
    }

    // Validar SKU único excepto para el propio producto
    $sqlSku = "SELECT COUNT(*) FROM productos WHERE sku = :sku AND idProducto != :idProducto";
    $stmtSku = $conexion->prepare($sqlSku);
    $stmtSku->bindValue(':sku', $sku, PDO::PARAM_STR);
    $stmtSku->bindValue(':idProducto', $idProducto, PDO::PARAM_INT);
    $stmtSku->execute();
    if ($stmtSku->fetchColumn() > 0) {
        echo json_encode(["error" => "El SKU '$sku' ya está registrado en otro producto"]);
        exit;
    }

    // === UPDATE SOLO DE CAMPOS DE TEXTO / NUMÉRICOS (SIN IMÁGENES) ===
    $sqlUpdate = "UPDATE productos SET
        descripcion   = :descripcion,
        titulo        = :titulo,
        precio        = :precio,
        idCategoria   = :idCategoria,
        idSubCategoria= :idSubCategoria,
        masVendido    = :masVendido,
        item1         = :item1,
        item2         = :item2,
        item3         = :item3,
        item4         = :item4,
        item5         = :item5,
        item6         = :item6,
        item7         = :item7,
        item8         = :item8,
        item9         = :item9,
        item10        = :item10,
        precioAnterior= :precioAnterior,
        stock         = :stock,
        sku           = :sku,
        verItems      = :verItems
     WHERE idProducto = :idProducto";

    $stmt = $conexion->prepare($sqlUpdate);
    $stmt->bindParam(':descripcion',    $descripcion);
    $stmt->bindParam(':titulo',         $titulo);
    $stmt->bindParam(':precio',         $precio);
    $stmt->bindParam(':idCategoria',    $idCategoria);
    $stmt->bindParam(':idSubCategoria', $idSubCategoria);
    $stmt->bindParam(':masVendido',     $masVendido);
    $stmt->bindParam(':item1',          $item1);
    $stmt->bindParam(':item2',          $item2);
    $stmt->bindParam(':item3',          $item3);
    $stmt->bindParam(':item4',          $item4);
    $stmt->bindParam(':item5',          $item5);
    $stmt->bindParam(':item6',          $item6);
    $stmt->bindParam(':item7',          $item7);
    $stmt->bindParam(':item8',          $item8);
    $stmt->bindParam(':item9',          $item9);
    $stmt->bindParam(':item10',         $item10);
    $stmt->bindParam(':precioAnterior', $precioAnterior);
    $stmt->bindParam(':stock',          $stock);
    $stmt->bindParam(':sku',            $sku);
    $stmt->bindParam(':verItems',       $verItems);
    $stmt->bindParam(':idProducto',     $idProducto, PDO::PARAM_INT);

    $stmt->execute();

    echo json_encode([
        "mensaje" => "Producto actualizado correctamente"
    ]);

} catch (PDOException $e) {
    echo json_encode(["error" => "Error de conexión o base de datos: " . $e->getMessage()]);
    exit;
}
