
# Book Review System

A book review backend application that registers users, let them add books and corresponding reviews for the books.

### Tech stack used
1. TypeScript
2. Node.js
3. Postgres
4. Apollo Server
5. GraphQL APIs

### Libraries used
1. bcryptjs - password hashing
2. graphql - to create gql schemas
3. jsonwebtoken - to return and validate JWT Tokens
4. prisma - ORM to communicate with database
5. jest - to test the application
6. nodemon - to enable watch mode while developing application
7. apollo-server - to setup apollo server

## Project setup

Pre requisites on system

A. Nodejs
    'https://nodejs.org/en/download/package-manager'

B. TypeScript (tsc)
    `npm install -g typescript`

C. Postgres
    'https://www.postgresql.org/download/'

### Local setup    

1. run `npm install`
2. create .env file in directory and add your database url in the following format, then add JWT SECRET for JWT Tokens : 
	
    a. `DATABASE_URL="postgresql://USERNAME:PASSWORD@URL:HOST/DB_NAME?schema=public"`
	
    b. `JWT_SECRET="your_jwt_secret"`
3. run `npx prisma migrate dev` to setup database and run migrations (this will also setup the prisma client)
4. run `npx tsc` to generate js files in the dist directory
5. run `npx jest` to run test cases
6. run `npm run dev` to run application in watch mode
7. run `npm run start` to run application in normal mode

Documentation for the application can be found on the application server when the server is running
`https://studio.apollographql.com/sandbox/explorer`

#### Available mutations
1. register 
2. login 
3. addBook
4. addReview 
5. deleteReview 
6. updateReview


#### Available Queries
1. getBooks
2. getBook
3. getReviews
4. getMyReviews
5. searchBooks


### Contact Information
Name - Vineet Dugar

Phone - 8334987199

Email - dugarvineet211@gmail.com