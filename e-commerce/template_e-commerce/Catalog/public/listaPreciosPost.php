<?php
header("Content-Type: application/json");
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require __DIR__.'/vendor/autoload.php';
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

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Recoger y limpiar campos
        $idProducto = $_POST['idProducto'] ?? '';
        $precio = $_POST['precio'] ?? 0;
        $tipoLista = strtolower(trim($_POST['tipoLista'] ?? ''));
        $estado = strtolower(trim($_POST['estado'] ?? 'actual'));
        $vigenciaDesde = $_POST['vigenciaDesde'] ?? '';
        $vigenciaHasta = $_POST['vigenciaHasta'] ?? null;

        // Validaciones básicas
        $tiposPermitidos = ['catalogo', 'dropshipper'];
        $estadosPermitidos = ['actual', 'anterior'];
        $errores = [];

        if (empty($idProducto) || !is_numeric($idProducto)) $errores[] = "idProducto es obligatorio y debe ser numérico";
        if (empty($precio) || !is_numeric($precio) || $precio < 0) $errores[] = "precio es obligatorio y debe ser un número positivo";
        if (!in_array($tipoLista, $tiposPermitidos)) $errores[] = "tipoLista debe ser 'catalogo' o 'droshipper'";
        if (!in_array($estado, $estadosPermitidos)) $errores[] = "estado debe ser 'actual' o 'anterior'";
        if (empty($vigenciaDesde) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $vigenciaDesde)) $errores[] = "vigenciaDesde es obligatorio y debe tener formato YYYY-MM-DD";
        if ($vigenciaHasta && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $vigenciaHasta)) $errores[] = "vigenciaHasta debe tener formato YYYY-MM-DD o estar vacío";

        // Validar que el producto exista
        $stmt = $conexion->prepare("SELECT COUNT(*) FROM productos WHERE idProducto = :idProducto");
        $stmt->bindParam(':idProducto', $idProducto, PDO::PARAM_INT);
        $stmt->execute();
        if ($stmt->fetchColumn() == 0) $errores[] = "El producto no existe";

        if (!empty($errores)) {
            echo json_encode(["error" => implode(". ", $errores)]);
            exit;
        }

        // Insertar en la tabla (manejo de duplicados por índice único)
        $sql = "INSERT INTO lista_precios (idProducto, precio, tipoLista, estado, vigenciaDesde, vigenciaHasta)
                VALUES (:idProducto, :precio, :tipoLista, :estado, :vigenciaDesde, :vigenciaHasta)";
        $stmt = $conexion->prepare($sql);
        $stmt->bindParam(':idProducto', $idProducto, PDO::PARAM_INT);
        $stmt->bindParam(':precio', $precio, PDO::PARAM_INT);
        $stmt->bindParam(':tipoLista', $tipoLista);
        $stmt->bindParam(':estado', $estado);
        $stmt->bindParam(':vigenciaDesde', $vigenciaDesde);
        $stmt->bindParam(':vigenciaHasta', $vigenciaHasta);

        try {
            $stmt->execute();
            $lastId = $conexion->lastInsertId();
            echo json_encode([
                "mensaje" => "Precio creado exitosamente",
                "producto"=>$idProducto,
                "precio"=>$precio,
                "tipoLista"=>$tipoLista,
                "estado"=>$estado,
                "idListaPrecio" => $lastId
            ]);
        } catch (PDOException $e) {
            if ($e->errorInfo[1] == 1062) {
                echo json_encode(["error" => "Ya existe un precio con ese producto, tipoLista y estado"]);
            } else {
                echo json_encode(["error" => "Error de base de datos: " . $e->getMessage()]);
            }
        }
    } else {
        echo json_encode(["error" => "Método no permitido"]);
    }
} catch (PDOException $error) {
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
}
?>
