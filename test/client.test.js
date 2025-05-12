//contains extensive test cases for the client management functionality.
const supertest = require('supertest');
const { app, server } = require('../app.js');
const mongoose = require('mongoose');
const { hashPassword } = require('../utils/handlePassword.js');
const { generateToken } = require('../utils/handleJwt');
const usersModel = require('../models/users.js');
const clientsModel = require('../models/client.js');
const api = supertest(app);

// Register and validate user
async function registerAndVerifyUser(email) {
  const reg = await api.post('/api/user/register').send({ email, password: 'Test1234' });
  const token = reg.body.token;
  const user = await usersModel.findById(reg.body.user._id);
  await api

    .put('/api/user/validatemail')
    .auth(token, { type: 'bearer' })
    .send({ code: user.verificationCode })
    .expect(200);
  return token;
}


beforeAll(async () => {
  await new Promise((resolve) => mongoose.connection.once('connected', resolve));
  await usersModel.deleteMany({});
  await clientsModel.deleteMany({});
});


describe('Client', () => {
  it('client has been created succesfully', async () => {
    const token = await registerAndVerifyUser('client1@test.com');

    const res = await api
      .post('/api/client/create')
      .auth(token, { type: 'bearer' })
      .send({
        name: '1st Client',
        cif: 'A12345678',
        address: {
          street: '1st street',
          number: 1,
          postal: 1000,
          city: '1st city',
          province: '1st province',
        },
      })
      .expect(200);

    expect(res.body.name).toBe('1st Client');
  });

  it('create a client with valid data ( cif missing)', async () => {
    const token = await registerAndVerifyUser('client2@test.com');

    await api
      .post('/api/client/create')
      .auth(token, { type: 'bearer' })
      .send({
        name: 'Error Cliente ',
        address: {
          street: 'Error street',
          number: 1,
          postal: 1000,
          city: 'city',
          province: 'Province',
        },
      })
      .expect(422);
  });

  it('show users client', async () => {
    const token = await registerAndVerifyUser('client3@test.com');

    await api.post('/api/client/create')
      .auth(token, { type: 'bearer' })
      .send({
        name: 'Show client',
        cif: 'B12345678',
        address: {
          street: 'client street',
          number: 5,
          postal: 2000,
          city: 'Client city',
          province: 'Province',
        },
      });

    const res = await api
      .get('/api/client/show')
      .auth(token, { type: 'bearer' })
      .expect(200);

    expect(res.body.length).toBeGreaterThan(0);
  });

  
  it('client by Id', async () => {
    const token = await registerAndVerifyUser('client4@test.com');

    const create = await api.post('/api/client/create')
      .auth(token, { type: 'bearer' })
      .send({
        name: 'Cliente ID',
        cif: 'C12345678',
        address: {
          street: ' ID street',
          number: 10,
          postal: 3000,
          city: 'City',
          province: 'Province',
        },
      });

    const id = create.body._id;

    const res = await api
      .get(`/api/client/${id}`)
      .auth(token, { type: 'bearer' })
      .expect(200);

    expect(res.body._id).toBe(id);
  });

  it('client by  Id (dosnt exist)', async () => {
    const token = await registerAndVerifyUser('client404@test.com');

    await api
      .get(`/api/client/999999999999999999999999`)
      .auth(token, { type: 'bearer' })
      .expect(404);
  });

  it('Refresh client appropiately', async () => {
    const token = await registerAndVerifyUser('client5@test.com');

    const create = await api.post('/api/client/create')
      .auth(token, { type: 'bearer' })
      .send({
        name: 'R fresh client',
        cif: 'D12345678',
        address: {
          street: 'r street',
          number: 8,
          postal: 8000,
          city: 'City',
          province: 'Province',
        },
      });

    const id = create.body._id;

    const res = await api
      .put(`/api/client/${id}`)
      .auth(token, { type: 'bearer' })
      .send({
        name: 'Refresh client',
        cif: 'D87654321',
        address: {
          street: 'ne street2',
          number: 9,
          postal: 9000,
          city: 'Niw citi',
          province: 'New provence',
        },
      })
      .expect(200);

    expect(res.body.name).toBe('updated client');
  });


  it('update unexistent client', async () => {
    const token = await registerAndVerifyUser('update404@test.com');


    await api
      .put(`/api/client/999999999999999999999999`)
      .auth(token, { type: 'bearer' })
      .send({
        name: 'Update  one',
        cif: 'U404404',
        address: {
          street: 'dosntexist',
          number: 1,
          postal: 4040,
          city: 'City',
          province: 'Province',
        },
      })
      .expect(404);
  });


  it('Update client with invalid data (missing address)', async () => {

    const token = await registerAndVerifyUser('client6@test.com');

    const create = await api.post('/api/client/create')
      .auth(token, { type: 'bearer' })
      .send({
        name: 'Incomplete Client',
        cif: 'Z12345678',
        address: {
          street: 'Incomplete Street',
          number: 7,
          postal: 7000,
          city: 'City',
          province: 'Province',
        },
      });

    const id = create.body._id;

    await api
      .put(`/api/client/${id}`)
      .auth(token, { type: 'bearer' })
      .send({ name: 'Name without address' })
      .expect(422);
  });


  it('Archive client (soft delete)', async () => {

    const token = await registerAndVerifyUser('client7@test.com');
    const create = await api.post('/api/client/create')


      .auth(token, { type: 'bearer' })
      .send({
        name: 'Archivable Client',
        cif: 'E12345678',
        address: {
          street: 'Archive Street',
          number: 11,
          postal: 11000,
          city: 'City',
          province: 'Province',
        },
      });

    const id = create.body._id;

    const res = await api
      .delete(`/api/client/archive/${id}`)
      .auth(token, { type: 'bearer' })
      .expect(200);

    expect(res.body.archived).toBe(true);
  });

  it('Archive non-existent client (soft delete)', async () => {
    const token = await registerAndVerifyUser('archive404@test.com');

    await api
      .delete(`/api/client/archive/999999999999999999999999`)
      .auth(token, { type: 'bearer' })
      .expect(404);
  });

  it('Get archived clients', async () => {
    const token = await registerAndVerifyUser('client8@test.com');
    await api.post('/api/client/create')


      .auth(token, { type: 'bearer' })
      .send({
        name: 'Archived Client',
        cif: 'F12345678',
        address: {
          street: 'Archived Street',
          number: 12,
          postal: 12000,
          city: 'City',
          province: 'Province',
        },
      });

    const client = await clientsModel.findOne({ name: 'Archived Client' });
    client.archived = true;
    await client.save();

    const res = await api
      .get('/api/client/archived')
      .auth(token, { type: 'bearer' })
      .expect(200);

    expect(res.body.length).toBeGreaterThan(0);
  });

  it('Restore archived client', async () => {
    const token = await registerAndVerifyUser('client9@test.com');
    const create = await api.post('/api/client/create')

    
      .auth(token, { type: 'bearer' })
      .send({
        name: 'Restore Client',
        cif: 'G12345678',
        address: {
          street: 'Restore Street',
          number: 13,
          postal: 13000,
          city: 'City',
          province: 'Province',
        },
      });

    const id = create.body._id;
    await api.delete(`/api/client/archive/${id}`).auth(token, { type: 'bearer' });

    const res = await api
      .patch(`/api/client/restore/${id}`)
      .auth(token, { type: 'bearer' })
      .expect(200);

    expect(res.body.archived).toBe(false);
  });

  it('Restore non-existent client', async () => {
    const token = await registerAndVerifyUser('restore404@test.com');

    await api
      .patch(`/api/client/restore/999999999999999999999999`)
      .auth(token, { type: 'bearer' })
      .expect(404);
  });

  it('Delete client (hard delete)', async () => {
    const token = await registerAndVerifyUser('client10@test.com');

    const create = await api.post('/api/client/create')
      .auth(token, { type: 'bearer' })
      .send({
        name: 'Deleted Client',
        cif: 'H12345678',
        address: {
          street: 'Delete Street',
          number: 14,
          postal: 14000,
          city: 'City',
          province: 'Province',
        },
      });

    const id = create.body._id;

    const res = await api
      .delete(`/api/client/${id}`)
      .auth(token, { type: 'bearer' })
      .expect(200);

    expect(res.body.message).toBe('Client deleted');
  });

  it('Delete non-existent client (hard delete)', async () => {
    const token = await registerAndVerifyUser('delete404@test.com');

    await api
      .delete(`/api/client/999999999999999999999999`)
      .auth(token, { type: 'bearer' })
      .expect(404);
  });
});

afterAll(async () => {
  await usersModel.deleteMany({});
  await clientsModel.deleteMany({});
  await mongoose.connection.close();
  server.close();
});