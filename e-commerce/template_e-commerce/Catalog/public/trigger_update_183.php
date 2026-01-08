<?php
$url = 'http://localhost/pedidoPut.php?idPedido=183';
$data = ['costo_envio' => 22000000];
$options = [
    'http' => [
        'header'  => "Content-type: application/json\r\n",
        'method'  => 'PUT',
        'content' => json_encode($data),
        'ignore_errors' => true // Capture error responses too
    ],
];
$context  = stream_context_create($options);
$result = file_get_contents($url, false, $context);

echo "Response headers:\n";
print_r($http_response_header);
echo "\nResponse body:\n";
echo $result;
?>
