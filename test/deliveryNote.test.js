//detailed test suite for the delivery note
const supertest = require('supertest');
const { app, server } = require('../app.js');
const mongoose = require('mongoose');
const { hashPassword } = require('../utils/handlePassword.js');
const { generateToken } = require('../utils/handleJwt');
const usersModel = require('../models/users.js');
const clientsModel = require('../models/client.js');
const projectsModel = require('../models/project.js');
const deliveryNotesModel = require('../models/deliveryNote.js');
const api = supertest(app);
const path = require('path');

//Before testing --> register a user and create a client and a project
async function setupUserClientProjectDeliveryNote(email) {
  await api.post('/api/user/register').send({ email, password: 'Test1234' });
  const user = await usersModel.findOne({ email });
  await api
    .put('/api/user/validatemail')
    .auth(user.token, { type: 'bearer' })
    .send({ code: user.verificationCode });

  const token = user.token || require('../utils/handleJwt').generateToken(user, process.env.JWT_SECRET);

  const client = await clientsModel.create({
    name: `Client ${email}`,
    cif: 'X12345678',
    address: {
      street: 'Test Street',
      number: 1,
      postal: 28000,
      city: 'Jeréz',
      province: 'Andalucía'
    },
    userId: user._id
  });

  const project = await projectsModel.create({
    name: `Project ${email}`,
    code: '001',
    projectCode: 'PR001',
    clientId: client._id,
    userId: user._id,
    address: {
      street: 'Tervureen',
      number: 222,
      postal: 14700,
      city: 'Brussels',
      province: 'Brussels'
    }
  });

  return { token, clientId: client._id, projectId: project._id };
}

beforeAll(async () => {
  await new Promise((resolve) => mongoose.connection.once('connected', resolve));
  await usersModel.deleteMany({});
  await clientsModel.deleteMany({});
  await projectsModel.deleteMany({});
  await deliveryNotesModel.deleteMany({});
});

