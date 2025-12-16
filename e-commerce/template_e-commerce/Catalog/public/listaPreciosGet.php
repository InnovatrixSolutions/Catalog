<?php
require __DIR__.'/vendor/autoload.php';
require_once 'cors_headers.php';
require_once 'Utils.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

$servidor   = $_ENV['DB_HOST'] . ':' . $_ENV['DB_PORT'];
$usuario    = $_ENV['DB_USER'];
$contrasena = $_ENV['DB_PASS'];
$dbname     = $_ENV['DB_NAME'];

try {
    $dsn = "mysql:host=$servidor;dbname=$dbname";
    $conexion = new PDO($dsn, $usuario, $contrasena, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);

    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        echo json_encode(["error" => "Método no permitido"]);
        exit;
    }

    $idProducto = $_GET['idProducto'] ?? null;
    $tipoLista  = $_GET['tipo_lista'] ?? null; // opcional

    $tiposPermitidos = ['catalogo', 'dropshipper'];
    if ($tipoLista && !in_array(strtolower(trim($tipoLista)), $tiposPermitidos)) {
        echo json_encode(["error" => "tipo_lista no válido"]);
        exit;
    }

    $sql = "
        SELECT
            l.idListaPrecio,
            l.idProducto,
            l.precio,
            LOWER(l.tipoLista) AS tipoLista,
            LOWER(l.estado) AS estado,
            l.vigenciaDesde,
            l.vigenciaHasta,

            p.titulo,
            p.sku,
            p.imagen1,
            p.idCategoria,
            p.idSubCategoria,

            c.categoria,
            s.subcategoria

        FROM lista_precios l
        INNER JOIN productos p ON p.idProducto = l.idProducto
        LEFT JOIN categorias c ON c.idCategoria = p.idCategoria
        LEFT JOIN subcategorias s ON s.idSubCategoria = p.idSubCategoria
        WHERE 1=1
    ";

    $params = [];

    if ($idProducto !== null) {
        if (!is_numeric($idProducto)) {
            echo json_encode(["error" => "idProducto inválido"]);
            exit;
        }
        $sql .= " AND l.idProducto = :idProducto ";
        $params[':idProducto'] = (int)$idProducto;
    }

    if ($tipoLista) {
        $sql .= " AND LOWER(l.tipoLista) = :tipoLista ";
        $params[':tipoLista'] = strtolower(trim($tipoLista));
    }

    $sql .= " ORDER BY l.idProducto, l.tipoLista, l.estado;";

    $stmt = $conexion->prepare($sql);
    $stmt->execute($params);

    $resultado = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(["listaprecios" => $resultado]);

} catch (PDOException $e) {
    echo json_encode(["error" => "Error de conexión: " . $e->getMessage()]);
}
