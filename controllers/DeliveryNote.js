//controller that manages delivery notes
const DeliveryNote = require("../models/deliveryNote");
const Storage = require("../models/storage");
const { uploadToPinata } = require("../utils/handleIPFS");
const PDF = require("pdfkit");
//const {uploadImage} = require("./logo");
const axios = require('axios');

exports.createDeliveryNote = async (req, res) => {
  try {
    const note = await DeliveryNote.create({
      ...req.body,
      userId: req.user.id,
    });
    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDeliveryNotes = async (req, res) => {
  try {
    const filters = {
      userId: req.user.id,
      ...(req.query.signed === "true" ? { pending: false } : {}),
    };

    const notes = await DeliveryNote.find(filters);
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDeliveryNoteById = async (req, res) => {
  try {
    const note = await DeliveryNote.findById(req.params.id)
      .populate("userId")
      .populate("clientId")
      .populate("projectId");

    if (!note) return res.status(404).json({ message: "Delivery note not found" });

    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.signDeliveryNote = async (req, res) => {
    try {
        const deliveryNoteId = req.params.id;
        const { buffer, originalname } = req.file;
    
        const signResponse = await uploadToPinata(buffer, originalname);
        const signUrl = `https://${process.env.PINATA_GATEWAY_URL}/ipfs/${signResponse.IpfsHash}`;
    
        const note = await DeliveryNote.findById(deliveryNoteId).populate("userId").populate("clientId").populate("projectId");
    
        if (!note) return res.status(404).json({ message: "Delivery note not found" });
        if (!note.pending) return res.status(400).json({ message: "Already signed" });
    
        //arreglos errores en cannot read properties
        const userEmail = note.userId?.email || "Not available";
        const clientName = note.clientId?.name || "Not available";
        const projectName = note.projectId?.name || "Not available";

        const document = new PDF();
        let pdfBuffer = [];
    
        document.on("data", chunk => pdfBuffer.push(chunk));
        document.on("end", async () => {
          const finalBuffer = Buffer.concat(pdfBuffer);
    
          const pdfResponse = await uploadToPinata(finalBuffer, `deliverynote-${note._id}.pdf`);
          const pdfUrl = `https://${process.env.PINATA_GATEWAY_URL}/ipfs/${pdfResponse.IpfsHash}`;
    
          note.sign = signUrl;
          note.pdf = pdfUrl;
          note.pending = false;
          await note.save();
    
          res.status(200).json({
            message: "Delivery note signed!",
            sign: signUrl,
            pdf: pdfUrl
          });
        });
    
        document.fontSize(16).text("DELIVERY NOTE", { align: "center" }).moveDown();
        /* document.fontSize(12).text(`Usuario: ${note.userId.email}`);
        document.text(`Cliente: ${note.clientId.name}`);
        document.text(`Proyecto: ${note.projectId.name}`); */
        document.fontSize(12).text(`User: ${userEmail}`);
        document.text(`Client: ${clientName}`);
        document.text(`Project: ${projectName}`);
        document.text(`Description: ${note.description}`);
        document.text(`Format: ${note.format}`);
        /* document.text(`Horas: ${note.hours || "N/A"}`);
        document.text(`Trabajadores: ${note.workers.name || "N/A"}`);
        document.text(`Trabajadores (horas): ${note.workers.hours || "N/A"}`); 
        document.text(`Material: ${note.material || "N/A"}`);*/
        document.text(`Work date: ${note.workdate || "N/A"}`);
        document.text(`Signed: Yes`);
    
        if (note.format === "material") {
            document.text("Materials:");
            (note.materials || []).forEach((mat, i) => {
              document.text(`  ${i + 1}. ${mat}`);
            });
        }
    
        if (note.format === "hours") {
            document.text("Workers (hours)");
            (note.workers || []).forEach((w, i) => {
              document.text(`  ${i + 1}. ${w.name} → ${w.hours} hours`);
            });
        }
        document.end();
    
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error signing delivery note" });
    }
}

exports.createPDF = async (req, res) => {
    try {
        const note = await DeliveryNote.findById(req.params.id);
        if (!note || !note.pdf) return res.status(404).json({ message: "PDF not available" });
    
        //res.redirect(note.pdf);
        if (note.userId._id.toString() !== req.user.id && req.user.role !== "guest") {
            return res.status(403).json({ message: "You don't have permission to access this delivery note" });
        }
      
        const pdfStream = await axios.get(note.pdf, { responseType: 'stream' });
        res.setHeader('Content-Type', 'application/pdf');
        pdfStream.data.pipe(res);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving PDF" });
    }
}

exports.deleteDeliveryNote = async (req, res) => {
    try {
        const note = await DeliveryNote.findById(req.params.id);
        if (!note) return res.status(404).json({ message: "Delivery note not found" });

        if (!note.pending) {
            return res.status(403).json({ message: "Signed delivery note cannot be deleted" });
        }

        await DeliveryNote.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Delivery note deleted" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting delivery note" });
    }
}