describe('Delivery Notes', () => {
  it('Create a delivery note (materials)', async () => {
    const { token, clientId, projectId } = await setupUserClientProjectDeliveryNote('a1@test.com');
    const res = await api.post('/api/deliverynote/create')
      .auth(token, { type: 'bearer' })
      .send({
        clientId, projectId,
        format: "material",
        material: ["paper", "receipts"],
        description: "Materials delivery note",
        workdate: "2025-04-17"
      })
      .expect(200);

    expect(res.body.material.length).toBe(2);
  });

  it('Fail to create delivery note (materials)', async () => {
    const { token, clientId, projectId } = await setupUserClientProjectDeliveryNote('error1@test.com');

    await api.post('/api/deliverynote/create')
      .auth(token, { type: 'bearer' })
      .send({
        clientId, projectId,
        format: "material",
        description: "Missing materials",
        workdate: "2025-04-10"
      })
      .expect(422);
  });

  it('Create a delivery note (workers)', async () => {
    const { token, clientId, projectId } = await setupUserClientProjectDeliveryNote('a2@test.com');
    const res = await api.post('/api/deliverynote/create')
      .auth(token, { type: 'bearer' })
      .send({
        clientId, projectId,
        format: "hours",
        workers: [{ name: "John", hours: 5 }],
        description: "Hours delivery note",
        workdate: "2025-04-16"
      })
      .expect(200);

    expect(res.body.format).toBe("hours");
  });

  it('Fail to create delivery note (workers)', async () => {
    const { token, clientId, projectId } = await setupUserClientProjectDeliveryNote('error2@test.com');

    await api.post('/api/deliverynote/create')
      .auth(token, { type: 'bearer' })
      .send({
        clientId, projectId,
        format: "hours",
        description: "Missing workers",
        workdate: "2025-04-09"
      })
      .expect(422);
  });

  it('Show all delivery notes for user', async () => {
    const { token, clientId, projectId } = await setupUserClientProjectDeliveryNote('a3@test.com');
    await api.post('/api/deliverynote/create')
      .auth(token, { type: 'bearer' })
      .send({
        clientId, projectId,
        format: "material",
        material: ["stone"],
        description: "Stone",
        workdate: "2025-04-15"
      });

    const res = await api.get('/api/deliverynote/show')
      .auth(token, { type: 'bearer' })
      .expect(200);

    expect(res.body.length).toBeGreaterThan(0);
  });

  it('Show all delivery notes for non-existent user', async () => {
    const fakeUser = { id: '999999999999999999999999', email: 'ghost@user.com' };
    const fakeToken = generateToken(fakeUser, process.env.JWT_SECRET);

    const res = await api.get('/api/deliverynote/show')
      .auth(fakeToken, { type: 'bearer' })
      .expect(200);

    expect(res.body).toEqual([]);
  });

  it('Show delivery note by ID', async () => {
    const { token, clientId, projectId } = await setupUserClientProjectDeliveryNote('a4@test.com');
    const created = await api.post('/api/deliverynote/create')
      .auth(token, { type: 'bearer' })
      .send({
        clientId, projectId,
        format: "hours",
        workers: [{ name: "Ana", hours: 4 }],
        description: "Worker",
        workdate: "2025-04-14"
      });

    const res = await api.get(`/api/deliverynote/show/${created.body._id}`)
      .auth(token, { type: 'bearer' })
      .expect(200);

    expect(res.body._id).toBe(created.body._id);
  });

  it('Show non-existent delivery note by ID', async () => {
    const { token } = await setupUserClientProjectDeliveryNote('error3@test.com');

    await api.get('/api/deliverynote/show/999999999999999999999999')
      .auth(token, { type: 'bearer' })
      .expect(404);
  });

  it('Sign delivery note and generate PDF', async () => {
    const { token, clientId, projectId } = await setupUserClientProjectDeliveryNote('a5@test.com');
    const created = await api.post('/api/deliverynote/create')
      .auth(token, { type: 'bearer' })
      .send({
        clientId, projectId,
        format: "hours",
        workers: [{ name: "Luis", hours: 2 }],
        description: "Quick work",
        workdate: "2025-04-13"
      });

    const res = await api.post(`/api/deliverynote/sign/${created.body._id}`)
      .auth(token, { type: 'bearer' })
      .attach('file', path.join(__dirname, 'firma.jpg'))
      .expect(200);

    expect(res.body.pdf).toMatch(/^https?:\/\//);
  });

  it('Sign non-existent delivery note', async () => {
    const { token } = await setupUserClientProjectDeliveryNote('error4@test.com');

    await api.post('/api/deliverynote/sign/999999999999999999999999')
      .auth(token, { type: 'bearer' })
      .attach('file', path.join(__dirname, 'firma.jpg'))
      .expect(404);
  });

  it('Download delivery note PDF', async () => {
    const { token, clientId, projectId } = await setupUserClientProjectDeliveryNote('a6@test.com');
    const created = await api.post('/api/deliverynote/create')
      .auth(token, { type: 'bearer' })
      .send({
        clientId, projectId,
        format: "hours",
        workers: [{ name: "Sara", hours: 3 }],
        description: "Test",
        workdate: "2025-04-12"
      });

    await api.post(`/api/deliverynote/sign/${created.body._id}`)
      .auth(token, { type: 'bearer' })
      .attach('file', path.join(__dirname, 'firma.jpg'));

    const res = await api.get(`/api/deliverynote/pdf/${created.body._id}`)
      .auth(token, { type: 'bearer' })
      .expect(200);

    expect(res.headers['content-type']).toBe('application/pdf');
  }, 10000);

  it('Download PDF of non-existent delivery note', async () => {
    const { token } = await setupUserClientProjectDeliveryNote('error5@test.com');

    await api.get('/api/deliverynote/pdf/999999999999999999999999')
      .auth(token, { type: 'bearer' })
      .expect(404);
  });

  it('Delete signed delivery note (should fail)', async () => {
    const { token, clientId, projectId } = await setupUserClientProjectDeliveryNote('a7@test.com');
    const created = await api.post('/api/deliverynote/create')
      .auth(token, { type: 'bearer' })
      .send({
        clientId, projectId,
        format: "material",
        material: ["cement"],
        description: "To delete",
        workdate: "2025-04-11"
      });

    await api.post(`/api/deliverynote/sign/${created.body._id}`)
      .auth(token, { type: 'bearer' })
      .attach('file', path.join(__dirname, 'firma.jpg'));

    const res = await api.delete(`/api/deliverynote/delete/${created.body._id}`)
      .auth(token, { type: 'bearer' })
      .expect(403);

    expect(res.body.message).toMatch(/signed/i);
  }, 10000);

  it('Delete non-existent delivery note', async () => {
    const { token } = await setupUserClientProjectDeliveryNote('error6@test.com');

    await api.delete('/api/deliverynote/delete/999999999999999999999999')
      .auth(token, { type: 'bearer' })
      .expect(404);
  });
});

afterAll(async () => {
  await Promise.all([
    deliveryNotesModel.deleteMany({}),
    projectsModel.deleteMany({}),
    clientsModel.deleteMany({}),
    usersModel.deleteMany({})
  ]);
  
  setTimeout(async () => {
    await mongoose.connection.close();
    server.close();
  }, 1000);
});