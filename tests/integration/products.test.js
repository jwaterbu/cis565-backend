const { Product, Review, Category, User, sequelize } = require('../../sequelize');
const createJWT = require('../../utilities/tokenUtility');
const server = require('../../index');
const request = require('supertest')(server);

describe('/api/products', () => {
  afterEach(async () => {
    await Product.destroy({ where: {} });
    await Category.destroy({ where: {} });
    await Review.destroy({ where: {} });
    await User.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /', () => {
    let category, product1, product2, token, user;

    const response = async (jwt) => {
      return await request
        .get('/api/products')
        .set('x-auth-token', jwt);
    };

    beforeEach(async () => {
      user = await User.create({
        username: 'bob',
        email: 'bob@example.com',
        password_digest: '123456',
        admin: false
      });
      token = createJWT(user);
      category = await Category.create({ name: 'Soda' });
      product1 = await Product.create({
        title: 'Pepsi',
        description: 'Pepsi Soda',
        price: 2.99,
        small_image_path: "/",
        large_image_path: "/",
        categoryId: category.id,
      });
      product2 = await Product.create({
        title: 'Sprite',
        description: 'Sprite Soda',
        price: 2.49,
        small_image_path: "/",
        large_image_path: "/",
        categoryId: category.id,
      });
      await Review.bulkCreate([
        { productId: product1.id, userId: user.id, title: 'Great', body: "b1", rating: 5 },
        { productId: product1.id, userId: user.id, title: 'Bad', body: "b2", rating: 1 }
      ]);
    });

    // it('should return 401 if client not logged in', async () => {
    //   token = '';
    //   const res = await response(token);
    //
    //   expect(res.status).toBe(401);
    // });

    it('should return all products and associated reviews (stat code 200)', async () => {
      const res = await response(token);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some(e => e.id === product1.id)).toBeTruthy();
      expect(res.body.some(e => e.id === product2.id)).toBeTruthy();
      expect(res.body.some(e => e.title === 'Sprite')).toBeTruthy();
      expect(res.body.some(e => e.title === 'Pepsi')).toBeTruthy();
      expect(res.body.some(e => e.description === 'Sprite Soda')).toBeTruthy();
      expect(res.body.some(e => e.description === 'Pepsi Soda')).toBeTruthy();
      expect(res.body.some(e => e.price === 2.99)).toBeTruthy();
      expect(res.body.some(e => e.price === 2.49)).toBeTruthy();
      expect(res.body.some(e => e.small_image_path === "/")).toBeTruthy();
      expect(res.body.some(e => e.large_image_path === "/")).toBeTruthy()
      expect(res.body.some(e => e.categoryId === category.id)).toBeTruthy()
      expect(res.body.some(e => e.reviews.length === 2)).toBeTruthy()
    });
  });

  describe('POST /', () => {
    let token, category, product_object, user;

    const response = async (object, jwt) => {
      return await request
        .post('/api/products')
        .send(object)
        .set('x-auth-token', jwt);
    };

    beforeEach(async () => {
      user = await User.create({
        username: 'bob',
        email: 'bob@example.com',
        password_digest: '123456',
        admin: true
      });
      token = createJWT(user);
      category = await Category.create({ name: 'Soda' });
      product_object = {
        title: 'Pepsi',
        description: 'Pepsi Soda',
        price: 2.99,
        small_image_path: "/",
        large_image_path: "/",
        categoryId: category.id,
      };
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(product_object, token);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not admin', async () => {
      user = User.build({ admin: false });
      token = createJWT(user);
      const res = await response(product_object, token);

      expect(res.status).toBe(403);
    });

    it('should return 400 if product is invalid', async () => {
      product_object = { categoryId: category.id };
      const res = await response(product_object, token);

      expect(res.status).toBe(400);
    });

    it('should return 400 if invalid category ID', async () => {
      product_object.categoryId = 'id';
      const res = await response(product_object, token);

      expect(res.status).toBe(400);
    });

    it('should return 400 if category ID valid but category ID not in DB', async () => {
      product_object.categoryId = '10000';
      const res = await response(product_object, token);

      expect(res.status).toBe(400);
    });

    it('should save product if product is valid', async () => {
      const res = await response(product_object, token);
      const product = await Product.findOne({ where: { title: 'Pepsi' }});

      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('title', 'Pepsi');
      expect(product).toHaveProperty('description', 'Pepsi Soda');
      expect(product).toHaveProperty('price', 2.99);
      expect(product).toHaveProperty('small_image_path', "/");
      expect(product).toHaveProperty('large_image_path', "/");
      expect(product).toHaveProperty('categoryId', category.id);
    });

    it('should return product if product is valid', async () => {
      const res = await response(product_object, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('title', 'Pepsi');
      expect(res.body).toHaveProperty('description', 'Pepsi Soda');
      expect(res.body).toHaveProperty('price', 2.99);
      expect(res.body).toHaveProperty('small_image_path', "/");
      expect(res.body).toHaveProperty('large_image_path', "/");
      expect(res.body).toHaveProperty('categoryId', category.id);
    });
  });

  describe('GET /ID', () => {
    let token, category, product1, product2, user;
    const response = async (id, jwt) => {
      return await request
        .get('/api/products/' + id)
        .set('x-auth-token', jwt);
    };

    beforeEach(async () => {
      user = await User.create({
        username: 'bob',
        email: 'bob@example.com',
        password_digest: '123456',
        admin: true
      });
      token = createJWT(user);
      category = await Category.create({ name: 'Soda' });
      product1 = await Product.create({
        title: 'Pepsi',
        description: 'Pepsi Soda',
        price: 2.99,
        small_image_path: "/",
        large_image_path: "/",
        categoryId: category.id,
      });
      product2 = await Product.create({
        title: 'Sprite',
        description: 'Sprite Soda',
        price: 2.49,
        small_image_path: "/",
        large_image_path: "/",
        categoryId: category.id,
      });
      await Review.bulkCreate([
        { productId: product1.id, userId: user.id, title: 'Great', body: "b1", rating: 5 },
        { productId: product1.id, userId: user.id, title: 'Bad', body: "b2", rating: 1 },
        { productId: product2.id, userId: user.id, title: 'Meh', body: "b3", rating: 3 }
      ]);
    });

    // it('should return 401 if client not logged in', async () => {
    //   token = '';
    //   const res = await response(product1.id, token);
    //
    //   expect(res.status).toBe(401);
    // });

    it('should return 404 if invalid product ID', async () => {
      product_id = 'id';
      const res = await response(product_id, token);

      expect(res.status).toBe(404);
    });

    it('should return 404 if product ID valid but product ID not in DB', async () => {
      product_id = '10000';
      const res = await response(product_id, token);

      expect(res.status).toBe(404);
    });

    it('should return specific product and reviews if valid product ID', async () => {
      const res = await response(product1.id, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', product1.id);
      expect(res.body).toHaveProperty('title', 'Pepsi');
      expect(res.body).toHaveProperty('description', 'Pepsi Soda');
      expect(res.body).toHaveProperty('price', 2.99);
      expect(res.body).toHaveProperty('small_image_path', "/");
      expect(res.body).toHaveProperty('large_image_path', "/");
      expect(res.body).toHaveProperty('categoryId', category.id);

      expect(res.body.reviews.length).toBe(2);
      expect(res.body.reviews.some(q => q.productId === product1.id)).toBeTruthy();
      expect(res.body.reviews.some(q => q.title === 'Great')).toBeTruthy();
      expect(res.body.reviews.some(q => q.title === 'Bad')).toBeTruthy();
      expect(res.body.reviews.some(q => q.title === 'Meh')).toBeFalsy();

      expect(res.body.reviews.some(q => q.rating === 5)).toBeTruthy();
      expect(res.body.reviews.some(q => q.rating === 1)).toBeTruthy();
      expect(res.body.reviews.some(q => q.rating === 3)).toBeFalsy();
    });
  });

  describe('PUT /ID', () => {
    let token, category, new_category, product, updated_product, user;

    const response = async (object, jwt, id) => {
      return await request
        .put('/api/products/' + id)
        .set('x-auth-token', jwt)
        .send(object);
    };

    beforeEach(async () => {
      user = await User.create({
        username: 'bob',
        email: 'bob@example.com',
        password_digest: '123456',
        admin: true
      });
      token = createJWT(user);
      category = await Category.create({ name: 'Soda' });
      new_category = await Category.create({ name: 'Drink' });
      product = await Product.create({
        title: 'Pepsi',
        description: 'Pepsi Soda',
        price: 2.99,
        small_image_path: "/",
        large_image_path: "/",
        categoryId: category.id,
      });

      updated_product = {
        title: 'Water',
        description: 'Pure Water',
        price: 4.99,
        small_image_path: "/",
        large_image_path: "/",
        categoryId: new_category.id,
      };
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(updated_product, token, product.id);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not admin', async () => {
      user = User.build({ admin: false });
      token = createJWT(user);
      const res = await response(updated_product, token, product.id);

      expect(res.status).toBe(403);
    });

    it('should return 404 if invalid product ID', async () => {
      const product_id = 'id';
      const res = await response(updated_product, token, product_id);

      expect(res.status).toBe(404);
    });

    it('should return 404 if product ID valid but product ID not in DB', async () => {
      const product_id = '10000';
      const res = await response(updated_product, token, product_id);

      expect(res.status).toBe(404);
    });

    it('should return 400 if invalid category ID ', async () => {
      updated_product.categoryId = 'id';
      const res = await response(updated_product, token, product.id);

      expect(res.status).toBe(400);
    });

    it('should return 400 if category ID valid but category ID not in DB', async () => {
      updated_product.categoryId = '10000';
      const res = await response(updated_product, token, product.id);

      expect(res.status).toBe(400);
    });

    // it('should return 400 if product is invalid', async () => {
    //   updated_product = { categoryId: new_category.id };
    //   const res = await response(updated_product, token, product.id);
    //   expect(res.status).toBe(400);
    // });

    it('should update product if input is valid', async () => {
      const res = await response(updated_product, token, product.id);
      const saved_product = await Product.findOne({ where: { title: 'Water' } });

      expect(saved_product).toHaveProperty('id', product.id);
      expect(saved_product).toHaveProperty('title', 'Water');
      expect(saved_product).toHaveProperty('description', 'Pure Water');
      expect(saved_product).toHaveProperty('price', 4.99);
      expect(saved_product).toHaveProperty('small_image_path', "/");
      expect(saved_product).toHaveProperty('large_image_path', "/");
      expect(saved_product).toHaveProperty('categoryId', new_category.id);
    });

    it('should return updated product if it is valid', async () => {
      const res = await response(updated_product, token, product.id);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', product.id);
      expect(res.body).toHaveProperty('title', 'Water');
      expect(res.body).toHaveProperty('description', 'Pure Water');
      expect(res.body).toHaveProperty('price', 4.99);
      expect(res.body).toHaveProperty('small_image_path', "/");
      expect(res.body).toHaveProperty('large_image_path', "/");
      expect(res.body).toHaveProperty('categoryId', new_category.id);
    });
  });

  describe('DELETE /ID', () => {
    let token, category, product, user;
    const response = async (id, jwt) => {
      return await request
        .delete('/api/products/' + id)
        .set('x-auth-token', jwt);
    };

    beforeEach(async () => {
      user = await User.create({
        username: 'bob',
        email: 'bob@example.com',
        password_digest: '123456',
        admin: true
      });
      token = createJWT(user);
      category = await Category.create({ name: 'Soda' });
      product = await Product.create({
        title: 'Pepsi',
        description: 'Pepsi Soda',
        price: 2.99,
        small_image_path: "/",
        large_image_path: "/",
        categoryId: category.id,
      });
      await Review.bulkCreate([
        { productId: product.id, userId: user.id, title: 'Great', body: "b1", rating: 5 },
        { productId: product.id, userId: user.id, title: 'Bad', body: "b2", rating: 1 }
      ]);
    });

    it('should return 401 if client not logged in', async () => {
      token = '';
      const res = await response(product.id, token);

      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not admin', async () => {
      user = User.build({ admin: false });
      token = createJWT(user);
      const res = await response(product.id, token);

      expect(res.status).toBe(403);
    });

    it('should return 404 if invalid product ID', async () => {
      const product_id = 'id';
      const res = await response(product_id, token);

      expect(res.status).toBe(404);
    });

    it('should return 404 if product ID valid but product ID not in DB', async () => {
      const product_id = '10000';
      const res = await response(product_id, token);

      expect(res.status).toBe(404);
    });

    it('should delete product and associated reviews if input is valid', async () => {
      const res = await response(product.id, token);
      const returned_product = await Product.findOne({ where: { id: product.id } });
      const returned_reviews = await Review.findAll();

      expect(returned_product).toBeNull();
      expect(returned_reviews).toEqual([]);
    });

    it('should return deleted product', async () => {
      const res = await response(product.id, token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', product.id);
      expect(res.body).toHaveProperty('title', 'Pepsi');
      expect(res.body).toHaveProperty('description', 'Pepsi Soda');
      expect(res.body).toHaveProperty('price', 2.99);
      expect(res.body).toHaveProperty('small_image_path', "/");
      expect(res.body).toHaveProperty('large_image_path', "/");
      expect(res.body).toHaveProperty('categoryId', category.id);
    });
  });
});
