<?php
$host = 'localhost';
$db   = 'association_troglos';
$user = 'root';
$pass = 'root'; 
$port = 8889; 

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$db;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    header('Content-Type: application/json');
    echo json_encode(["status" => "error", "message" => "Liaison BDD échouée : " . $e->getMessage()]);
    exit;
}
?>