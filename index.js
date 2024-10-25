const QRCode = require('qrcode');
const fs = require('fs');

const generateQRCode = async (text) => {
    try {
        const qrCode = await QRCode.toDataURL(text);
        // Sauvegarde de l'image QR en format PNG
        const base64Data = qrCode.replace(/^data:image\/png;base64,/, "");
        fs.writeFileSync("qrcode.png", base64Data, 'base64');
        console.log("Code QR généré et enregistré sous qrcode.png");
    } catch (err) {
        console.error("Erreur lors de la génération du code QR:", err);
    }
};

// Exemple d'utilisation
generateQRCode("https://moufid.com");