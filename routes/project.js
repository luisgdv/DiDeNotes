//defines a comprehensive set of RESTful routes
const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verificationToken");
const { createProject, updateProject, getAllProjects, getProjectsByClient, getProjectByClientAndId, getArchivedProjects, getArchivedByClient, archiveProject, restoreProject, deleteProject } = require("../controllers/project");
const { projectValidator } = require("../validators/projects");

/**
 * @swagger
 * /api/project/create:
 *   post:
 *     summary: Create a project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, projectCode, code, clientId, address]
 *             properties:
 *               name:
 *                 type: string
 *               projectCode:
 *                 type: string
 *               code:
 *                 type: string
 *               clientId:
 *                 type: string
 *               email:
 *                 type: string
 *               notes:
 *                 type: string
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   number:
 *                     type: integer
 *                   postal:
 *                     type: integer
 *                   city:
 *                     type: string
 *                   province:
 *                     type: string
 *     responses:
 *       200:
 *         description: Project created successfully
 *       400:
 *         description: A project with this name already exists
 *       401:
 *         description: Token not provided or invalid
 *       422:
 *         description: Field validation error
 */
router.post("/create", verifyToken, projectValidator,createProject);

/**
 * @swagger
 * /api/project/modify/{id}:
 *   put:
 *     summary: Modify a project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               code:
 *                 type: string
 *               projectCode:
 *                 type: string
 *               email:
 *                 type: string
 *               notes:
 *                 type: string
 *               clientId:
 *                 type: string
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   number:
 *                     type: integer
 *                   postal:
 *                     type: integer
 *                   city:
 *                     type: string
 *                   province:
 *                     type: string
 *     responses:
 *       200:
 *         description: Project updated
 *       400:
 *         description: Project not found
 *       401:
 *         description: Token not provided or invalid
 *       403:
 *         description: You don't have permission to modify this project
 *       422:
 *         description: Field validation error
 */
router.put("/modify/:id", verifyToken, projectValidator,updateProject);

/**
 * @swagger
 * /api/project/show:
 *   get:
 *     summary: Get all projects
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
 *       401:
 *         description: Token not provided or invalid
 */
router.get("/show", verifyToken, getAllProjects);

/**
 * @swagger
 * /api/project/show/{client}:
 *   get:
 *     summary: Get projects by client
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: client
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
 *       401:
 *         description: Token not provided or invalid
 */
router.get("/show/:client", verifyToken, getProjectsByClient);

/**
 * @swagger
 * /api/project/show/{client}/{id}:
 *   get:
 *     summary: Get a project by client and ID
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: client
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project retrieved successfully
 *       401:
 *         description: Token not provided or invalid
 */
router.get("/show/:client/:id", verifyToken, getProjectByClientAndId);

/**
 * @swagger
 * /api/project/archived:
 *   get:
 *     summary: Get archived projects
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Archived projects retrieved successfully
 *       401:
 *         description: Token not provided or invalid
 */
router.get("/archived", verifyToken, getArchivedProjects);

/**
 * @swagger
 * /api/project/archived/{client}:
 *   get:
 *     summary: Get archived projects by client
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: client
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Archived projects retrieved successfully
 *       401:
 *         description: Token not provided or invalid
 */
router.get("/archived/:client", verifyToken, getArchivedByClient);

/**
 * @swagger
 * /api/project/delete/{id}:
 *   delete:
 *     summary: Delete a project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *       401:
 *         description: Token not provided or invalid
 */
router.delete("/delete/:id", verifyToken, deleteProject);

/**
 * @swagger
 * /api/project/archive/{id}:
 *   delete:
 *     summary: Archive a project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project archived successfully
 *       401:
 *         description: Token not provided or invalid
 */
router.delete("/archive/:id", verifyToken, archiveProject);

/**
 * @swagger
 * /api/project/restore/{id}:
 *   patch:
 *     summary: Restore an archived project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project restored successfully
 *       401:
 *         description: Token not provided or invalid
 */
router.patch("/restore/:id", verifyToken, restoreProject);

module.exports = router;
