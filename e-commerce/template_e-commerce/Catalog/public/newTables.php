<?php
// Cargar variables de entorno desde el archivo .env
require __DIR__ . '/vendor/autoload.php';
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
    function crearTablaSiNoExiste($conexion, $nombreTabla, $consultaSQL)
    {
        $sql = "SHOW TABLES LIKE '$nombreTabla'";
        $stmt = $conexion->prepare($sql);
        $stmt->execute();

        if ($stmt->rowCount() == 0) {
            // La tabla no existe, se crea
            $stmtCreate = $conexion->prepare($consultaSQL);
            $stmtCreate->execute();
            echo "Tabla $nombreTabla creada correctamente.<br>";
        } else {
            echo "La tabla $nombreTabla ya existe.<br>";
        }
    }

    $dsn = "mysql:host=$servidor;dbname=$dbname";
    $conexion = new PDO($dsn, $usuario, $contrasena);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);


    $nameTable = 'lista_precios';
    $ListaPreciosSql = "CREATE TABLE IF NOT EXISTS `lista_precios` (
        idListaPrecio INT(11) AUTO_INCREMENT PRIMARY KEY,
        idProducto INT(11) NOT NULL,
        precio INT(100) NOT NULL,
        tipoLista ENUM('catalogo', 'droshipper') NOT NULL,
        estado ENUM('Actual', 'Anterior') NOT NULL DEFAULT 'Actual',
        vigenciaDesde DATE NOT NULL,
        vigenciaHasta DATE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (idProducto) REFERENCES productos(idProducto) ON DELETE CASCADE
    )";

    crearTablaSiNoExiste($conexion, $nameTable, $ListaPreciosSql);

    $sqlCheckIndex = "SHOW INDEX FROM usuarios WHERE Key_name = 'idx_usuariosEmail'";
    $stmt = $conexion->prepare($sqlCheckIndex);
    $stmt->execute();
    $indexExists = $stmt->fetch();

    if (!$indexExists) {
        $sqlIndex = "CREATE UNIQUE INDEX idx_usuariosEmail ON usuarios (email)";
        $stmt = $conexion->prepare($sqlIndex);
        $stmt->execute();
        echo "Index created<br>";
    } else {
        echo "Index already exists<br>";
    }


    $sqlCheckIndex = "SHOW INDEX FROM lista_precios WHERE Key_name = 'idx_listaPrecios'";
    $stmt = $conexion->prepare($sqlCheckIndex);
    $stmt->execute();
    $indexExists = $stmt->fetch();

    if (!$indexExists) {
        $sqlIndex = "CREATE UNIQUE INDEX idx_listaPrecios ON lista_precios (idProducto, tipoLista, estado)";
        $stmt = $conexion->prepare($sqlIndex);
        $stmt->execute();
        echo "Index created<br>";
    } else {
        echo "Index already exists<br>";
    }


    /*
    add field to tables productos
     */
    $sqlCheckColumn = "SHOW COLUMNS FROM productos LIKE 'sku'";
    $stmt = $conexion->prepare($sqlCheckColumn);
    $stmt->execute();
    $columnExists = $stmt->fetch();

    if (!$columnExists) {
        $sql = "ALTER TABLE productos ADD sku VARCHAR(50) NULL AFTER titulo";
        $stmt = $conexion->prepare($sql);
        $stmt->execute();
        echo "Field 'sku' added to productos<br>";
    } else {
        echo "Field 'sku' already exists in productos<br>";
    }

    // Verificar si el índice único ya existe
    $sqlCheckIndex = "SHOW INDEX FROM productos WHERE Key_name = 'idx_sku'";
    $stmt = $conexion->prepare($sqlCheckIndex);
    $stmt->execute();
    $indexExists = $stmt->fetch();

    if (!$indexExists) {
        $sqlAddIndex = "ALTER TABLE productos ADD UNIQUE INDEX idx_sku (sku)";
        $stmt = $conexion->prepare($sqlAddIndex);
        $stmt->execute();
        echo "Unique index 'idx_sku' added to productos<br>";
    } else {
        echo "Unique index 'idx_sku' already exists in productos<br>";
    }


    /*
    add field to tables pedidos
     */
    $sqlCheckColumn = "SHOW COLUMNS FROM pedidos LIKE 'transportadora'";
    $stmt = $conexion->prepare($sqlCheckColumn);
    $stmt->execute();
    $columnExists = $stmt->fetch();

    if (!$columnExists) {
        $sql = "ALTER TABLE pedidos ADD estado_comision VARCHAR(20) NOT NULL DEFAULT 'pendiente' AFTER pagoRecibir, ADD valor_flete INT(11) NULL AFTER estado_comision";

        $stmt = $conexion->prepare($sql);
        $stmt->execute();
        echo "Field 'transportadora' added to pedidos<br>";
    } else {
        echo "Field 'transportadora' already exists in pedidos<br>";
    }


    /*
    add field to tables pedidos
     */
    $sqlCheckColumn = "SHOW COLUMNS FROM pedidos LIKE 'transportadora'";
    $stmt = $conexion->prepare($sqlCheckColumn);
    $stmt->execute();
    $columnExists = $stmt->fetch();

    if (!$columnExists) {
        $sql = "ALTER TABLE pedidos ADD numero_guia VARCHAR(50) NULL AFTER pagoRecibir";
        $stmt = $conexion->prepare($sql);
        $stmt->execute();
        echo "Field 'numero_guia' added to pedidos<br>";
    } else {
        echo "Field 'numero_guia' already exists in pedidos<br>";
    }

    /*
    add field to tables pedidos
     */
    $sqlCheckColumn = "SHOW COLUMNS FROM pedidos LIKE 'valor_flete'";
    $stmt = $conexion->prepare($sqlCheckColumn);
    $stmt->execute();
    $columnExists = $stmt->fetch();

    if (!$columnExists) {
        $sql = "ALTER TABLE pedidos ADD transportadora VARCHAR(50) NULL AFTER pagoRecibir";
        $stmt = $conexion->prepare($sql);
        $stmt->execute();
        echo "Field 'valor_flete' added to pedidos<br>";
    } else {
        echo "Field 'valor_flete' already exists in pedidos<br>";
    }
} catch (PDOException $error) {
    echo "Error de conexión: " . $error->getMessage();
}
