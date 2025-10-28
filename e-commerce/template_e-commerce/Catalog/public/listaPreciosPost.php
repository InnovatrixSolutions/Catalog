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

$servidor  = $_ENV['DB_HOST'] . ':' . $_ENV['DB_PORT'];
$usuario   = $_ENV['DB_USER'];
$contrasena= $_ENV['DB_PASS'];
$dbname    = $_ENV['DB_NAME'];

try {
    $dsn = "mysql:host=$servidor;dbname=$dbname;charset=utf8mb4";
    $conexion = new PDO($dsn, $usuario, $contrasena, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Campos
        $idProducto    = $_POST['idProducto']    ?? '';
        $precio        = $_POST['precio']        ?? 0;
        $tipoListaRaw  = $_POST['tipoLista']     ?? '';
        $estado        = strtolower(trim($_POST['estado'] ?? 'actual'));
        $vigenciaDesde = $_POST['vigenciaDesde'] ?? '';
        $vigenciaHasta = $_POST['vigenciaHasta'] ?? null;

        // Normalización de tipoLista (acepta lo viejo pero lo guarda como "dropshipper")
        $tipoLista = strtolower(trim($tipoListaRaw));
        if ($tipoLista === 'droshipper') $tipoLista = 'dropshipper'; // compat backward
        // Set explícito de permitidos
        $tiposPermitidos   = ['catalogo', 'dropshipper'];
        $estadosPermitidos = ['actual', 'anterior'];

        // Validaciones
        $errores = [];
        if (empty($idProducto) || !is_numeric($idProducto)) {
            $errores[] = "idProducto es obligatorio y debe ser numérico";
        }
        // permite decimales; valida número >=0
        if ($precio === '' || !is_numeric($precio) || $precio < 0) {
            $errores[] = "precio es obligatorio y debe ser un número positivo";
        }
        if (!in_array($tipoLista, $tiposPermitidos, true)) {
            $errores[] = "tipoLista debe ser 'catalogo' o 'dropshipper'";
        }
        if (!in_array($estado, $estadosPermitidos, true)) {
            $errores[] = "estado debe ser 'actual' o 'anterior'";
        }
        if (empty($vigenciaDesde) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $vigenciaDesde)) {
            $errores[] = "vigenciaDesde es obligatorio y debe tener formato YYYY-MM-DD";
        }
        if ($vigenciaHasta && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $vigenciaHasta)) {
            $errores[] = "vigenciaHasta debe tener formato YYYY-MM-DD o estar vacío";
        }

        // Verifica producto
        $stmt = $conexion->prepare("SELECT COUNT(*) FROM productos WHERE idProducto = :idProducto");
        $stmt->bindValue(':idProducto', (int)$idProducto, PDO::PARAM_INT);
        $stmt->execute();
        if ($stmt->fetchColumn() == 0) {
            $errores[] = "El producto no existe";
        }

        if ($errores) {
            echo json_encode(["error" => implode(". ", $errores)]);
            exit;
        }

        // Insertar (nota: si 'precio' es DECIMAL en DB, usa STR para no truncar)
        $sql = "INSERT INTO lista_precios
                (idProducto, precio, tipoLista, estado, vigenciaDesde, vigenciaHasta)
                VALUES
                (:idProducto, :precio, :tipoLista, :estado, :vigenciaDesde, :vigenciaHasta)";
        $stmt = $conexion->prepare($sql);
        $stmt->bindValue(':idProducto', (int)$idProducto, PDO::PARAM_INT);
        $stmt->bindValue(':precio', (string)$precio, PDO::PARAM_STR); // evita truncar decimales
        $stmt->bindValue(':tipoLista', $tipoLista, PDO::PARAM_STR);
        $stmt->bindValue(':estado', $estado, PDO::PARAM_STR);
        $stmt->bindValue(':vigenciaDesde', $vigenciaDesde, PDO::PARAM_STR);
        $stmt->bindValue(':vigenciaHasta', $vigenciaHasta ?: null, PDO::PARAM_NULL);

        try {
            $stmt->execute();
            $lastId = $conexion->lastInsertId();
            echo json_encode([
                "mensaje"       => "Precio creado exitosamente",
                "producto"      => (int)$idProducto,
                "precio"        => (string)$precio,
                "tipoLista"     => $tipoLista,        // siempre "catalogo" o "dropshipper"
                "estado"        => $estado,
                "vigenciaDesde" => $vigenciaDesde,
                "vigenciaHasta" => $vigenciaHasta,
                "idListaPrecio" => (int)$lastId
            ]);
        } catch (PDOException $e) {
            if (isset($e->errorInfo[1]) && $e->errorInfo[1] == 1062) {
                echo json_encode(["error" => "Ya existe un precio con ese producto, tipoLista y estado"]);
            } else {
                echo json_encode(["error" => "Error de base de datos: " . $e->getMessage()]);
            }
        }
    } else {
        echo json_encode(["error" => "Método no permitido"]);
    }
} catch (PDOException $e) {
    echo json_encode(["error" => "Error de conexión: " . $e->getMessage()]);
}
