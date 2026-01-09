<?php
require __DIR__ . '/vendor/autoload.php';
require_once 'cors_headers.php';
require_once 'Utils.php';

// Manejo de solicitudes OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}


use Dotenv\Dotenv;

header("Content-Type: application/json");
header('Access-Control-Allow-Origin: *');

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

class DatabaseUpdater
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function run($nameTable, $createTableSQL, $alterSQLs = [], $indexSQLs = [], $foreignKeySQLs = [])
    {
        try {
            $resultadoTabla = $this->createTable($nameTable, $createTableSQL);
            $resultadoColumnas = $this->addColumns($nameTable, $alterSQLs);
            $resultadoIndices = $this->createIndexes($nameTable, $indexSQLs);
            $resultadoForeignKeys = $this->addForeignKeys($nameTable, $foreignKeySQLs);

            echo json_encode([
                "success" => true,
                "tabla" => $resultadoTabla,
                "columnas" => $resultadoColumnas,
                "indices" => $resultadoIndices,
                "foreign_keys" => $resultadoForeignKeys
            ]);
        } catch (PDOException $e) {
            echo json_encode(["success" => false, "error" => "🔥 Error: " . $e->getMessage()]);
        }
    }

    private function createTable($nameTable, $sql)
    {
        $stmt = $this->pdo->prepare("SHOW TABLES LIKE ?");
        $stmt->execute([$nameTable]);

        if ($stmt->rowCount() == 0) {
            $this->pdo->exec($this->cleanSQL($sql));
            $resultados[] = [
                'existe' => false,
                'mensaje' => "Tabla '$nameTable' creada."
            ];;
            return  $resultados;
        } else {
            $resultados[] = [
                'existe' => true,
                'mensaje' => "Tabla '$nameTable' ya existía."
            ];
            return  $resultados;
        }
    }

    private function addColumns($nameTable, $sqlStatements)
    {
        $resultados = [];
        foreach ($sqlStatements as $sql) {
            $columnName = $this->extractColumnName($sql);
            if (!$columnName) {
                $resultados[] = ['error' => "SQL inválido: $sql"];
                continue;
            }

            if ($this->columnExists($nameTable, $columnName)) {
                $resultados[] = ['Warning' => "Columna '$columnName' ya existe."];
                continue;
            }

            try {
                $cleanSQL = str_replace('{table}', $nameTable, $this->cleanSQL($sql));
                $this->pdo->exec($cleanSQL);
                $resultados[] = ['success' => "Columna '$columnName' agregada."];
            } catch (PDOException $e) {
                $resultados[] = ['error' => "Error en columna '$columnName': " . $e->getMessage()];
            }
        }
        return $resultados;
    }

    private function createIndexes($nameTable, $sqlStatements)
    {
        $resultados = [];
        foreach ($sqlStatements as $sql) {
            $indexName = $this->extractIndexName($sql);
            if (!$indexName) {
                $resultados[] = [
                    'error' => "SQL inválido (no se pudo extraer nombre): $sql"
                ];
                continue;
            }

            if ($this->indexExists($nameTable, $indexName)) {
                $resultados[] = ['info' => "Índice '$indexName' ya existe."];
                continue;
            }

            try {
                $cleanSQL = str_replace('{table}', $nameTable, $this->cleanSQL($sql));
                $this->pdo->exec($cleanSQL);
                $resultados[] = ['success' => "Índice/clave única '$indexName' creado."];
            } catch (PDOException $e) {
                $resultados[] = ['error' => "Error en índice/clave '$indexName': " . $e->getMessage()];
            }
        }
        return $resultados;
    }

    private function addForeignKeys($nameTable, $foreignKeySQLs)
    {
        $resultados = [];
        foreach ($foreignKeySQLs as $sql) {
            $constraintName = $this->extractConstraintName($sql);
            if (!$constraintName) {
                $resultados[] = ['error' => "SQL inválido: $sql"];
                continue;
            }

            try {
                // Paso 1: Eliminar la restricción si existe
                if ($this->foreignKeyExists($nameTable, $constraintName)) {
                    $this->pdo->exec("ALTER TABLE $nameTable DROP FOREIGN KEY $constraintName");
                    $resultados[] = ['info' => "Clave foránea '$constraintName' eliminada."];
                }

                // Paso 2: Crear la nueva restricción
                $cleanSQL = str_replace('{table}', $nameTable, $this->cleanSQL($sql));
                $this->pdo->exec($cleanSQL);
                $resultados[] = ['success' => "Clave foránea '$constraintName' creada."];
            } catch (PDOException $e) {
                $resultados[] = ['error' => "Error en clave foránea '$constraintName': " . $e->getMessage()];
            }
        }
        return $resultados;
    }

    private function dropForeignKey($table, $constraintName)
    {
        if ($this->foreignKeyExists($table, $constraintName)) {
            $this->pdo->exec("ALTER TABLE $table DROP FOREIGN KEY $constraintName");
        }
    }

    private function foreignKeyExists($table, $constraintName)
    {
        $stmt = $this->pdo->prepare("
        SELECT COUNT(*) 
        FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = :table 
        AND CONSTRAINT_NAME = :constraint 
        AND CONSTRAINT_TYPE = 'FOREIGN KEY'
    ");
        $stmt->execute([':table' => $table, ':constraint' => $constraintName]);
        return (bool) $stmt->fetchColumn();
    }



    private function extractConstraintName($sql)
    {
        preg_match('/CONSTRAINT\s+?(\w+)?/i', $sql, $matches);
        return $matches[1] ?? null;
    }

    private function columnExists($table, $column)
    {
        $stmt = $this->pdo->prepare("
            SELECT COUNT(*) 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = :table 
            AND COLUMN_NAME = :column
        ");
        $stmt->execute([':table' => $table, ':column' => $column]);
        return (bool) $stmt->fetchColumn();
    }
    private function indexExists($table, $indexName)
    {
        $stmt = $this->pdo->prepare("SHOW INDEX FROM $table WHERE Key_name = ?");
        $stmt->execute([$indexName]);
        return (bool) $stmt->fetch();
    }


    private function extractColumnName($sql)
    {
        preg_match('/ADD COLUMN (?:IF NOT EXISTS )??(\w+)?/i', $sql, $matches);
        return $matches[1] ?? null;
    }



    private function extractIndexName($sql)
    {
        // Captura tanto CREATE INDEX como ALTER TABLE ADD UNIQUE KEY
        preg_match('/(?:CREATE INDEX|ADD UNIQUE KEY)\s+(?:IF NOT EXISTS\s+)??(\w+)?/i', $sql, $matches);
        return $matches[1] ?? null;
    }


    private function cleanSQL($sql)
    {
        // Eliminar comentarios y espacios innecesarios
        $sql = preg_replace('/--.*?(\r\n|\n)/', '', $sql); // Eliminar comentarios --
        $sql = preg_replace('/\/\*.*?\*\//s', '', $sql); // Eliminar comentarios /* */
        $sql = preg_replace('/\s+/', ' ', $sql); // Espacios múltiples -> 1 espacio
        return trim($sql);
    }
}

// Uso
try {
    $pdo = new PDO("mysql:host={$_ENV['DB_HOST']};dbname={$_ENV['DB_NAME']}", $_ENV['DB_USER'], $_ENV['DB_PASS']);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // corregir fecha_despacho datetime
    $updater = new DatabaseUpdater($pdo);
    // $tableName = 'countries';
    // $updater->run(
    //     $tableName,
    //     "CREATE TABLE IF NOT EXISTS countries (
    //     id bigint unsigned NOT NULL AUTO_INCREMENT,
    //     name varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    //     iso2 varchar(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    //     iso3 varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    //     numeric_code varchar(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    //     phonecode varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    //     capital varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    //     currency varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    //     currency_name varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    //     currency_symbol varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    //     tld varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    //     native varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    //     region varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    //     subregion varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    //     timezones text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    //     translations text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    //     latitude decimal(10,8) DEFAULT NULL,
    //     longitude decimal(11,8) DEFAULT NULL,
    //     emoji varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    //     emojiU varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    //     flag tinyint(1) NOT NULL DEFAULT '1',
    //     is_active tinyint(1) NOT NULL DEFAULT '1',
    //     created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    //     updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    //     deleted_at timestamp NULL DEFAULT NULL,
    //     PRIMARY KEY (id),
    //     UNIQUE KEY countries_iso2_unique (iso2),
    //     UNIQUE KEY countries_iso3_unique (iso3),
    //     KEY countries_is_active_index (is_active)
    //     ) ENGINE=InnoDB AUTO_INCREMENT=234 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
    //     [

    //     ],
    //     [

    //     ]
    // );

    // $tableName = 'states';
    // $updater->run(
    //     $tableName,
    //     "CREATE TABLE IF NOT EXISTS states (
    //     id bigint unsigned NOT NULL AUTO_INCREMENT,
    //     country_id bigint unsigned NOT NULL,
    //     name varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    //     latitude decimal(10,8) DEFAULT NULL,
    //     longitude decimal(11,8) DEFAULT NULL,
    //     is_active tinyint(1) NOT NULL DEFAULT '1',
    //     created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    //     updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    //     deleted_at timestamp NULL DEFAULT NULL,
    //     PRIMARY KEY (id),
    //     KEY states_country_id_index (country_id),
    //     KEY states_is_active_index (is_active)
    //     ) ENGINE=InnoDB AUTO_INCREMENT=4922 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
    //     [
    //         //Add columns

    //     ],
    //     [
    //         "CREATE INDEX idx_states_country_id ON {table} (country_id)",
    //         "CREATE INDEX idx_states_is_active ON {table} (is_active)",

    //     ],
    //     [ // Claves foráneas separadas
    //     "ALTER TABLE {table} 
    //      ADD CONSTRAINT fk_states_country_id 
    //     FOREIGN KEY (country_id) REFERENCES countries (id) 
    //     ON DELETE CASCADE ON UPDATE CASCADE"
    // ]
    // );

    // $tableName = 'cities';
    // Ejemplo para tabla 'cities'
    // $updater->run(
    //     $tableName,
    //     "CREATE TABLE IF NOT EXISTS cities (
    //         id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    //         country_id BIGINT UNSIGNED NOT NULL,
    //         state_id BIGINT UNSIGNED NOT NULL,
    //         is_active tinyint(1) NOT NULL DEFAULT '1',
    //         name VARCHAR(100) NOT NULL,
    //         PRIMARY KEY (id)
    //     ) ENGINE=InnoDB",
    //     [
    //         "ALTER TABLE {table} ADD COLUMN latitude DECIMAL(10,8) NULL",
    //         "ALTER TABLE {table} ADD COLUMN longitude DECIMAL(11,8) NULL"
    //     ],
    //     [
    //         "CREATE INDEX idx_cities_country ON {table} (country_id)",
    //         "CREATE INDEX idx_cities_state_id ON {table} (state_id)",
    //         "CREATE INDEX idx_cities_is_active ON {table} (is_active)"
    //     ],
    //     [
    //         "ALTER TABLE {table} 
    //         ADD CONSTRAINT fkt_cities_country_id 
    //         FOREIGN KEY (country_id) REFERENCES countries(id) 
    //         ON DELETE CASCADE",

    //         "ALTER TABLE {table} 
    //         ADD CONSTRAINT fkt_cities_state_id 
    //         FOREIGN KEY (state_id) REFERENCES states(id) 
    //         ON DELETE CASCADE"
    //     ]
    // );




    // $tableName = 'asesores';
    // $updater->run(
    //     $tableName,
    //     "CREATE TABLE IF NOT EXISTS asesores (
    //         idAsesor INT(10) NOT NULL AUTO_INCREMENT,
    //         tipo VARCHAR(20) NOT NULL,
    //         documento VARCHAR(20) NOT NULL,
    //         nombre_completo VARCHAR(100) NOT NULL,
    //         telefono_whatsapp VARCHAR(20) NOT NULL,
    //         estado TINYINT(1) NOT NULL DEFAULT 1,
    //         fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    //         PRIMARY KEY (idAsesor),
    //         UNIQUE KEY uq_documento (documento)
    //     ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
    //     [
    //         "ALTER TABLE {table} ADD COLUMN pin VARCHAR(10) NULL AFTER telefono_whatsapp",
    //         "ALTER TABLE {table} ADD COLUMN email VARCHAR(100) NULL AFTER pin",
    //         "ALTER TABLE {table}  ADD COLUMN telefono VARCHAR(20) NULL AFTER documento",
    //         "ALTER TABLE {table}  ADD COLUMN medio_pago_comision VARCHAR(50) NULL AFTER telefono_whatsapp",
             
    //     ],
    //     [
    //         "CREATE INDEX idx_activo ON {table} (activo)",
    //         "CREATE INDEX idx_tipo ON {table} (tipo)",
    //         "ALTER TABLE asesores ADD UNIQUE KEY unique_documento_pin (documento, pin)"

    //     ],
    //     []
    // );



    // $tableName = 'pedidos';
    // //campo pago, //Transferencia,Efectivo
    // $updater->run(
    //     $tableName,
    //     "CREATE TABLE IF NOT EXISTS {table} (
    //         idPedido INT(10) NOT NULL AUTO_INCREMENT,
    //         estado VARCHAR(50) NOT NULL,
    //         productos JSON NOT NULL,
    //         total DECIMAL(10,2) NOT NULL,
    //         nota VARCHAR(255) DEFAULT NULL,
    //         nombre VARCHAR(50) DEFAULT NULL,
    //         codigo VARCHAR(50) DEFAULT NULL,
    //         entrega VARCHAR(100) NOT NULL,
    //         telefono VARCHAR(20) DEFAULT NULL,
    //         pago VARCHAR(50) NOT NULL, 
    //         pagado VARCHAR(50) NOT NULL,
    //         pagoRecibir VARCHAR(10) DEFAULT NULL,
    //         createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    //         PRIMARY KEY (idPedido)
    //     )",
    //     [
    //         // //add column
    //         "ALTER TABLE {table}  ADD COLUMN city_id BIGINT(20) UNSIGNED AFTER entrega",
    //         "ALTER TABLE {table}  ADD COLUMN state_id BIGINT(20) UNSIGNED AFTER city_id",
    //         "ALTER TABLE {table}  ADD COLUMN country_id BIGINT(20) UNSIGNED AFTER state_id",
    //         "ALTER TABLE {table}  ADD COLUMN tipo_pedido VARCHAR(20) NOT NULL DEFAULT 'catalogo' AFTER idPedido",
    //         "ALTER TABLE {table}  ADD COLUMN total_productos  DECIMAL(10,2) NOT NULL  AFTER total",
    //         "ALTER TABLE {table}  ADD COLUMN fecha_despacho DATE NULL AFTER punto_referencia",
    //         "ALTER TABLE {table}  ADD COLUMN franja_horario VARCHAR(50) NULL AFTER fecha_despacho",
    //         "ALTER TABLE {table}  ADD COLUMN telefono_tran VARCHAR(20) NULL AFTER telefono",
    //         "ALTER TABLE {table}  ADD COLUMN total_cupon DECIMAL(10,2) NULL AFTER total_productos",
    //         "ALTER TABLE {table}  ADD COLUMN valor_cupon DECIMAL(5,2) NULL DEFAULT '0.00' AFTER total_cupon",
    //         "ALTER TABLE {table}  ADD COLUMN tipo_cupon VARCHAR(20) NULL AFTER valor_cupon",
    //         "ALTER TABLE {table}  ADD COLUMN forma_pago VARCHAR(50) NULL AFTER pago",
    //         //lista de alternativas de pago.
    //     ],
    //     [
    //         "CREATE INDEX idx_country_id ON {table} (country_id)",
    //         "CREATE INDEX idx_tipo_pedido ON {table} (tipo_pedido)",
    //         "CREATE INDEX idx_state_id ON {table} (state_id)",
    //         "CREATE INDEX idx_city_id ON {table} (city_id)"
    //     ],
    //     [
    //         "ALTER TABLE {table}  ADD CONSTRAINT fk_{table}_country_id    FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE",
    //         "ALTER TABLE {table}  ADD CONSTRAINT fk_{table}_state_id    FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE CASCADE",
    //         "ALTER TABLE {table}  ADD CONSTRAINT fk_{table}_city_id    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE"
    //     ]

    // );



    $tableName = 'pedido_asesores';
    $updater->run(
        $tableName,
        "CREATE TABLE IF NOT EXISTS pedido_asesores (
            idRelacion INT(10) NOT NULL AUTO_INCREMENT,
            idPedido INT(10) NOT NULL,
            idAsesor INT(10) NOT NULL,
            comision_tipo VARCHAR(10) NOT NULL CHECK (comision_tipo IN ('manual', 'auto','fijo')),
            comision_valor DECIMAL(10,2) NOT NULL,
            medio_pago_comision VARCHAR(50) NOT NULL,
            estado_comision VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado_comision IN ('pendiente', 'pagado', 'cancelado', 'retenido')),
            fecha_pago_comision DATE NULL,
            PRIMARY KEY (idRelacion)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci",
        [
            // "ALTER TABLE {table}  ADD COLUMN total_cupon DECIMAL(5,2) NULL DEFAULT '0.00' AFTER comision_valor",
            "ALTER TABLE {table}  ADD COLUMN utilidad_bruta DECIMAL(15, 2) DEFAULT 0.00 AFTER fecha_pago_comision",
            "ALTER TABLE {table}  ADD COLUMN utilidad_neta DECIMAL(15, 2) DEFAULT 0.00 AFTER utilidad_bruta"
        ],
        [//index
        ],
        [
            // "ALTER TABLE {table}  ADD CONSTRAINT fk_{table}_id           FOREIGN KEY (idPedido) REFERENCES pedidos (idPedido) ON DELETE CASCADE",
            // "ALTER TABLE {table}  ADD CONSTRAINT fk_{table}_asesor_id    FOREIGN KEY (idAsesor) REFERENCES asesores (idAsesor) ON DELETE CASCADE",
        ]
    );

$tableName = 'codigos';
    $updater->run(
        $tableName,
        "CREATE TABLE IF NOT EXISTS codigos (
            idCodigo INT(10) NOT NULL AUTO_INCREMENT,
            codigo VARCHAR(50) NOT NULL ,
            descuento DECIMAL(5,2) NULL DEFAULT '0.00',
            tipo VARCHAR(50) NOT NULL ',
            limite INT(10) NULL DEFAULT '0',
            idCategoria INT(10) NULL DEFAULT '0',
            productos JSON NULL DEFAULT NULL,
            desde TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
            hasta TIMESTAMP NULL DEFAULT NULL,
            PRIMARY KEY (idCodigo)
        ) ENGINE=InnoDB",
        [
           "ALTER TABLE {table}  ADD COLUMN estado ENUM('activo', 'inactivo')  DEFAULT 'activo' AFTER hasta"
        ],
        [
            //index
        ],
        [
            //forenkey
        ]
    );


} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => "🔥 Error crítico: " . $e->getMessage()]);
}
