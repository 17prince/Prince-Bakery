<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/17prince/Prince-Bakery">
    <img src="public/images/logo-solid.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">🍰Prince Bakery🍰</h3>

  <p align="center">
    🚀An awesome Bakery🎂. Explore a delightful range of bakery items!🚀
  </p>
</div>

<!-- About The Project -->
# About The Project
Welcome to our Prince Bakery! This API based website allows users to explore and purchase delicious bakery items while supporting all essential CRUD (Create, Read, Update, Delete) operations. We've used [Strip](https://stripe.com/en-in) payment gateway to implement payment service and [SendGrid](https://app.sendgrid.com/) to enable email notification service. 

## Key Features

- **Browse Items**: Explore a delightful range of bakery items available for purchase.

- **CRUD Operations**: Perform Create, Read, Update, and Delete operations seamlessly.

- **Pagination**: Limits the number of items to fetch

- **Security Measures**:
  - No-SQL Query Injection Protection.
  - Parameter Pollution Safeguards.
  - To Prevnet from XSS attack

- **Payment Gateway**:
  - Strip Payment Service

- **Email Notification**:
  - Nodemailer
  - Mailtrap for testing
  - Sendgrid in production

## Built With
* [![Javascript.badge]](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
* [![Expressjs.badge]](https://expressjs.com/)
* [![Mongdb.badge]](https://www.mongodb.com/)
* [![Nodejs.badge]](https://nodejs.org/en)
* [![Stripe.badge]](https://stripe.com/)
* [![Redis.badge]](https://redis.io/)
* [![html.badge]](https://www.w3schools.com/html/)
* [![css.badge]](https://www.w3schools.com/css/)
* [![jwt.badge]](https://jwt.io/)
* [![Pug.badge]](https://pugjs.org/)

# Getting Started With
  This is an example of how you may give instructions on setting up your project locally.
  To get a local copy up and running follow these simple example steps.

  ### Installation 
  Below is the example of how you can install this project and run it on your local machine.
  
  **NOTE:** [*The current version of nodejs for this project is ( >=10.0.0 <15)*]

  1. Clone the repository
     ```sh
        git clone https://github.com/17prince/Prince-Bakery.git
     ```
  2. Install NPM packages
     ```sh
     npm install
     ```
  3. Create a `config.env` file
     ```
     NODE_ENV=development
     PORT=1714
     DATABASE
     DATABASE_PASSWORD

     JWT_SECRET
     JWT_EXPIERS_IN=90d
     JWT_COOKIE_EXPIERS_IN=90

     // mailtrap for testing
     EMAIL_USERNAME
     EMAIL_PASSWORD
     EMAIL_HOST=smtp.mailtrap.io
     EMAIL_PORT

     REDIS_URL=redis://<password>@<Endpoint>
     REDIS_ENDPOINT
     REDIS_PASSWORD

      EMAIL_FROM
     
     //Sendgrid for production
     SENDGRID_USERNAME
     SENDGRID_PASSWORD

     STRIPE_SECRET_KEY
     STRIPE_WEBHOOK_SECRET

## Contact

Name : Prince Vishwakarma

Contact : [LinkedIn](https://www.linkedin.com/in/prince-vishwakarma24/)


<!-- Shields badages (https://shields.io/badges): For interactive badges used in Built With section -->
[Nodejs.badge]: https://img.shields.io/badge/Nodejs-green?style=for-the-badge&logo=nodedotjs&logoColor=%23339933
[Expressjs.badge]: https://img.shields.io/badge/ExpressJs-%23000000?style=for-the-badge&logo=express
[Javascript.badge]: https://img.shields.io/badge/Javascript%20-%23F7DF1E?style=for-the-badge&logo=javascript&logoColor=black
[Mongdb.badge]: https://img.shields.io/badge/MongoDB-%2347A248?style=for-the-badge&logo=mongodb&logoColor=white
[Stripe.badge]: https://img.shields.io/badge/Stripe-%23008CDD?style=for-the-badge&logo=stripe&logoColor=white
[html.badge]: https://img.shields.io/badge/HTML-%23E34F26?style=for-the-badge&logo=html5&logoColor=white
[css.badge]: https://img.shields.io/badge/CSS-%231572B6?style=for-the-badge&logo=css3&logoColor=white
[jwt.badge]: https://img.shields.io/badge/JWT-%23000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white
[Redis.badge]: https://img.shields.io/badge/Redis-%23DC382D?style=for-the-badge&logo=redis&logoColor=black
[Pug.badge]: https://img.shields.io/badge/Pug-%23A86454?style=for-the-badge&logo=pug&logoColor=black



