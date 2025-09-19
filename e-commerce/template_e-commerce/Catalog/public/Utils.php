<?php
class Utils {
    // Respuesta estándar
  public static function responder($success, $mensaje, $data = null) {
    if ($success) {
        // Siempre incluye la clave "data", aunque esté vacía
        $respuesta = [
            "success" => true,
            "mensaje" => $mensaje,
            "data" => $data ?? []
        ];
    } else {
        // Para errores, puedes devolver data vacía o solo el error
        $respuesta = [
            "success" => false,
            "error" => $mensaje,
            // "data" => []
        ];
    }
    echo json_encode($respuesta);
    exit;
}

    public static function validarCampos($post) {
        $requeridos = [
            'tipo_asesor' => 'Tipo',
            'doc_asesor' => 'Documento',
            'pin_asesor' => 'PIN',
        ];
        foreach ($requeridos as $campo => $nombre) {
            if (empty($post[$campo])) {
                self::responder(false, "Campo requerido: $nombre");
            }
        }
    }

    public static function validarPin($pin) {
        if (!preg_match('/^[A-Z0-9]{8,10}$/i', $pin)) {
            self::responder(false, "Formato de PIN inválido (8-10 caracteres alfanuméricos)");
        }
    }

    public static function validarDocumento($doc) {
        if (!preg_match('/^\d{6,15}$/', $doc)) {
            self::responder(false, "Formato de documento inválido");
        }
    }

    public static function validarTipo($tipo) {
        $tipos_validos = ['dropshipper'];
        if (!in_array(strtolower($tipo), $tipos_validos)) {
            self::responder(false, "Tipo de asesor inválido");
        }
    }

    public static function generarUUID(): string 
    {
        $data = random_bytes(16);
        $data[6] = chr(ord($data[6]) & 0x0f | 0x40); // Versión 4
        $data[8] = chr(ord($data[8]) & 0x3f | 0x80); // Variante RFC 4122
        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }
    }
?>
