# Skim'd It News API

Skim'd It News API was my solo backend project for the [Northcoders'](https://northcoders.com/our-courses/coding-bootcamp) Software Engineering Bootcamp. 

## 🔗 Links:
Link to hosted version: https://skimd-it.onrender.com/

**Important Note**: The link is to the '/' path meaning the serve will correctly respond with a 404 error message. Make a request to an existing endpoint (see endpoints file) to be served data from the database. Example endpoint is <code>/api/users</code>. 

---

## 🏗️ Project Summary:

A news service API that implements a range of CRUD methods on news articles, article comments, news topics and users. 

---

## ✅ Instructions:

If you wish to clone this project and run it locally, follow the instructions below:

### 1. Clone Repository:

1. In this repository, use the <code><>Code</code> button to access and copy its url.
2. In your terminal, use <code>git clone</code> followed by the repository's url.
3. Open up the folder in you preferred IDE.

### 2. Install Dependencies:

- Run <code>npm install</code> to install all dependencies.
- See the package.json file for an overview of all dependencies used.

### 3. Create .env Files:

1. You will need to create two <code>.env</code> files to connect to the two databases locally: <code>.env.test</code> and <code>.env.development</code>.
2. Into each, add <code>PGDATABASE=<database_name_here></code>, with the correct database name for that environment - see <code>/db/setup.sql</code> for the database names.
3. Double check that these <code>.env</code> files are <code>.gitignored</code>.

### 4. Seed Local Database:

1. Run <code>npm run setup-dbs</code>.
2. Run <code>npm run seed</code>.

### 5. Run Tests:

- Integration tests: run <code>npm test app.test.js</code>.
- Unit tests for the seeding utility functions: run <code>npm test utils.test.js</code>.

---

## ⚙️ Version Requirements:

- Node.js: v19.2.0
- Postgres: v14.6
