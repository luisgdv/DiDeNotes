//controller that manages company logo image uploads
const StorageModel = require('../models/storage.js')
const {uploadToPinata} = require('../utils/handleIPFS.js')
const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file was uploaded' });
        }
        
        const fileBuffer = req.file.buffer
        const filename = req.file.originalname
        console.log(req.file);
        const pinataResponse = await uploadToPinata(fileBuffer, filename)
        const ipfsFile = pinataResponse.IpfsHash
        const ipfs = `https://${process.env.PINATA_GATEWAY_URL}/ipfs/${ipfsFile}`
        console.log("IPFS:", ipfs);
        
        const data = await StorageModel.create({filename, url: ipfs});
        //const dataRes = { ...data._doc, uri: ipfs}
        res.json(data)
    }catch(err) {
        console.log(err)
        res.status(500).send("ERROR_UPLOAD_COMPANY_IMAGE");
    }
}

module.exports = {uploadImage}