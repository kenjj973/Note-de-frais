<?php
header('Content-Type: application/json');
require_once 'db_config.php';

$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data) {
    echo json_encode(["status" => "error", "message" => "Aucune donnée reçue."]);
    exit;
}

try {
    
    $pdo->beginTransaction();

    
    $sqlNote = "INSERT INTO notes_frais (nom_demandeur, date_demande, raison, budget, total_general, type_reglement, iban, bic) 
                VALUES (:nom, :date_d, :raison, :budget, :total, :type_r, :iban, :bic)";
    
    $stmt = $pdo->prepare($sqlNote);
    $stmt->execute([
        ':nom'    => $data['nom_demandeur'],
        ':date_d' => $data['date_demande'],
        ':raison' => $data['raison'],
        ':budget' => $data['budget'],
        ':total'  => $data['total_general'],
        ':type_r' => $data['type_reglement'],
        ':iban'   => $data['iban'] ?? null,
        ':bic'    => $data['bic'] ?? null
    ]);

    
    $noteId = $pdo->lastInsertId();

    if (!empty($data['lignes'])) {
        $sqlLigne = "INSERT INTO lignes_frais (note_id, date_depense, objet, km, peages_transports, autres) 
                     VALUES (:note_id, :date_dep, :objet, :km, :peage, :autres)";
        $stmtLigne = $pdo->prepare($sqlLigne);

        foreach ($data['lignes'] as $ligne) {
            $stmtLigne->execute([
                ':note_id'  => $noteId,
                ':date_dep' => $ligne['date'],
                ':objet'    => $ligne['objet'],
                ':km'       => $ligne['km'] ?: 0,
                ':peage'    => $ligne['peage'] ?: 0,
                ':autres'   => $ligne['autres'] ?: 0
            ]);
        }
    }

    
    $pdo->commit();
    echo json_encode(["status" => "success", "message" => "La note n°$noteId a été enregistrée avec succès !"]);

} catch (Exception $e) {

    $pdo->rollBack();
    echo json_encode(["status" => "error", "message" => "Erreur SQL : " . $e->getMessage()]);
}
?>