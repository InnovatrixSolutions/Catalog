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
    $dsn = "mysql:host=$servidor;dbname=$dbname;charset=utf8mb4"; 
    $conexion = new PDO($dsn, $usuario, $contrasena);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $delimiter = ';'; 
    $pathfolder = 'importFiles'; 
    $fileName = 'productos.csv'; 
    $csvFile = $pathfolder . '/' . $fileName; 

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        if (!file_exists($csvFile) || !is_readable($csvFile)) {
            echo json_encode(["error" => "El archivo no existe o no se puede leer."]);
            exit;
        }

        if (($handle = fopen($csvFile, 'r')) !== false) {
            $headers = fgetcsv($handle, 0, $delimiter);

            $sqlInsert = "INSERT INTO products (titulo, descripcion, precio, precioAnterior,
                                                idCategoria, idSubCategoria, stock,
                                                masVendido,
                                                imagen1, imagen2, imagen3, imagen4,
                                                verItems, item1, item2, item3, item4,
                                                item5, item6, item7, item8, item9, item10) 
                          VALUES (:titulo, :descripcion, :precio, :precioAnterior,
                                  :idCategoria, :idSubCategoria, :stock,
                                  :masVendido,
                                  :imagen1, :imagen2, :imagen3, :imagen4,
                                  :verItems, :item1, :item2, :item3, :item4,
                                  :item5, :item6, :item7, :item8, :item9, :item10)";
            $stmt = $conexion->prepare($sqlInsert);

            while (($data = fgetcsv($handle, 0, $delimiter)) !== false) {
                if (count($data) === count($headers)) {
                    $titulo = $data[1];
                    $descripcion = $data[2];
                    $precio = isset($data[3]) ? (int)$data[3] : null;
                    $precioAnterior = isset($data[4]) ? (int)$data[4] : null;
                    $idCategoria = isset($data[5]) ? (int)$data[5] : null;
                    $idSubCategoria = isset($data[6]) ? (int)$data[6] : null;
                    $stock = isset($data[7]) ? (int)$data[7] : null;
                    $masVendido = isset($data[8]) ? $data[8] : null;
                    $imagen1 = isset($data[9]) ? $data[9] : null;
                    $imagen2 = isset($data[10]) ? $data[10] : null;
                    $imagen3 = isset($data[11]) ? $data[11] : null;
                    $imagen4 = isset($data[12]) ? $data[12] : null;
                    $verItems = isset($data[13]) ? $data[13] : 'No';
                    $item1 = isset($data[14]) ? $data[14] : null;
                    $item2 = isset($data[15]) ? $data[15] : null;
                    $item3 = isset($data[16]) ? $data[16] : null;
                    $item4 = isset($data[17]) ? $data[17] : null;
                    $item5 = isset($data[18]) ? $data[18] : null;
                    $item6 = isset($data[19]) ? $data[19] : null;
                    $item7 = isset($data[20]) ? $data[20] : null;
                    $item8 = isset($data[21]) ? $data[21] : null;
                    $item9 = isset($data[22]) ? $data[22] : null;
                    $item10 = isset($data[23]) ? $data[23] : null;

                    try {
                        if ($stmt->execute([
                            ':titulo' => (string)$titulo,
                            ':descripcion' => (string)$descripcion,
                            ':precio' => (int)$precio,
                            ':precioAnterior' => (int)$precioAnterior,
                            ':idCategoria' => (int)$idCategoria,
                            ':idSubCategoria' => (int)$idSubCategoria,
                            ':stock' => (int)$stock,
                            ':masVendido' => (string)$masVendido,
                            ':imagen1' => (string)$imagen1,
                            ':imagen2' => (string)$imagen2,
                            ':imagen3' => (string)$imagen3,
                            ':imagen4' => (string)$imagen4,
                            ':verItems' => (string)$verItems,
                            ':item1' => (string)$item1,
                            ':item2' => (string)$item2,
                            ':item3' => (string)$item3,
                            ':item4' => (string)$item4,
                            ':item5' => (string)$item5,
                            ':item6' => (string)$item6,
                            ':item7' => (string)$item7,
                            ':item8' => (string)$item8,
                            ':item9' => (string)$item9,
                            ':item10' => (string)$item10
                        ])) {
                          echo json_encode(["mensaje" => "Datos insertados correctamente."]);
                      } else {
                          echo json_encode(["error" => "Error al insertar los datos."]);
                      }
                      
                  } catch (Throwable $e) {
                      echo json_encode(["error" => "Error al insertar: " . json_encode(get_class($e))]);
                  }
                } else {
                    echo json_encode(["error" => "La fila no coincide con el número de columnas: " . implode(", ", array_map('trim', array_values($data)))]);
                    exit;
                }
            }

            fclose($handle);
            echo json_encode(["mensaje" => "Datos importados correctamente."]);
        } else {
            echo json_encode(["error" => "Error al abrir el archivo."]);
        }
    } else {
        echo json_encode(["error" => "Método no permitido"]);
    }
} catch (Throwable $e) {
    echo json_encode(["error" => "Error de conexión: " . get_class($e)]);
}
?>
