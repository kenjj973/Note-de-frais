# Note-de-frais
Projet-de-spé-dev
Générateur de Notes de Frais - Les Troglos
Ce projet est une application web Fullstack permettant aux membres de l'association spéléologique "Les Troglos" de saisir, signer et sauvegarder leurs notes de frais de manière dématérialisée.

Fonctionnalités
Formulaire Dynamique : Ajout et suppression de lignes de frais en temps réel.

Calcul Automatique : Gestion du barème kilométrique (0,606 euro/km) et calcul instantané des totaux et des dons fiscaux.

Signature Numérique : Intégration d'un "Signature Pad" (HTML5 Canvas) pour signer sans avoir besoin d'imprimer.

Génération de PDF : Exportation immédiate de la note au format PDF via la bibliothèque html2pdf.js.

Persistance des données : Sauvegarde sécurisée dans une base de données MySQL via une API PHP.

Stack Technique
Front-end

HTML5 / CSS3 : Structure et design (optimisé pour l'impression avec les règles @media print).

JavaScript (Vanilla) : Logique métier, calculs asynchrones et manipulation du DOM.

html2pdf.js : Bibliothèque de conversion HTML vers PDF.

Back-end

PHP 8.x : Traitement des données et interface avec la base de données.

MySQL : Stockage relationnel des notes et des lignes de frais.

API Fetch et JSON : Communication asynchrone entre le client et le serveur.

Installation et Configuration
Environnement : Utiliser un serveur local tel que MAMP, WAMP ou XAMPP.

Base de données :

Créer une base de données nommée association_troglos.

Importer le fichier SQL fourni pour créer les tables notes_frais et lignes_frais.

Configuration :

Modifier le fichier db_config.php avec vos identifiants de connexion (par défaut root / root sur le port 8889 pour MAMP).

Structure de la Base de Données
L'application repose sur un modèle relationnel :

Table notes_frais : Contient les informations du demandeur, la raison de la dépense et le total général.

Table lignes_frais : Contient le détail de chaque dépense, liée à la note principale par une clé étrangère (note_id).

Utilisation
Lancer MAMP et ouvrir le projet via l'URL locale (exemple : http://localhost:8888/notedefrais/).

Remplir les champs du demandeur et ajouter les dépenses dans le tableau.

Signer dans la zone dédiée à l'aide de la souris ou d'un écran tactile.

Cliquer sur le bouton "Enregistrer et Générer le PDF".

Les données sont transmises au serveur pour archivage et le document PDF est téléchargé automatiquement.
