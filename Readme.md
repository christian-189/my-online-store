# My Online Store – Assignment 2

This is the README for Assignment 2 of 32516 Internet Programming at UTS. The project is an e-commerce web application where users can browse 
products, manage a shopping cart, and create an account. An admin can manage the product catalogue and view all user carts.

## Tech Stack:

- Frontend: React, React Router, CSS
- Backend: Node.js, Express
- Database: MongoDB
- Authentication: bcrypt, JWT
- Environment variables: dotenv

## How to Run

### Start MongoDB:
cd backend/mongodb-macos-x86_64-7.0.5 
./bin/mongod --dbpath ./data

### Set up environment variables:
cp .env.example .env
Open .env and set JWT_SECRET to any string, e.g. "mysecret123"

### Start the backend (in my_Shop):
node testServer.js

### Start the frontend:
cd my-shop-react
npm start

### Seed the product catalogue (first time only):
node seedProducts.js

### Create an admin user – first register via /register in the browser, then run:
node makeAdmin.js your@email.com

## Folder Structure

The project is split into backend and frontend. The backend consists of the Express server (testServer.js), route handlers in routes/, and JWT 
middleware in middleware/. The frontend is in my-shop-react/src/, with components/ for all React components, api/cart.js for all backend 
communication, and CSS files for styling.

my_Shop/
├── backend/                  # MongoDB binary and data
├── middleware/
│   └── verifyToken.js        # JWT middleware
├── routes/
│   ├── authRoutes.js         # Register and login
│   ├── cartRoutes.js         # Cart CRUD
│   ├── productRoutes.js      # Product CRUD
│   └── adminRoutes.js        # Admin endpoints
├── my-shop-react/src/
│   ├── api/cart.js           # API calls and auth helpers
│   ├── components/           # React components
│   └── App.js                # Root component and routing
├── testServer.js             # Server entry point
├── seedProducts.js           # Product seeding script
└── .env.example              # Environment variable template

## Workload Allocation

This project was completed individually by Christian Gewehr.

