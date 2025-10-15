<?php
$allowed_origins = [
    "https://catalogo.mercadoyepes.co",
    "http://catalogo_jc.docker:8080",
    "http://catalogo_jc.docker:4000",
    "http://localhost:3000",
    "http://localhost:4000",
    "http://192.168.10.25:4000",
    "http://192.168.97.188:4000",
    "http://192.168.97.188:4000"

];
header('Content-Type: application/json');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With, X-API-KEY');
header('Access-Control-Allow-Credentials: true');
if (isset($_SERVER['HTTP_ORIGIN']) && in_array($_SERVER['HTTP_ORIGIN'], $allowed_origins)) {
    header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN']);
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}
?>
