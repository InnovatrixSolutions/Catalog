<?php
// header("Content-Type: application/json");
// header('Access-Control-Allow-Origin: *');
// header('Access-Control-Allow-Methods: POST, OPTIONS');
// header('Access-Control-Allow-Headers: Content-Type');

require __DIR__.'/vendor/autoload.php';
require_once 'cors_headers.php';
require_once 'Utils.php';

// Manejo de solicitudes OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}
// === DEBUG TEMPORAL (bórralo luego) ===
if (isset($_GET['debug'])) {
    header('Content-Type: text/plain; charset=utf-8');
    var_dump($_FILES);
    var_dump($_POST);
    exit;
}
// === FIN DEBUG ===


use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

$servidor = $_ENV['DB_HOST'] . ':' . $_ENV['DB_PORT'];
$usuario = $_ENV['DB_USER'];
$contrasena = $_ENV['DB_PASS'];
$dbname = $_ENV['DB_NAME'];
$rutaweb = $_ENV['RUTA_WEB'];

function validarImagen($archivo) {
    $tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp'];
    $tamañoMaximo = 2 * 1024 * 1024; // 2MB
    if ($archivo['error'] !== UPLOAD_ERR_OK) return false;
    if (!in_array($archivo['type'], $tiposPermitidos)) return false;
    if ($archivo['size'] > $tamañoMaximo) return false;
    return true;
}

function subirImagen($archivo, $carpeta, $rutaweb) {
    $ext = pathinfo($archivo['name'], PATHINFO_EXTENSION);
    $nombreUnico = uniqid('img_', true) . '.' . $ext;
    $ruta = $carpeta . '/' . $nombreUnico;
    if (move_uploaded_file($archivo['tmp_name'], $ruta)) {
        return $rutaweb . $ruta;
    }
    return '';
}

function skuExiste($conexion, $tabla, $campo, $valor) {
    $sql = "SELECT COUNT(*) FROM `$tabla` WHERE `$campo` = :valor";
    $stmt = $conexion->prepare($sql);
    $stmt->bindValue(':valor', $valor, PDO::PARAM_STR);
    $stmt->execute();
    return $stmt->fetchColumn() > 0;
}

