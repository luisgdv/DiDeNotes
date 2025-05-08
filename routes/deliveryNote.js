const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verificationToken");
const { createDeliveryNote, getDeliveryNotes, getDeliveryNoteById, deleteDeliveryNote, createPDF, signDeliveryNote} = require("../controllers/DeliveryNote");
const { uploadMiddleware, uploadMiddlewareMemory } = require('../utils/handleStorage');
const { albaranValidator } = require("../validators/DeliveryNote");
const { validateSignatureUpload } = require("../validators/file");

/**
 * @swagger
 * /api/deliverynote/create:
 *   post:
 *     summary: Create a delivery note
 *     tags: [DeliveryNote]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [clientId, projectId, format]
 *             properties:
 *               clientId:
 *                 type: string
 *               projectId:
 *                 type: string
 *               format:
 *                 type: string
 *                 enum: [material, hours]
 *               material:
 *                 type: array
 *                 items:
 *                   type: string
 *               workers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     hours:
 *                       type: number
 *               description:
 *                 type: string
 *               workdate:
 *                 type: string
 *     responses:
 *       200:
 *         description: Delivery note created
 *       401:
 *         description: Invalid token
 *       422:
 *         description: Validation failed
 */
router.post("/create", verifyToken, deliveryNoteValidator, createDeliveryNote);

/**
 * @swagger
 * /api/deliverynote/show:
 *   get:
 *     summary: List user's delivery notes
 *     tags: [DeliveryNote]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of delivery notes
 *       401:
 *         description: Unauthorized
 */
router.get("/show", verifyToken, getDeliveryNotes);

/**
 * @swagger
 * /api/deliverynote/show/{id}:
 *   get:
 *     summary: Get a delivery note by ID
 *     tags: [DeliveryNote]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Delivery note found
 *       401:
 *         description: Invalid token
 *       404:
 *         description: Delivery note not found
 */
router.get("/show/:id", verifyToken, getDeliveryNoteById);

/**
 * @swagger
 * /api/deliverynote/pdf/{id}:
 *   get:
 *     summary: Download PDF of signed delivery note
 *     tags: [DeliveryNote]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Delivery note ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: PDF returned
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Invalid token
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: PDF not available
 */
router.get("/pdf/:id", verifyToken, createPDF);

/**
 * @swagger
 * /api/deliverynote/delete/{id}:
 *   delete:
 *     summary: Delete a delivery note (only if not signed)
 *     tags: [DeliveryNote]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Delivery note deleted
 *       401:
 *         description: Invalid token
 *       403:
 *         description: Signed delivery note cannot be deleted
 *       404:
 *         description: Delivery note not found
 */
router.delete("/delete/:id", verifyToken, deleteDeliveryNote);

/**
 * @swagger
 * /api/deliverynote/sign/{id}:
 *   post:
 *     summary: Sign delivery note and generate PDF
 *     tags: [DeliveryNote]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of delivery note to sign
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Delivery note signed successfully
 *       400:
 *         description: Already signed
 *       401:
 *         description: Invalid token
 *       404:
 *         description: Delivery note not found
 *       422:
 *         description: Invalid file
 */
router.post("/sign/:id", verifyToken, uploadMiddlewareMemory.single("file"), validateSignatureUpload, signDeliveryNote);

module.exports = router;
