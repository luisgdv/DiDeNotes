//comprehensive test suite for user onboarding functionality
const supertest = require('supertest');
const mongoose = require('mongoose');
const { app, server } = require('../app');
const usersModel = require('../models/users');
const path = require('path');
const api = supertest(app);

// Register and verify user
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
});



describe('Onboarding', () => {
  it('User registration', async () => {
    const res = await api
      .post('/api/user/register')
      .send({ email: 'user1@test.com', password: 'Test1234' })
      .expect(201);
    
    expect(res.body.user.email).toBe('user1@test.com');
  });

  it('Failed registration (invalid email)', async () => {
    await api
      .post('/api/user/register')
      .send({ email: 'invalidemail', password: '12345678' })
      .expect(422);
  });

  it('Failed registration (no password)', async () => {
    await api
      .post('/api/user/register')
      .send({ email: 'user2@test.com' })
      .expect(422);
  });

  it('Failed registration (user already exists)', async () => {
    await api.post('/api/user/register').send({ email: 'user3@test.com', password: 'Test1234' });
    await api
      .post('/api/user/register')
      .send({ email: 'user3@test.com', password: 'Test1234' })
      .expect(409);
  });

  it('Validate email correctly', async () => {
    await registerAndVerifyUser('user4@test.com');
  });
  it('Failed email validation (no code)', async () => {
    const reg = await api.post('/api/user/register').send({ email: 'user5@test.com', password: 'Test1234' });
    const token = reg.body.token;

    await api
      .put('/api/user/validatemail')
      .auth(token, { type: 'bearer' })
      .send({})
      .expect(422);
  });

  it('Failed email validation (incorrect code)', async () => {
    const reg = await api.post('/api/user/register').send({ email: 'user6@test.com', password: 'Test1234' });
    const token = reg.body.token;

    await api
      .put('/api/user/validatemail')
      .auth(token, { type: 'bearer' })
      .send({ code: '000000' })
      .expect(400);
  });

  it('Successful login', async () => {
    await api.post('/api/user/register').send({ email: 'user7@test.com', password: 'Test1234' });
    const res = await api

      .post('/api/user/login')
      .send({ email: 'user7@test.com', password: 'Test1234' })
      .expect(200);
    
    expect(res.body.user.email).toBe('user7@test.com');
  });

  it('Failed login (malformed email)', async () => {
    await api
      .post('/api/user/login')
      .send({ email: 'pepito', password: 'password' })
      .expect(422);
  });

  it('Failed login (incorrect credentials)', async () => {
    await api.post('/api/user/register').send({ email: 'user8@test.com', password: 'Test1234' });
    await api
      .post('/api/user/login')
      .send({ email: 'user8@test.com', password: 'wrongpass' })
      .expect(400);
  });

  it('Password recovery with valid email', async () => {
    await api.post('/api/user/register').send({ email: 'user9@test.com', password: 'Test1234' });
    await api
      .post('/api/user/forgotpassword')
      .send({ email: 'user9@test.com' })
      .expect(200);
  });

  it('Password recovery without email', async () => {
    await api
      .post('/api/user/forgotpassword')
      .send({})
      .expect(404);
  });

  it('Password recovery with non-existent email', async () => {
    await api
      .post('/api/user/forgotpassword')
      .send({ email: 'inexistente@test.com' })
      .expect(404);
  });

  it('Add personal data', async () => {
    const token = await registerAndVerifyUser('user10@test.com');

    await api
      .put('/api/user/personadata')
      .auth(token, { type: 'bearer' })
      .send({ name: 'Name', surname: 'Surname', nif: '12345678A' })
      .expect(200);
  });

  it('Add personal data (without name)', async () => {
    const token = await registerAndVerifyUser('user11@test.com');

    await api
      .put('/api/user/personadata')
      .auth(token, { type: 'bearer' })
      .send({ surname: 'Failure', nif: '12345678A' })
      .expect(422);
  });

  it('Update company data correctly', async () => {
    const token = await registerAndVerifyUser('user12@test.com');


    await api
      .patch('/api/user/companydata')
      .auth(token, { type: 'bearer' })
      .send({
        companyName: "Company Inc.",
        cif: "Z12345678",
        address: "Fake Street",
        number: 123,
        postal: 28000,
        city: "Madrid",
        province: "Madrid"
      })
      .expect(200);
  });

  
  it('Update company data (without cif)', async () => {
    const token = await registerAndVerifyUser('user13@test.com');

    await api
      .patch('/api/user/companydata')
      .auth(token, { type: 'bearer' })
      .send({
        companyName: "Fake Company",
        address: "Fake Street",
        number: 321,
        postal: 28001,
        city: "Madrid",
        province: "Madrid"
      })
      .expect(422);
  });

  it('Get current user', async () => {
    const token = await registerAndVerifyUser('user14@test.com');

    await api
      .get('/api/user/getuser')
      .auth(token, { type: 'bearer' })
      .expect(200);
  });

  it('Invite guest user correctly', async () => {
    const token = await registerAndVerifyUser('user15@test.com');

    await api
      .post('/api/user/invite')
      .auth(token, { type: 'bearer' })
      .send({ email: 'guest@correo.com' })
      .expect(201);
  });

  it('Invite guest user (without email)', async () => {
    const token = await registerAndVerifyUser('user16@test.com');

    await api
      .post('/api/user/invite')
      .auth(token, { type: 'bearer' })
      .send({})
      .expect(400);
  });

  it('Delete user (soft delete)', async () => {
    const token = await registerAndVerifyUser('user17@test.com');

    await api
      .delete('/api/user/deleteuser?soft=true')
      .auth(token, { type: 'bearer' })
      .expect(200);
  });

  it('Upload logo correctly', async () => {
    const token = await registerAndVerifyUser('user18@test.com');

    await api
      .patch('/api/user/logo')
      .auth(token, { type: 'bearer' })
      .attach('logo', path.join(__dirname, 'firma.jpg'))
      .expect(200);
  });

  it('Upload logo (without file)', async () => {
    const token = await registerAndVerifyUser('user19@test.com');

    await api
      .patch('/api/user/logo')
      .auth(token, { type: 'bearer' })
      .expect(400);
  });
});

afterAll(async () => {
  await usersModel.deleteMany({});
  await mongoose.connection.close();
  server.close();
});