try {
    $dsn = "mysql:host=$servidor;dbname=$dbname";
    $conexion = new PDO($dsn, $usuario, $contrasena);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Recoger datos POST
        $descripcion = trim($_POST['descripcion']);
        $titulo = trim($_POST['titulo']);
        
        $precio = $_POST['precio'] ?? '';
        $idCategoria = $_POST['idCategoria'] ?? '';
        $idSubCategoria = $_POST['idSubCategoria'] ?? '';
        $item1 = $_POST['item1'] ?? '';
        $item2 = $_POST['item2'] ?? '';
        $item3 = $_POST['item3'] ?? '';
        $item4 = $_POST['item4'] ?? '';
        $item5 = $_POST['item5'] ?? '';
        $item6 = $_POST['item6'] ?? '';
        $item7 = $_POST['item7'] ?? '';
        $item8 = $_POST['item8'] ?? '';
        $item9 = $_POST['item9'] ?? '';
        $item10 = $_POST['item10'] ?? '';
        $precioAnterior = $_POST['precioAnterior'] ?? 0;
        $stock = $_POST['stock'] ?? 0;
        $sku = strtoupper($_POST['sku']);
        $masVendido = strtolower(trim($_POST['masVendido'] ?? 'No'));
        $verItems = strtolower(trim($_POST['verItems'] ?? 'No'));
        $masVendido = ($masVendido === 'si') ? 'Si' : 'No';
        $verItems = ($verItems === 'si') ? 'Si' : 'No';
        
        $descripcion = strip_tags($descripcion);
        
        if (empty($titulo) || empty($descripcion) || empty($precio) || empty($sku)) {
            echo json_encode(["error" => "Por favor, complete  todos los campos obligatorios"]);
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

        // Validación de SKU único
        if (skuExiste($conexion, 'productos', 'sku', $sku)) {
            echo json_encode(["error" => "SKU '$sku' ya existe"]);
            exit;
        }

        // Manejo de imágenes
        $carpetaImagenes = './imagenes_productos';
        if (!file_exists($carpetaImagenes)) {
            mkdir($carpetaImagenes, 0777, true);
        }
        $imagenes = [];
        for ($i = 1; $i <= 4; $i++) {
            $key = 'imagen' . $i;
            if (isset($_FILES[$key]) && validarImagen($_FILES[$key])) {
                $imagenes[$i] = subirImagen($_FILES[$key], $carpetaImagenes, $rutaweb);
            } else {
                $imagenes[$i] = '';
            }
        }
        // Al menos una imagen obligatoria
        if (empty($imagenes[1]) && empty($imagenes[2]) && empty($imagenes[3]) && empty($imagenes[4])) {
            echo json_encode(["error" => "Debe seleccionar al menos una imagen válida (jpg, png, webp, máx 2MB)"]);
            exit;
        }

        // Insertar en base de datos
        $sqlInsert = "INSERT INTO `productos` (
            descripcion, titulo, precio, idCategoria, idSubCategoria, masVendido, imagen1, imagen2, imagen3, imagen4,
            item1, item2, item3, item4, item5, item6, item7, item8, item9, item10, precioAnterior, stock, sku, verItems
        ) VALUES (
            :descripcion, :titulo, :precio, :idCategoria, :idSubCategoria, :masVendido, :imagen1, :imagen2, :imagen3, :imagen4,
            :item1, :item2, :item3, :item4, :item5, :item6, :item7, :item8, :item9, :item10, :precioAnterior, :stock, :sku, :verItems
        )";
        $stmt = $conexion->prepare($sqlInsert);
        $stmt->bindParam(':descripcion', $descripcion);
        $stmt->bindParam(':titulo', $titulo);
        $stmt->bindParam(':precio', $precio);
        $stmt->bindParam(':idCategoria', $idCategoria);
        $stmt->bindParam(':idSubCategoria', $idSubCategoria);
        $stmt->bindParam(':masVendido', $masVendido);
        $stmt->bindParam(':imagen1', $imagenes[1]);
        $stmt->bindParam(':imagen2', $imagenes[2]);
        $stmt->bindParam(':imagen3', $imagenes[3]);
        $stmt->bindParam(':imagen4', $imagenes[4]);
        $stmt->bindParam(':item1', $item1);
        $stmt->bindParam(':item2', $item2);
        $stmt->bindParam(':item3', $item3);
        $stmt->bindParam(':item4', $item4);
        $stmt->bindParam(':item5', $item5);
        $stmt->bindParam(':item6', $item6);
        $stmt->bindParam(':item7', $item7);
        $stmt->bindParam(':item8', $item8);
        $stmt->bindParam(':item9', $item9);
        $stmt->bindParam(':item10', $item10);
        $stmt->bindParam(':precioAnterior', $precioAnterior);
        $stmt->bindParam(':stock', $stock);
        $stmt->bindParam(':sku', $sku );
        $stmt->bindParam(':verItems', $verItems);

        try {
            $stmt->execute();
            $lastId = $conexion->lastInsertId();
            $sqlSelect = "SELECT createdAt FROM `productos` WHERE idProducto = :lastId";
            $stmtSelect = $conexion->prepare($sqlSelect);
            $stmtSelect->bindParam(':lastId', $lastId);
            $stmtSelect->execute();
            $createdAt = $stmtSelect->fetchColumn();

            echo json_encode([
                "mensaje" => "Producto creado exitosamente",    
                "idProducto" => (int)$lastId,   
                "imagen1" => $imagenes[1],
                "imagen2" => $imagenes[2],
                "imagen3" => $imagenes[3],
                "imagen4" => $imagenes[4],
                "createdAt" => $createdAt
            ]);
        } catch (PDOException $e) {
            if ($e->errorInfo[1] == 1062) {
                echo json_encode(["error" => "Error: SKU duplicado en base de datos"]);
            } else {
                echo json_encode(["error" => "Error de base de datos: " . $e->getMessage()]);
            }
            exit;
        }
    } else {
        echo json_encode(["error" => "Método no permitido"]);
    }
} catch (PDOException $error) {
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
}
?>
