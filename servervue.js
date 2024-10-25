const express = require('express');
const QRCode = require('qrcode');
const app = express();
const path = require('path');
const fs = require('fs');
const cors = require('cors');

// Activer CORS pour permettre les requêtes cross-origin
app.use(cors());

// Middleware pour parser le corps des requêtes JSON
app.use(express.json());

// Créer le dossier assets s'il n'existe pas
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir);
}

// Créer un fichier JSON pour stocker les URLs si il n'existe pas
const urlsFilePath = path.join(__dirname, 'urls.json');
if (!fs.existsSync(urlsFilePath)) {
    fs.writeFileSync(urlsFilePath, JSON.stringify([])); // Crée un fichier vide
}

// Fonction pour lire les URLs stockées
function readUrls() {
    const data = fs.readFileSync(urlsFilePath);
    return JSON.parse(data);
}

// Fonction pour écrire les URLs dans le fichier
function writeUrl(url) {
    const urls = readUrls();
    urls.push(url);
    fs.writeFileSync(urlsFilePath, JSON.stringify(urls, null, 2)); // Écrit les URLs avec indentation
}

// Servir les fichiers statiques du dossier assets
app.use('/assets', express.static(assetsDir));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/', async (req, res) => {
    console.log("Requête reçue", req.body); // Log le corps de la requête
    const text = req.body.text;
    console.log("Texte reçu :", text); // Log pour vérifier la valeur
    try {
        if (!text) {
            throw new Error("Le texte ne peut pas être vide !");
        }

        const qrCode = await QRCode.toDataURL(text);
        console.log("Code QR généré avec succès");

        // Sauvegarde de l'image QR en format PNG dans le dossier assets
        const base64Data = qrCode.replace(/^data:image\/png;base64,/, "");
        const sanitizedText = text.replace(/[<>:"/\\|?*]/g, ''); // Enlève les caractères invalides
        const fileName = path.join(assetsDir, `${sanitizedText}.png`);
        
        fs.writeFileSync(fileName, base64Data, 'base64'); // Sauvegarde le fichier
        console.log(`Code QR généré et enregistré sous ${fileName}`);

        // Stockage de l'URL dans le fichier JSON
        const urlToStore = `/assets/${sanitizedText}.png`;
        writeUrl(urlToStore);

        // Renvoie l'URL de l'image QR générée
        res.send(urlToStore);
    } catch (err) {
        console.error("Erreur lors de la génération du code QR:", err);
        res.status(500).send("Erreur lors de la génération du code QR"); // Gère les erreurs
    }
});

app.listen(3000, () => {
    console.log('Serveur en cours d\'exécution sur http://localhost:3000');
});
