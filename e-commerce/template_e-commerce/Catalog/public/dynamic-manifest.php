<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Cargar variables de entorno desde el archivo .env
require __DIR__.'/vendor/autoload.php';
use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Obtener los valores de las variables de entorno
$servidor = $_ENV['DB_HOST'] . ':' . $_ENV['DB_PORT'];
$usuario = $_ENV['DB_USER'];
$contrasena = $_ENV['DB_PASS'];
$dbname = $_ENV['DB_NAME'];
$rutaweb = $_ENV['RUTA_WEB'];

// Conectar a la base de datos
$conexion = new mysqli($servidor, $usuario, $contrasena, $dbname);

// Comprobar la conexión
if ($conexion->connect_error) {
    die('Error de conexión: ' . $conexion->connect_error);
}

// Consulta a la base de datos para obtener el nombre e imagen de la tienda
$sql = "SELECT nombre, imagen1 FROM tienda LIMIT 1";
$resultado = $conexion->query($sql);

// Verificar si hay resultados
if ($resultado->num_rows > 0) {
    // Obtener los datos de la tienda
    $fila = $resultado->fetch_assoc();
    $nombreTienda = $fila['nombre'];
    $imagenTienda = $fila['imagen1'];

    // Construir el manifest con los datos obtenidos de la base de datos
    $tienda = [
        'short_name' => $nombreTienda,
        'name' => $nombreTienda,
        'icons' => [
            [
                'src' => 'favicon.ico',
                'sizes' => '64x64 32x32 24x24 16x16',
                'type' => 'image/x-icon'
            ],
            [
                'src' => $imagenTienda, // Usamos la imagen obtenida desde la DB
                'type' => 'image/png',
                'sizes' => '192x192'
            ],
            [
                'src' => $imagenTienda, // Usamos la misma imagen para el tamaño grande
                'type' => 'image/png',
                'sizes' => '512x512'
            ]
        ],
        'start_url' => '.',
        'display' => 'standalone',
        'theme_color' => '#000000',
        'background_color' => '#ffffff'
    ];
} else {
    // Si no se encuentran datos, usar valores por defecto
    $tienda = [
        'short_name' => 'Nombre Tienda Dinámico',
        'name' => 'Nombre Tienda Completo',
        'icons' => [
            [
                'src' => 'favicon.ico',
                'sizes' => '64x64 32x32 24x24 16x16',
                'type' => 'image/x-icon'
            ],
            [
                'src' => 'logo192.png',
                'type' => 'image/png',
                'sizes' => '192x192'
            ],
            [
                'src' => 'logo512.png',
                'type' => 'image/png',
                'sizes' => '512x512'
            ]
        ],
        'start_url' => '.',
        'display' => 'standalone',
        'theme_color' => '#000000',
        'background_color' => '#ffffff'
    ];
}

// Cerrar la conexión
$conexion->close();

// Devolver el manifest en formato JSON
echo json_encode($tienda);
?>
