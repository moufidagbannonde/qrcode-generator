const express = require('express');
const QRCode = require('qrcode');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');

// Créer le dossier assets s'il n'existe pas
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir);
}

// Servir les fichiers statiques du dossier assets
app.use('/assets', express.static(assetsDir));

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/', async (req, res) => {
    const text = req.body.text; // Récupère le texte ou l'URL du formulaire
    console.log("Texte reçu :", text); // Log pour vérifier la valeur
    try {
        if (!text) {
            throw new Error("Le texte ne peut pas être vide !");
        }
        const qrCode = await QRCode.toDataURL(text); // Génère le code QR

        // Sauvegarde de l'image QR en format PNG dans le dossier assets
        const base64Data = qrCode.replace(/^data:image\/png;base64,/, "");
        const sanitizedText = text.replace(/[<>:"/\\|?*]/g, ''); // Enlève les caractères invalides
        const fileName = path.join(assetsDir, `${sanitizedText}.png`); // Crée un nom de fichier basé sur le texte
        fs.writeFileSync(fileName, base64Data, 'base64'); // Sauvegarde le fichier
        console.log(`Code QR généré et enregistré sous ${fileName}`);

        // Renvoie uniquement l'URL de l'image QR générée
        res.send(`/assets/${sanitizedText}.png`);
    } catch (err) {
        console.error("Erreur lors de la génération du code QR:", err);
        res.status(500).send("Erreur lors de la génération du code QR"); // Gère les erreurs
    }
});

app.listen(3000, () => {
    console.log('Serveur en cours d\'exécution sur http://localhost:3000');
});
