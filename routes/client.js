// defines a comprehensive set of routes for client management  
const express = require("express");
const router = express.Router();
const {createClient, getClients, getArchivedClients, getClientById, updateClient, deleteClient, archiveClient, restoreClient} = require("../controllers/client");
const verifyToken = require("../middleware/verificationToken");
const { clientValidator } = require("../validators/client");

/**
 * @swagger
 * /api/client/create:
 *   post:
 *     summary: Create a new client
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, cif, address]
 *             properties:
 *               name:
 *                 type: string
 *               cif:
 *                 type: string
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   number:
 *                     type: number
 *                   postal:
 *                     type: number
 *                   city:
 *                     type: string
 *                   province:
 *                     type: string
 *     responses:
 *       200:
 *         description: Client created successfully
 *       400:
 *         description: A client with this name already exists
 *       401:
 *         description: Token not provided or invalid
 *       422:
 *         description: Field validation error
 */
router.post("/create", verifyToken, clientValidator, createClient);

/**
 * @swagger
 * /api/client/show:
 *   get:
 *     summary: Get all clients for the user or their company
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of clients
 *       401:
 *         description: Token not provided or invalid
 */
router.get("/show", verifyToken, getClients);

/**
 * @swagger
 * /api/client/archived:
 *   get:
 *     summary: Get archived clients for the user
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of archived clients
 *       401:
 *         description: Token not provided or invalid
 */
router.get("/archived", verifyToken, getArchivedClients);

/**
 * @swagger
 * /api/client/{id}:
 *   get:
 *     summary: Get a client by ID
 *     tags: [Clients]
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
 *         description: Client found
 *       401:
 *         description: Token not provided or invalid
 *       403:
 *         description: You don't have permission for this client
 *       404:
 *         description: Client not found
 */
router.get("/:id", verifyToken, getClientById);

/**
 * @swagger
 * /api/client/{id}:
 *   put:
 *     summary: Update client
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               cif:
 *                 type: string
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   number:
 *                     type: number
 *                   postal:
 *                     type: number
 *                   city:
 *                     type: string
 *                   province:
 *                     type: string
 *     responses:
 *       200:
 *         description: Client updated
 *       401:
 *         description: Token not provided or invalid
 *       403:
 *         description: You don't have permission to update this client
 *       404:
 *         description: Client not found
 *       422:
 *         description: Field validation error
 */
router.put("/:id", verifyToken, clientValidator, updateClient);

/**
 * @swagger
 * /api/client/{id}:
 *   delete:
 *     summary: Permanently delete client
 *     tags: [Clients]
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
 *         description: Client deleted
 *       401:
 *         description: Token not provided or invalid
 *       403:
 *         description: You don't have permission to delete this client
 *       404:
 *         description: Client not found
 */
router.delete("/:id", verifyToken, deleteClient);

/**
 * @swagger
 * /api/client/archive/{id}:
 *   delete:
 *     summary: Archive client (soft delete)
 *     tags: [Clients]
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
 *         description: Client archived
 *       401:
 *         description: Token not provided or invalid
 *       403:
 *         description: You don't have permission to archive this client
 *       404:
 *         description: Client not found
 */
router.delete("/archive/:id", verifyToken, archiveClient);
/**
 * @swagger
 * /api/client/restore/{id}:
 *   patch:
 *     summary: Restore archived client
 *     tags: [Clients]
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
 *         description: Client restored
 *       401:
 *         description: Token not provided or invalid
 *       403:
 *         description: You don't have permission to restore this client
 *       404:
 *         description: Client not found
 */
router.patch("/restore/:id", verifyToken, restoreClient);
//Slack tests
router.get('/test-error', (req, res) => {
    throw new Error('forced error to test Slack notification');
});
module.exports = router;