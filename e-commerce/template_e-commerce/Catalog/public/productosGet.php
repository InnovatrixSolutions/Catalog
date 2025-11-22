<?php
// header("Access-Control-Allow-Origin: http://localhost:3000");
// header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
// header("Access-Control-Allow-Headers: Content-Type, Authorization");
// header("Vary: Origin");  // Importante para cacheo correcto
// Cargar variables de entorno desde el archivo .env
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

// Obtener los valores de las variables de entorno
$servidor = $_ENV['DB_HOST'] . ':' . $_ENV['DB_PORT'];
$usuario = $_ENV['DB_USER'];
$contrasena = $_ENV['DB_PASS'];
$dbname = $_ENV['DB_NAME'];

try {
    // Establecer conexión a la base de datos
    $dsn = "mysql:host=$servidor;dbname=$dbname";
    $conexion = new PDO($dsn, $usuario, $contrasena);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Verificar el método de la solicitud
    $metodo = $_SERVER['REQUEST_METHOD'];

    // Consulta SQL para obtener todos los productos
    if ($metodo == 'GET') {
        // GET /productosGet.php?tipo_lista=catalogo
        $tipoLista = $_GET['tipo_lista'] ?? 'catalogo';
        $tiposPermitidos = ['catalogo', 'droshipper'];

        if (!in_array($tipoLista, $tiposPermitidos)) {
            throw new Exception('Tipo de lista no válido');
        }
        
        $sqlSelect = "
            SELECT 
                p.idProducto,
                p.precio as costoCompra,
                lp_actual.precio AS precio,
                lp_anterior.precio AS precioAnterior,
                lp_actual.tipoLista AS  tipoLista,
                p.titulo,
                p.descripcion,
                p.masVendido,
                p.sku,
                p.idCategoria,
                p.idSubCategoria,
                p.imagen1,
                p.imagen2,
                p.imagen3,
                p.imagen4,
                p.item1,
                p.item2,
                p.item3,
                p.item4,
                p.item5,
                p.item6,
                p.item7,
                p.item8,
                p.item9,
                p.item10,
                p.stock,
                p.verItems,
                p.createdAt
            FROM productos p
            LEFT JOIN lista_precios lp_actual 
                ON p.idProducto = lp_actual.idProducto 
                AND lp_actual.estado = 'Actual'
                AND lp_actual.tipoLista = :tipoLista
            LEFT JOIN lista_precios lp_anterior 
                ON p.idProducto = lp_anterior.idProducto 
                AND lp_anterior.estado = 'Anterior'
                AND lp_anterior.tipoLista = :tipoLista
             
        ";

        $sentencia = $conexion->prepare($sqlSelect);
        $sentencia->bindParam(':tipoLista', $tipoLista, PDO::PARAM_STR);
        
        if ($sentencia->execute()) {
            // Obtener resultados
            $resultado = $sentencia->fetchAll(PDO::FETCH_ASSOC);

            // Imprimir datos en formato JSON
            echo json_encode(["productos" => $resultado]);
        } else {
            // Imprimir mensaje de error si la ejecución de la consulta falla
            echo json_encode(["error" => "Error al ejecutar la consulta SQL: " . implode(", ", $sentencia->errorInfo())]);
        }
    }
} catch (PDOException $error) {
    // Manejar errores específicos de la conexión
    echo json_encode(["error" => "Error de conexión: " . $error->getMessage()]);
} catch (Exception $error) {
    // Manejar otros tipos de errores
    echo json_encode(["error" => "Error desconocido: " . $error->getMessage()]);
}
?>
