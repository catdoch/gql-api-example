const { ApolloServer } = require('apollo-server-express');
const express = require('express');
const expressPlayground = require('graphql-playground-middleware-express').default;

const typeDefs = require('./typeDefs');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const resolvers = require('./resolvers');

async function start() {
    const app = express();
    const MONGO_DB = process.env.DB_HOST;

    const client = await MongoClient.connect(
        MONGO_DB,
        { useNewUrlParser: true }
    );
    const db = client.db();
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        context: async ({ req }) => {
            const githubToken = req.headers.authorization
            const currentUser = await db.collection('users').findOne({ githubToken });
            return { db, currentUser };
        }
    });

    server.applyMiddleware({ app });

    app.get('/', (req, res) => res.end('Welcome to photoshare API'));
    app.get('/playground', expressPlayground({ endpoint: '/graphql' }));

    app.listen({ port: 4001 }, () => {
        console.log(`Graphql Service is running @ http://localhost:4000${server.graphqlPath}`);
    });
}

start();
