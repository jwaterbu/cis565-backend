const { ShippingOption, User, sequelize } = require('../../sequelize');
const createJWT = require('../../utilities/tokenUtility');
const server = require('../../index');
const request = require('supertest')(server);

describe('/api/shipping-options', () => {
  afterEach(async () => {
    await ShippingOption.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /', () => {
    let token;

    const response = async (jwt) => {
      return await request
        .get('/api/shipping-options')
        .set('x-auth-token', jwt);
    };

    beforeEach(async () => {
      const user = User.build({ admin: false });
      token = createJWT(user);
      await ShippingOption.bulkCreate([
        { title: 'standard', description: "d1", cost: 0.00 },
        { title: 'one-day', description: "d2",  cost: 5.99 }
      ]);
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(token);

      expect(res.status).toBe(401);
    });

    it('should return all shipping-options (stat code 200)', async () => {
      const res = await response(token);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some(m => m.title === 'standard')).toBeTruthy();
      expect(res.body.some(m => m.title === 'one-day')).toBeTruthy();
      expect(res.body.some(m => m.description === 'd1')).toBeTruthy();
      expect(res.body.some(m => m.description === 'd2')).toBeTruthy();
      expect(res.body.some(m => m.cost === 0.00)).toBeTruthy();
      expect(res.body.some(m => m.cost === 5.99)).toBeTruthy();
    });
  });

  describe('GET /ID', () => {
    let user, token, shipping_option;

    const response = async (id, jwt) => {
      return await request
        .get(`/api/shipping-options/${id}`)
        .set('x-auth-token', jwt);
    };

    beforeEach(async () => {
      user = User.build({ admin: false });
      token = createJWT(user);
      shipping_option = await ShippingOption.create({
        title: 'standard', description: "d1", cost: 0.00
      });
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(shipping_option.id, token);

      expect(res.status).toBe(401);
    });

    it('should return 404 if invalid shipping_option ID', async () => {
      const shipping_option_id = 'id';
      const res = await response(shipping_option_id, token);

      expect(res.status).toBe(404);
    });

    it('should return 404 if shipping_option ID valid but shipping_option ID not in DB', async () => {
      const shipping_option_id = '10000';
      const res = await response(shipping_option_id, token);

      expect(res.status).toBe(404);
    });

    it('should return specific shipping_option if valid shipping_option ID', async () => {
      const res = await response(shipping_option.id, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', shipping_option.id);
      expect(res.body).toHaveProperty('name', shipping_option.name);
    });
  });

  describe('POST /', () => {
    let user, token, shipping_option_object;

    const response = async (object, jwt) => {
      return await request
        .post('/api/shipping-options')
        .send(object)
        .set('x-auth-token', jwt);
    };

    beforeEach(async () => {
      user = User.build({ admin: true });
      token = createJWT(user);
      shipping_option_object = {
        title: 'standard', description: "d1", cost: 0.00
      };
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(shipping_option_object, token);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not admin', async () => {
      user = User.build({ admin: false });
      token = createJWT(user);
      const res = await response(shipping_option_object, token);

      expect(res.status).toBe(403);
    });

    it('should return 400 if shipping_option is invalid', async () => {
      shipping_option_object = {};
      const res = await response(shipping_option_object, token);

      expect(res.status).toBe(400);
    });

    it('should save shipping_option if shipping_option is valid', async () => {
      const res = await response(shipping_option_object, token);
      const shipping_option = await ShippingOption.findOne({
        where: { title: 'standard' }
      });

      expect(shipping_option).toHaveProperty('id');
      expect(shipping_option).toHaveProperty('title', 'standard');
      expect(shipping_option).toHaveProperty('description', 'd1');
      expect(shipping_option).toHaveProperty('cost', 0);
    });

    it('should return shipping_option if shipping_option is valid', async () => {
      const res = await response(shipping_option_object, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('title', 'standard');
      expect(res.body).toHaveProperty('description', 'd1');
      expect(res.body).toHaveProperty('cost', 0);
    });
  });

  describe('PUT /ID', () => {
    let user, token, shipping_option, shipping_option_object;

    const response = async (object, jwt, id) => {
      return await request
        .put('/api/shipping-options/' + id)
        .set('x-auth-token', jwt)
        .send(object);
    };

    beforeEach(async () => {
      user = User.build({ admin: true });
      token = createJWT(user);
      shipping_option = await ShippingOption.create({
        title: 'standard', description: "d1", cost: 0.00
      });
      shipping_option_object = { title: 'standard', description: "d1", cost: 2.99 };
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(shipping_option_object, token, shipping_option.id);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not admin', async () => {
      user = User.build({ admin: false });
      token = createJWT(user);
      const res = await response(shipping_option_object, token, shipping_option.id);

      expect(res.status).toBe(403);
    });

    it('should return 404 if invalid shipping_option ID ', async () => {
      const shipping_option_id = 'id';
      const res = await response(shipping_option_object, token, shipping_option_id);

      expect(res.status).toBe(404);
    });

    it('should return 404 if shipping_option ID valid but not in DB', async () => {
      const shipping_option_id = '10000';
      const res = await response(shipping_option_object, token, shipping_option_id);

      expect(res.status).toBe(404);
    });

    // it('should return 400 if shipping_option is invalid', async () => {
    //   const shipping_option_object = {};
    //   const res = await response(shipping_option_object, token, shipping_option.id);
    //
    //   expect(res.status).toBe(400);
    // });

    it('should update shipping_option if input is valid', async () => {
      const res = await response(shipping_option_object, token, shipping_option.id);
      const result = await ShippingOption.findOne({ where: { id: shipping_option.id } });

      expect(result).toHaveProperty('title', 'standard');
      expect(result).toHaveProperty('description', 'd1');
      expect(result).toHaveProperty('cost', 2.99);
    });

    it('should return updated shipping_option if it is valid', async () => {
      const res = await response(shipping_option_object, token, shipping_option.id);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', shipping_option.id);
      expect(res.body).toHaveProperty('title', 'standard');
      expect(res.body).toHaveProperty('description', 'd1');
      expect(res.body).toHaveProperty('cost', 2.99);
    });
  });

  describe('DELETE /ID', () => {
    let user, token, shipping_option;

    const response = async (id, jwt) => {
      return await request
        .delete('/api/shipping-options/' + id)
        .set('x-auth-token', jwt);
    };

    beforeEach(async () => {
      user = User.build({ admin: true });
      token = createJWT(user);
      shipping_option = await ShippingOption.create({
        title: 'standard', description: "d1", cost: 0.00
      });
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(shipping_option.id, token);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not admin', async () => {
      user = User.build({ admin: false });
      token = createJWT(user);
      const res = await response(shipping_option.id, token);

      expect(res.status).toBe(403);
    });

    it('should return 404 if invalid shipping_option ID', async () => {
      const shipping_option_id = 'id';
      const res = await response(shipping_option_id, token);

      expect(res.status).toBe(404);
    });

    it('should return 404 if shipping_option ID valid but not in DB', async () => {
      const shipping_option_id = '100000';
      const res = await response(shipping_option_id, token);

      expect(res.status).toBe(404);
    });

    it('should delete shipping_option if input is valid', async () => {
      const res = await response(shipping_option.id, token);
      const result = await ShippingOption.findOne({ where: { id: shipping_option.id } });

      expect(result).toBeNull();
    });

    it('should return deleted shipping_option', async () => {
      const res = await response(shipping_option.id, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', shipping_option.id);
      expect(res.body).toHaveProperty('title', 'standard');
      expect(res.body).toHaveProperty('description', 'd1');
      expect(res.body).toHaveProperty('cost', 0);
    });
  });
});
