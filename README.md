# Store API

## Project Description
This is a simple API for an online store. I based the folder structure, authentication and authorization on what I learned in the following course: https://codewithmosh.com/p/the-complete-node-js-course

The basic technology stack is:
* Sequelize + PostgreSQL/SQLite (database)
* Express (web server)
* Jest (testing framework)
* Node.js (run-time environment)

## Project Setup
1. Install Node.js: https://nodejs.org/
1. Download project files
1. ``` $ cd cis565-backend ``` # navigate to project's root directory
1. ``` $ npm i ``` # install the packages listed in package.json
1. From the command line, set the value of the following environment variables:
    * jwt_private_key: used to create the JSON Web tokens that allow users to securely log in to the application.
        * Example (Mac): ``` $ export store_api_jwt_private_key=your_private_key ```
    * bcrypt_salt: specifiy the number of rounds used to create the salt used in the hashing algorithm.
        * Example (Mac): ``` $ export store_api_bcrypt_salt=5 ```
1. ``` $ node sequelize.js ``` # Create development database
1. ``` $ node seed_db ``` # seed the database with quizzes
1. ``` $ NODE_ENV=test node sequelize.js ``` # Create test database
1. ``` $ npm test ``` # Run tests
1. ``` $ npm start ``` # start server
1. Done. You can now use a command line tool like ``` $ curl ```, or an application like Postman to test the API endpoints.
1. ``` $ npm outdated ``` # check for outdated packages
1. ``` $ npm update ``` # update packages

Additional resources that helped me:
* Express Static Files:
  * https://expressjs.com/en/starter/static-files.html
* Sequelize Setup:
  * http://docs.sequelizejs.com
  * https://www.codementor.io/mirko0/how-to-use-sequelize-with-node-and-express-i24l67cuz
  * https://arjunphp.com/restful-api-using-async-await-node-express-sequelize/
  * https://www.youtube.com/watch?v=6NKNfXtKk0c
  * https://stackoverflow.com/questions/23929098/is-multiple-delete-available-in-sequelize
* Sequelize Transactions:
  * https://stackoverflow.com/questions/31095674/create-sequelize-transaction-inside-express-router
  * http://docs.sequelizejs.com/manual/tutorial/transactions.html
  * https://stackoverflow.com/questions/45690000/sequelize-transaction-error?rq=1
* Sequelize Deployement to Heroku:
  * http://docs.sequelizejs.com/manual/installation/usage.html
  * https://sequelize.readthedocs.io/en/1.7.0/articles/heroku/
* Jest Options:
  * https://stackoverflow.com/questions/50171932/run-jest-test-suites-in-groups
* Node Environment Variables:
  * https://stackoverflow.com/questions/9198310/how-to-set-node-env-to-production-development-in-os-x

## App Structure
<p align="center">
  <img alt="Image of App Structure" src="https://raw.github.com/jtimwill/store-api/master/images/store-api-diagram.png" />
</p>

## Entity Relationship Diagram
<p align="center">
  <img alt="Image of ERD" src="https://raw.github.com/jtimwill/store-api/master/images/node-store-erd.png"/>
</p>

## Routes and Resources
### Users Resource
|URL|HTTP verb|Result|Include JWT?|Admin only?|
|---|---|---|---|---|
/api/users|POST|create a new user|No|No|
/api/users|GET|return all users|Yes|Yes|
/api/users/me|GET|return current user and associated reviews|Yes|No|
/api/users/me|PUT|update current user|Yes|No|
/api/users/:id|DELETE|delete a user|Yes|Yes|

### Products Resource
|URL|HTTP verb|Result|Include JWT?|Admin only?|
|---|---|---|---|---|
/api/products|POST|create a new product|Yes|Yes|
/api/products|GET|return all products and reviews|No|No|
/api/products/:id|GET|return a specific product and reviews|No|No|
/api/product/:id|PUT|update a specific product|Yes|Yes|
/api/product/:id|DELETE|delete a specific product|Yes|Yes|

### Reviews Resource
|URL|HTTP verb|Result|Include JWT?|Admin only?|
|---|---|---|---|---|
/api/products/:productId/reviews|POST|create a new review|Yes|No|
/api/products/:productId/reviews|GET|return all reviews|Yes|No|
/api/products/:productId/reviews/:id|GET|return a specific review|Yes|No|
/api/products/:productId/reviews/:id|PUT|update a specific review|Yes|No|
/api/products/:productId/reviews/:id|DELETE|delete a specific review|Yes|No*|

### Category Resource
|URL|HTTP verb|Result|Include JWT?|Admin only?|
|---|---|---|---|---|
/api/categories|POST|create a new category|Yes|Yes|
/api/categories/:id|GET|return a specific category|Yes|Yes|
/api/categories|GET|return all categories|Yes|No|
/api/categories/:id|PUT|update a specific category|Yes|Yes|
/api/categories/:id|DELETE|delete a specific category|Yes|Yes|

### Shipping Options Resource
|URL|HTTP verb|Result|Include JWT?|Admin only?|
|---|---|---|---|---|
/api/shipping-options|POST|create a new shipping option|Yes|Yes|
/api/shipping-options/:id|GET|return a specific shipping option|Yes|No|
/api/shipping-options|GET|return all shipping options|Yes|No|
/api/shipping-options/:id|PUT|update a specific shipping option|Yes|Yes|
/api/shipping-options/:id|DELETE|delete a specific shipping option|Yes|Yes|

### Cart Products Resource
|URL|HTTP verb|Result|Include JWT?|Admin only?|
|---|---|---|---|---|
/api/cart-products|POST|add a cart_product|Yes|No|
/api/cart-products|GET|return all cart_products|Yes|No|
/api/cart-products/:id|PUT|update a specific cart_product|Yes|No|
/api/cart-products/:id|DELETE|delete a specific cart_product|Yes|No|

### Orders Resource
|URL|HTTP verb|Result|Include JWT?|Admin only?|
|---|---|---|---|---|
/api/orders|POST|Create a new order and associated order_products|Yes|No|
/api/orders|GET|return all orders and associated order_products for current user|Yes|No|
/api/orders/:id|GET|return a specific order and associated order_products for current user|Yes|No|
/api/orders/:id|PUT|update a specific order and associated order_products|Yes|Yes|
/api/orders/:id|DELETE|delete a specific order and associated order_products|Yes|Yes|

### Order Products Resource
|URL|HTTP verb|Result|Include JWT?|Admin only?|
|---|---|---|---|---|
/api/orders/:orderId/order-products/:id|PUT|update a specific order_product|Yes|Yes|
/api/orders/:orderId/order-products/:id|DELETE|delete a specific order_product|Yes|Yes|

### Login Resource
|URL|HTTP verb|Result|Include JWT?|Admin only?|
|---|---|---|---|---|
/api/login|POST|return a new JSON web token that can be used to identify the current user|No|No|
