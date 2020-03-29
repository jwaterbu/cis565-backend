const {   User,
          Review,
          Product,
          Category,
          ShippingOption,
          Order,
          OrderProduct,
          CartProduct,
          sequelize } = require('./sequelize');
const bcrypt = require('bcrypt');
const config = require('config');

(async () => {
  try {
    // await sequelize.sync({force: true}); // Reset database
    const salt_value = Number(config.get("bcrypt_salt"));
    const salt = await bcrypt.genSalt(salt_value);
    const password_digest = await bcrypt.hash("123456", salt);

    // Create Admin User
    const admin = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password_digest: password_digest,
      admin: true
    });
    // Create User1
    const user_1 = await User.create({
      username: 'adam',
      email: 'adam@example.com',
      password_digest: '123456',
      admin: false
    });
    // Create User2
    const user_2 = await User.create({
      username: 'bob',
      email: 'bob@example.com',
      password_digest: '123456',
      admin: false
    });
    // Create User3
    const user_3 = await User.create({
      username: 'mary',
      email: 'mary@example.com',
      password_digest: '123456',
      admin: false
    });

    // Create Categories
    // const food = await Category.create({ name: 'Food' });
    // const transportation = await Category.create({ name: 'Transportation' });

    const male = await Category.create({ name: 'Male' });
    const female = await Category.create({ name: 'Female' });

    // Shipping_options
    const shipping_1 = await ShippingOption.create({
      title: 'standard', description: "d1", cost: 0.00
    });
    const shipping_2 = await ShippingOption.create({
      title: 'one-day', description: "d2",  cost: 5.99
    });

    // Orders
    const order_1 = await Order.create({
      userId: user_1.id, shippingOptionId: shipping_1.id
    });
    const order_2 = await Order.create({
      userId: user_1.id, shippingOptionId: shipping_2.id
    });

    const des = `Curabitur a lectus bibendum tellus aliquet imperdiet. Sed ut condimentum libero. In pellentesque euismod purus in commodo. Nunc pretium ligula mi, in efficitur enim aliquam vel. Aenean sagittis maximus sagittis. Integer est arcu, aliquet et faucibus non, pulvinar vel nunc. Donec vestibulum metus pretium faucibus facilisis. Pellentesque vel diam risus.`;
    const rev = `Nunc pretium ligula mi, in efficitur enim aliquam vel. Aenean sagittis maximus sagittis. Integer est arcu, aliquet et faucibus non, pulvinar vel nunc. Donec vestibulum metus pretium faucibus facilisis.`;

    const product_1 = await Product.create({
      categoryId: male.id,
      title: "Adidas Grand Court Sneaker",
      description: "Grey/White",
      price: 41.75,
      small_image_path: "https://cis-565.appspot.com/images/item_1.jpg",
      large_image_path: "https://cis-565.appspot.com/images/item_1.jpg",
    });
    const product_2 = await Product.create({
      categoryId: male.id,
      title: "Clarks Raharto Plain Oxford",
      description: " Blue Nubuck",
      price: 59.95,
      small_image_path: "https://cis-565.appspot.com/images/item_2.jpg",
      large_image_path: "https://cis-565.appspot.com/images/item_2.jpg",
    });
    const product_3 = await Product.create({
      categoryId: male.id,
      title: "Adidas Originals Cf Advantage",
      description: "White/Dark Blue",
      price: 46.00,
      small_image_path: "https://cis-565.appspot.com/images/item_3.jpg",
      large_image_path: "https://cis-565.appspot.com/images/item_3.jpg",
    });

    await Product.bulkCreate([
      {
        categoryId: male.id,
        title: "Adidas CF Lite Racer Byd",
        description: "White/Black",
        price: 52.50,
        small_image_path: "https://cis-565.appspot.com/images/item_4.jpg",
        large_image_path: "https://cis-565.appspot.com/images/item_4.jpg",
      },
      {
        categoryId: male.id,
        title: "Skechers Delson-Axton Sneaker",
        description: "Brown",
        price: 52.90,
        small_image_path: "https://cis-565.appspot.com/images/item_5.jpg",
        large_image_path: "https://cis-565.appspot.com/images/item_5.jpg",
      },
      {
        categoryId: male.id,
        title: "Sperry Striper II Salt Washed CVO Sneaker",
        description: "Gray",
        price: 42.00,
        small_image_path: "https://cis-565.appspot.com/images/item_6.jpg",
        large_image_path: "https://cis-565.appspot.com/images/item_6.jpg",
      },
      {
        categoryId: male.id,
        title: "Steve Madden's Fenta Fashion Sneaker",
        description: "Black Fabric",
        price: 62.00,
        small_image_path: "https://cis-565.appspot.com/images/item_7.jpg",
        large_image_path: "https://cis-565.appspot.com/images/item_7.jpg",
      },
      {
        categoryId: female.id,
        title: "Nike AIR Force 1 Basketball-Shoes",
        description: "Noble RED/Black-Plum Fog-Summit White",
        price: 109.95,
        small_image_path: "https://cis-565.appspot.com/images/item_8.jpg",
        large_image_path: "https://cis-565.appspot.com/images/item_8.jpg",
      },
      {
        categoryId: female.id,
        title: "IDIFU Elastic Flat Sandals",
        description: "Black",
        price: 16.99,
        small_image_path: "https://cis-565.appspot.com/images/item_9.jpg",
        large_image_path: "https://cis-565.appspot.com/images/item_9.jpg",
      },
      {
        categoryId: female.id,
        title: "Recreation Knit Sports Shoes",
        description: "Red",
        price: 39.96,
        small_image_path: "https://cis-565.appspot.com/images/item_10.jpg",
        large_image_path: "https://cis-565.appspot.com/images/item_10.jpg",
      },
      {
        categoryId: female.id,
        title: "SouthBrothers Sneakers Athletic Running Shoes",
        description: "Pink",
        price: 24.99,
        small_image_path: "https://cis-565.appspot.com/images/item_11.jpg",
        large_image_path: "https://cis-565.appspot.com/images/item_11.jpg",
      },
      {
        categoryId: female.id,
        title: "Jordan Air 1 Mid Retro",
        description: "Mid Pink-Foam",
        price: 321.84,
        small_image_path: "https://cis-565.appspot.com/images/item_12.jpg",
        large_image_path: "https://cis-565.appspot.com/images/item_12.jpg",
      }
    ]);

    // await Product.bulkCreate([
    //   {
    //     title: 'Super Soldier Serum',
    //     description: des,
    //     price: 10000000.00,
    //     small_image_path: "https://cis-565.appspot.com/images/small/fa-flask.png",
    //     large_image_path: "https://cis-565.appspot.com/images/large/fa-flask.png",
    //     categoryId: food.id,
    //   },
    //   {
    //     title: 'Martini',
    //     description: des,
    //     price: 7.99,
    //     small_image_path: "https://cis-565.appspot.com/images/small/fa-glass.png",
    //     large_image_path: "https://cis-565.appspot.com/images/large/fa-glass.png",
    //     categoryId: food.id,
    //   },
    //   {
    //     title: 'Wheelchair',
    //     description: des,
    //     price: 399.99,
    //     small_image_path: "https://cis-565.appspot.com/images/small/fa-wheelchair.png",
    //     large_image_path: "https://cis-565.appspot.com/images/large/fa-wheelchair.png",
    //     categoryId: transportation.id,
    //   },
    //   {
    //     title: 'Car',
    //     description: des,
    //     price: 30000.00,
    //     small_image_path: "https://cis-565.appspot.com/images/small/fa-car.png",
    //     large_image_path: "https://cis-565.appspot.com/images/large/fa-car.png",
    //     categoryId: transportation.id,
    //   },
    //   {
    //     title: 'Bicycle',
    //     description: des,
    //     price: 300.00,
    //     small_image_path: "https://cis-565.appspot.com/images/small/fa-bicycle.png",
    //     large_image_path: "https://cis-565.appspot.com/images/large/fa-bicycle.png",
    //     categoryId: transportation.id,
    //   },
    //   {
    //     title: 'Bus',
    //     description: des,
    //     price: 100000.00,
    //     small_image_path: "https://cis-565.appspot.com/images/small/fa-bus.png",
    //     large_image_path: "https://cis-565.appspot.com/images/large/fa-bus.png",
    //     categoryId: transportation.id,
    //   },
    //   {
    //     title: 'Space Shuttle',
    //     description: des,
    //     price: 200000000000.00,
    //     small_image_path: "https://cis-565.appspot.com/images/small/fa-space-shuttle.png",
    //     large_image_path: "https://cis-565.appspot.com/images/large/fa-space-shuttle.png",
    //     categoryId: transportation.id,
    //   },
    //   {
    //     title: 'Ambulance',
    //     description: des,
    //     price: 50000.00,
    //     small_image_path: "https://cis-565.appspot.com/images/small/fa-ambulance.png",
    //     large_image_path: "https://cis-565.appspot.com/images/large/fa-ambulance.png",
    //     categoryId: transportation.id,
    //   },
    //   {
    //     title: 'Motorcycle',
    //     description: des,
    //     price: 15000.00,
    //     small_image_path: "https://cis-565.appspot.com/images/small/fa-motorcycle.png",
    //     large_image_path: "https://cis-565.appspot.com/images/large/fa-motorcycle.png",
    //     categoryId: transportation.id,
    //   },
    //   {
    //     title: 'Truck',
    //     description: des,
    //     price: 45000.00,
    //     small_image_path: "https://cis-565.appspot.com/images/small/fa-truck.png",
    //     large_image_path: "https://cis-565.appspot.com/images/large/fa-truck.png",
    //     categoryId: transportation.id,
    //   },
    //   {
    //     title: 'Fighter Jet',
    //     description: des,
    //     price: 150000000.00,
    //     small_image_path: "https://cis-565.appspot.com/images/small/ion-jet.png",
    //     large_image_path: "https://cis-565.appspot.com/images/large/ion-jet.png",
    //     categoryId: transportation.id,
    //   },
    //   {
    //     title: 'Tesla Model S',
    //     description: des,
    //     price: 150000000.00,
    //     small_image_path: "https://cis-565.appspot.com/images/small/ion-model-s.png",
    //     large_image_path: "https://cis-565.appspot.com/images/large/ion-model-s.png",
    //     categoryId: transportation.id,
    //   }
    // ]);

    // Ordered Products
    await OrderProduct.bulkCreate([
      { orderId: order_1.id, productId: product_1.id, price: 83.50, quantity: 2 },
      { orderId: order_2.id, productId: product_2.id, price: 59.95, quantity: 1 },
      { orderId: order_2.id, productId: product_3.id, price: 23.96, quantity: 2 }
    ]);


    // Cart Products (only for main user)
    await CartProduct.bulkCreate([
      {
        quantity: 2,
        productId: product_1.id,
        userId: user_1.id
      },
      {
        quantity: 1,
        productId: product_3.id,
        userId: user_1.id
      },
      {
        quantity: 1,
        productId: product_2.id,
        userId: user_1.id
      }
    ]);

    // Reviews
    await Review.bulkCreate([
      { productId: product_1.id, userId: user_1.id, title: 'Great', body: rev, rating: 5 },
      { productId: product_2.id, userId: user_2.id, title: 'Bad', body: rev, rating: 1 },
      { productId: product_2.id, userId: user_3.id, title: 'Okay', body: rev, rating: 2 },
      { productId: product_2.id, userId: user_1.id, title: 'Meh', body: rev, rating: 3 }
    ]);

    console.log("Success!");
  } catch(err) {
    console.log("ERROR! Try Again!");
    console.log("Error info: " + err);
  }

  await sequelize.close();
})();
