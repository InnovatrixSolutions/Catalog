<?php
require_once 'Utils.php';

class AddressManager {
    public static function getCountries($conexion) {
        $sql = "SELECT id, name FROM countries WHERE iso3 = :codeiso AND is_active=1";
        $stmt = $conexion->prepare($sql);
        $stmt->execute([':codeiso' => 'COL']);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function getStates($conexion, $country_id) {
        $sql = "SELECT id, name, latitude, longitude FROM states WHERE country_id = :countryId AND is_active=1";
        $stmt = $conexion->prepare($sql);
        $stmt->execute([':countryId' => $country_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function getCities($conexion, $country_id, $state_id) {
        $sql = "SELECT id, name FROM cities WHERE country_id = :countryId AND state_id = :stateId AND is_active=1";
        $stmt = $conexion->prepare($sql);
        $stmt->execute([
            ':countryId' => $country_id,
            ':stateId' => $state_id
        ]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
