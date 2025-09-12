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
        // Validar que sea una actualización
        $idListaPrecio = $_POST['idListaPrecio'] ?? null;
        if (!$idListaPrecio || !is_numeric($idListaPrecio)) {
            echo json_encode(["error" => "ID de lista de precios inválido"]);
            exit;
        }

        // Recoger y limpiar campos
        $idProducto = $_POST['idProducto'] ?? '';
        $precio = $_POST['precio'] ?? '';
        $tipoLista = strtolower(trim($_POST['tipoLista'] ?? ''));
        $estado = strtolower(trim($_POST['estado'] ?? 'actual'));
        $vigenciaDesde = $_POST['vigenciaDesde'] ?? '';
        $vigenciaHasta = $_POST['vigenciaHasta'] ?? null;

        // Validaciones básicas
        $tiposPermitidos = ['catalogo', 'dropshipper'];
        $estadosPermitidos = ['actual', 'anterior'];
        $errores = [];

        if (empty($idProducto) || !is_numeric($idProducto)) $errores[] = "idProducto inválido";
        if (empty($precio) || !is_numeric($precio) || $precio <= 0) $errores[] = "precio debe ser positivo";
        if (!in_array($tipoLista, $tiposPermitidos)) $errores[] = "tipoLista inválido";
        if (!in_array($estado, $estadosPermitidos)) $errores[] = "estado inválido";
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $vigenciaDesde)) $errores[] = "vigenciaDesde formato YYYY-MM-DD";
        if ($vigenciaHasta && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $vigenciaHasta)) $errores[] = "vigenciaHasta formato inválido";

        // Verificar existencia del registro
        $stmt = $conexion->prepare("SELECT COUNT(*) FROM lista_precios WHERE idListaPrecio = :id");
        $stmt->bindParam(':id', $idListaPrecio, PDO::PARAM_INT);
        $stmt->execute();
        if ($stmt->fetchColumn() == 0) $errores[] = "Registro no encontrado";

        // Validar que el producto exista
        $stmt = $conexion->prepare("SELECT COUNT(*) FROM productos WHERE idProducto = :idProducto");
        $stmt->bindParam(':idProducto', $idProducto, PDO::PARAM_INT);
        $stmt->execute();
        if ($stmt->fetchColumn() == 0) $errores[] = "El producto no existe";

        if (!empty($errores)) {
            echo json_encode(["error" => implode(". ", $errores)]);
            exit;
        }

        // Construir consulta dinámica
        $sql = "UPDATE lista_precios SET 
            idProducto = :idProducto,
            precio = :precio,
            tipoLista = :tipoLista,
            estado = :estado,
            vigenciaDesde = :vigenciaDesde,
            vigenciaHasta = :vigenciaHasta
            WHERE idListaPrecio = :idListaPrecio";
        $stmt = $conexion->prepare($sql);
        $stmt->bindParam(':idProducto', $idProducto, PDO::PARAM_INT);
        $stmt->bindParam(':precio', $precio, PDO::PARAM_INT);
        $stmt->bindParam(':tipoLista', $tipoLista);
        $stmt->bindParam(':estado', $estado);
        $stmt->bindParam(':vigenciaDesde', $vigenciaDesde);
        $stmt->bindParam(':vigenciaHasta', $vigenciaHasta);
        $stmt->bindParam(':idListaPrecio', $idListaPrecio, PDO::PARAM_INT);

        try {
            $stmt->execute();
            // Obtener registro actualizado
            $stmtSelect = $conexion->prepare("SELECT * FROM lista_precios WHERE idListaPrecio = :id");
            $stmtSelect->bindParam(':id', $idListaPrecio, PDO::PARAM_INT);
            $stmtSelect->execute();
            $registro = $stmtSelect->fetch(PDO::FETCH_ASSOC);

            echo json_encode([
                "mensaje" => "Precio actualizado exitosamente",
                "data" => $registro
            ]);
        } catch (PDOException $e) {
            if ($e->errorInfo[1] == 1062) {
                echo json_encode(["error" => "Ya existe un precio con estos parámetros (producto + tipoLista + estado)"]);
            } else {
                echo json_encode(["error" => "Error de base de datos: " . $e->getMessage()]);
            }
        }
    }
} catch (PDOException $error) {
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
}
?>
