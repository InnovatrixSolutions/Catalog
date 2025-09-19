<?php
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
    $dsn = "mysql:host=$servidor;dbname=$dbname";
    $conexion = new PDO($dsn, $usuario, $contrasena);
    $conexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Función para crear una tabla si no existe
    function crearTablaSiNoExiste($conexion, $nombreTabla, $consultaSQL) {
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

    // Crear tabla 'categorias' si no existe
    $consultaCategorias = "CREATE TABLE IF NOT EXISTS `categorias` (
        idCategoria INT(11) AUTO_INCREMENT PRIMARY KEY,
        categoria VARCHAR(100) NOT NULL,
        orden INT(100)
    )";
    crearTablaSiNoExiste($conexion, 'categorias', $consultaCategorias);

       
 // Crear tabla 'subcategorias' si no existe
 $consultaSubCategorias = "CREATE TABLE IF NOT EXISTS `subcategorias` (
    idSubCategoria INT(11) AUTO_INCREMENT PRIMARY KEY,
    idCategoria INT(100) NOT NULL,
    subcategoria VARCHAR(100) NOT NULL
)";
crearTablaSiNoExiste($conexion, 'subcategorias', $consultaSubCategorias);
    
  

    // Crear tabla 'banner' si no existe
    $consultaBanner = "CREATE TABLE IF NOT EXISTS `banner` (
        idBanner INT(11) AUTO_INCREMENT PRIMARY KEY,
        imagen VARCHAR(900) NOT NULL,
        seleccion VARCHAR(10) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    crearTablaSiNoExiste($conexion, 'banner', $consultaBanner);

    // Crear tabla 'productos' si no existe
    $consultaProductos = "CREATE TABLE IF NOT EXISTS `productos` (
        idProducto INT(11) AUTO_INCREMENT PRIMARY KEY,
        descripcion TEXT NOT NULL,
        titulo VARCHAR(255) NOT NULL,
        precio INT(100) NOT NULL,
        idCategoria INT(100) NOT NULL,
        idSubCategoria INT(100),
        masVendido VARCHAR(30) NOT NULL,
        imagen1 VARCHAR(900),
        imagen2 VARCHAR(900),
        imagen3 VARCHAR(900),
        imagen4 VARCHAR(900),
        item1 VARCHAR(255),
        item2 VARCHAR(255),
        item3 VARCHAR(255),
        item4 VARCHAR(255),
        item5 VARCHAR(255),
        item6 VARCHAR(255),
        item7 VARCHAR(255),
        item8 VARCHAR(255),
        item9 VARCHAR(255),
        item10 VARCHAR(255),
        precioAnterior INT(100) NOT NULL,
        stock INT(255),
        verItems VARCHAR(30) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    crearTablaSiNoExiste($conexion, 'productos', $consultaProductos);

    // Crear tabla 'tienda' si no existe
    $consultaTiendas = "CREATE TABLE IF NOT EXISTS `tienda` (
        idTienda INT(11) AUTO_INCREMENT PRIMARY KEY,
        imagen1 VARCHAR(900),
        nombre VARCHAR(100) NOT NULL,
        telefono VARCHAR(20) NOT NULL,
        email VARCHAR(100),
        eslogan VARCHAR(100),
        direccion VARCHAR(255) NOT NULL,
        instagram VARCHAR(100),
        facebook VARCHAR(100),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    crearTablaSiNoExiste($conexion, 'tienda', $consultaTiendas);

     // Crear tabla 'estado' si no existe
     $consultaEstado = "CREATE TABLE IF NOT EXISTS `estado` (
        idEstado INT(11) AUTO_INCREMENT PRIMARY KEY,
        estado VARCHAR(10)
    )";
    crearTablaSiNoExiste($conexion, 'estado', $consultaEstado);

    // Crear tabla 'pedidos' si no existe
    $consultaPedidos = "CREATE TABLE IF NOT EXISTS `pedidos` (
                idPedido INT(11) AUTO_INCREMENT PRIMARY KEY,
                estado VARCHAR(50) NOT NULL,
                productos JSON NOT NULL,
                total DECIMAL(10,2) NOT NULL,
                nota VARCHAR(255),
                nombre VARCHAR(50),
                codigo VARCHAR(50),
                entrega VARCHAR(100) NOT NULL,
                telefono VARCHAR(20),
                pago VARCHAR(50) NOT NULL,
                pagado VARCHAR(50) NOT NULL,
                pagoRecibir VARCHAR(10),
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )";
    crearTablaSiNoExiste($conexion, 'pedidos', $consultaPedidos);

    // Crear tabla 'usuarios' si no existe
    $consultaUsuarios = "CREATE TABLE IF NOT EXISTS `usuarios` (
        idUsuario INT(11) AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        contrasena VARCHAR(255) NOT NULL,
        rol  VARCHAR(100) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    crearTablaSiNoExiste($conexion, 'usuarios', $consultaUsuarios);

    $contrasenaAdmin = password_hash('admin1234', PASSWORD_DEFAULT);

   // Crear tabla 'codigos' si no existe
    $consultaCodigos = "CREATE TABLE IF NOT EXISTS `codigos` (
    idCodigo INT(11) AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL,
    descuento DECIMAL(5,2) DEFAULT 0,
    tipo VARCHAR(50) NOT NULL,
    limite INT(50) DEFAULT 0,
    idCategoria INT(50)  DEFAULT 0,
    productos JSON,
    desde TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    hasta TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    crearTablaSiNoExiste($conexion, 'codigos', $consultaCodigos);



    // Crear tabla 'metodos' si no existe
    $consultaMetodos = "CREATE TABLE IF NOT EXISTS `metodos` (
        idMetodo INT(11) AUTO_INCREMENT PRIMARY KEY,
        tipo VARCHAR(255) NOT NULL,
        estado VARCHAR(20) NOT NULL,
        datos VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    crearTablaSiNoExiste($conexion, 'metodos', $consultaMetodos);

// Insertar ESTADO
$sqlInsertEstado = "INSERT INTO `estado` (estado) 
                  VALUES ('Abierto')";
$stmtEstado = $conexion->prepare($sqlInsertEstado);
$stmtEstado->execute();


// Insertar nuevo usuario admin
$sqlInsertAdmin = "INSERT INTO `usuarios` (nombre, email, contrasena, rol, createdAt) 
                  VALUES ('admin', 'admin@gmail.com', :contrasenaAdmin, 'admin', NOW())";
$stmtAdmin = $conexion->prepare($sqlInsertAdmin);
$stmtAdmin->bindParam(':contrasenaAdmin', $contrasenaAdmin);
$stmtAdmin->execute();

echo "Usuario admin creado correctamente.";
    
    echo "Proceso de creación de tablas finalizado.";
} catch (PDOException $error) {
    echo "Error de conexión: " . $error->getMessage();
}
?>
