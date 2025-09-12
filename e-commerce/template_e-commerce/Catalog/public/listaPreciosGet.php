<?php
// header("Access-Control-Allow-Origin: http://localhost:3000");
// header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
// header("Access-Control-Allow-Headers: Content-Type, Authorization");
// header("Vary: Origin");  // Importante para cacheo correcto
require __DIR__.'/vendor/autoload.php';
require_once 'cors_headers.php';
require_once 'Utils.php';

// Manejo de solicitudes OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}



// Cargar variables de entorno desde el archivo .env
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
        // $tipoLista =  'catalogo';
        $tipoLista = $_GET['tipo_lista'] ?? 'catalogo';
        $tiposPermitidos = ['catalogo', 'droshipper'];

        if (!in_array($tipoLista, $tiposPermitidos)) {
            throw new Exception('Tipo de lista no válido');
        }
        //   p.descripcion,
        $sqlSelect = "SELECT
                        l.idListaPrecio,  
                        p.idProducto,
                        p.titulo,
                      
                        p.idCategoria,
                        c.categoria,
                        p.idSubCategoria,
                        s.subcategoria,
                        p.imagen1,
                        l.precio,
                        l.tipoLista,
                        l.estado,
                        l.vigenciaDesde
                    FROM lista_precios l
                    INNER JOIN productos p ON l.idProducto = p.idProducto
                    LEFT JOIN categorias c ON p.idCategoria = c.idCategoria
                    LEFT JOIN subcategorias s ON p.idSubCategoria = s.idSubCategoria
                    ORDER BY p.idProducto,l.tipoLista,l.estado;
        ";

        $sentencia = $conexion->prepare($sqlSelect);
        // $sentencia->bindParam(':tipoLista', $tipoLista, PDO::PARAM_STR);
        
        if ($sentencia->execute()) {
            // Obtener resultados
            $resultado = $sentencia->fetchAll(PDO::FETCH_ASSOC);

            // Imprimir datos en formato JSON
            echo json_encode(["listaprecios" => $resultado]);
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
