//controller that manages project-related operations
//organizes client work, maintaining relationships between users, companies, and clients.
const Project = require("../models/project");
const Client = require("../models/client");


exports.createProject = async (req, res) => {
  try {
    const { name, projectCode, email, address, code, clientId } = req.body;
    const userId = req.user.id;
    const companyId = req.user.companyId || null;

    const existing = await Project.findOne({ name, userId, clientId, archived: false });
    if (existing) return res.status(400).json({ message: "Project name already exists for this user." });

    const newProject = new Project({
      name, projectCode, email, address, code, clientId,
      userId, companyId
    });

    await newProject.save();
    res.status(200).json(newProject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const updated = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Project not found" });

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ userId: req.user.id }, { companyId: req.user.companyId }],
      archived: false
    });
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProjectsByClient = async (req, res) => {
  try {
    const client = req.params.client;
    const projects = await Project.find({ clientId: client, archived: false });
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProjectByClientAndId = async (req, res) => {
  try {
    const { client, id } = req.params;
    const project = await Project.findOne({ _id: id, clientId: client });
    if (!project) return res.status(404).json({ message: "Proyect not found" });

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getArchivedProjects = async (req, res) => {
  try {
    const archived = await Project.find({ userId: req.user.id, archived: true });
    res.status(200).json(archived);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getArchivedByClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.client);
    if (!client) return res.status(404).json({ message: "Client missing" });

    const archived = await Project.find({ clientId: req.params.client, archived: true });
    res.status(200).json(archived);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.archiveProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: "Proyect not found" });
    }

    const archived = await Project.findByIdAndUpdate(req.params.id, { archived: true }, { new: true });
    res.status(200).json(archived);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.restoreProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Proyect not found' });
    }

    const restored = await Project.findByIdAndUpdate(req.params.id, { archived: false }, { new: true });
    res.status(200).json(restored);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Proyect was succesfully deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
