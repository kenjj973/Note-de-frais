const BAREME_KM = 0.606;
let canvas, ctx, enTrainDeSigner = false;

document.addEventListener('DOMContentLoaded', () => {
    // Ajout d'une ligne de frais par défaut à l'ouverture
    ajouterLigneFrais();

    // Initialisation du pad de signature
    canvas = document.getElementById('signature-pad');
    if (canvas) {
        ctx = canvas.getContext('2d');
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        initSignatureEvents();
    }
});

function ajouterLigneFrais() {
    const tbody = document.getElementById('frais-tbody');
    const row = document.createElement('tr');
    
    row.innerHTML = `
        <td><input type="date" class="input-frais-date"></td>
        <td><input type="text" class="input-frais-objet" placeholder="Ex: Trajet Lyon-Paris"></td>
        <td><input type="number" class="input-frais-km" value="0" step="0.1" oninput="calculerTotaux()"></td>
        <td><input type="number" class="input-frais-transports" value="0" step="0.01" oninput="calculerTotaux()"></td>
        <td><input type="number" class="input-frais-autres" value="0" step="0.01" oninput="calculerTotaux()"></td>
        <td class="no-print"><button type="button" class="btn-delete" onclick="this.parentElement.parentElement.remove(); calculerTotaux();">Supprimer</button></td>
    `;
    tbody.appendChild(row);
}

function calculerTotaux() {
    let totalKm = 0;
    let totalTransports = 0;
    let totalAutres = 0;

    document.querySelectorAll('#frais-tbody tr').forEach(row => {
        const km = parseFloat(row.querySelector('.input-frais-km').value) || 0;
        const peage = parseFloat(row.querySelector('.input-frais-transports').value) || 0;
        const autres = parseFloat(row.querySelector('.input-frais-autres').value) || 0;

        totalKm += km * BAREME_KM;
        totalTransports += peage;
        totalAutres += autres;
    });

    document.getElementById('total-calcul-km').innerText = totalKm.toFixed(2);
    document.getElementById('total-cat-peage').innerText = totalTransports.toFixed(2);
    document.getElementById('total-cat-autres').innerText = totalAutres.toFixed(2);
    
    const grandTotal = totalKm + totalTransports + totalAutres;
    document.getElementById('total-general').innerText = grandTotal.toFixed(2);
    
    if(document.getElementById('input-somme-abandon')) {
        document.getElementById('input-somme-abandon').value = grandTotal.toFixed(2);
    }
    document.getElementById('somme-remboursement').innerText = grandTotal.toFixed(2);
}

function toggleOptionReglement(type) {
    const abandonDiv = document.getElementById('details-abandon');
    const remboursementDiv = document.getElementById('details-remboursement');
    
    if (type === 'abandon') {
        abandonDiv.classList.add('active');
        remboursementDiv.classList.remove('active');
    } else {
        abandonDiv.classList.remove('active');
        remboursementDiv.classList.add('active');
    }
}

async function validerEtGenerer() {
    const data = {
        nom_demandeur: document.getElementById('nom').value,
        date_demande: document.getElementById('date_demande').value,
        raison: document.getElementById('raison').value,
        budget: document.getElementById('budget').value,
        total_general: document.getElementById('total-general').innerText,
        type_reglement: document.querySelector('input[name="mode_reglement"]:checked').value,
        iban: document.getElementById('input-iban').value || null,
        bic: document.getElementById('input-bic').value || null,
        lignes: []
    };

    document.querySelectorAll('#frais-tbody tr').forEach(row => {
        const dateVal = row.querySelector('.input-frais-date').value;
        if (dateVal !== "") {
            data.lignes.push({
                date: dateVal,
                objet: row.querySelector('.input-frais-objet').value,
                km: row.querySelector('.input-frais-km').value || 0,
                peage: row.querySelector('.input-frais-transports').value || 0,
                autres: row.querySelector('.input-frais-autres').value || 0
            });
        }
    });

    if (!data.nom_demandeur) { return alert("Veuillez saisir le nom de l'employe."); }
    if (data.lignes.length === 0) { return alert("Veuillez remplir au moins une ligne de frais avec une date."); }

    try {
        const response = await fetch('sauvegarder.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.status === "success") {
            alert("Donnees enregistrees. Generation du PDF et preparation du mail...");
            
            // 1. Generation du PDF
            genererPDF(); 

            // 2. Preparation du mail (mailto)
            const destinataire = "kenryjeanjacques@gmail.com";
            const objetMail = encodeURIComponent(`Note de Frais - ${data.nom_demandeur} (${data.raison})`);
            const corpsMail = encodeURIComponent(
                `Bonjour,\n\n` +
                `Je viens d'enregistrer une nouvelle note de frais via le formulaire en ligne.\n\n` +
                `Details :\n` +
                `- Demandeur : ${data.nom_demandeur}\n` +
                `- Raison : ${data.raison}\n` +
                `- Montant Total : ${data.total_general} euros\n` +
                `- Mode de reglement : ${data.type_reglement.toUpperCase()}\n\n` +
                `Le PDF correspondant a ete telecharge. Merci de bien vouloir l'ajouter en piece jointe.\n\n` +
                `Cordialement.`
            );

            // Petit delai pour laisser le PDF se lancer avant d'ouvrir le mail
            setTimeout(() => {
                window.location.href = `mailto:${destinataire}?subject=${objetMail}&body=${corpsMail}`;
            }, 2000);

        } else {
            alert("Erreur base de donnees : " + result.message);
        }
    } catch (error) {
        alert("Erreur de connexion au serveur.");
        console.error(error);
    }
}

function genererPDF() {
    const element = document.getElementById('note-frais-page');
    const nom = document.getElementById('nom').value || "Note";
    
    const options = {
        margin: [10, 10, 10, 10], // Marges Haut, Gauche, Bas, Droite
        filename: `NoteFrais_${nom}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2, 
            useCORS: true,
            scrollY: 0 // Evite les decalages si la page est scrollee
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] } // Empeche de couper les tableaux n'importe ou
    };
    
    html2pdf().set(options).from(element).save();
}

function initSignatureEvents() {
    const obtenirPos = (e) => {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const demarrer = (e) => {
        enTrainDeSigner = true;
        const pos = obtenirPos(e);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        if (e.type === 'touchstart') e.preventDefault();
    };

    const dessiner = (e) => {
        if (!enTrainDeSigner) return;
        const pos = obtenirPos(e);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        if (e.type === 'touchmove') e.preventDefault();
    };

    const arreter = () => { enTrainDeSigner = false; };

    canvas.addEventListener('mousedown', demarrer);
    canvas.addEventListener('mousemove', dessiner);
    window.addEventListener('mouseup', arreter);

    canvas.addEventListener('touchstart', demarrer, { passive: false });
    canvas.addEventListener('touchmove', dessiner, { passive: false });
    canvas.addEventListener('touchend', arreter);
}

function effacerSignature() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}