import { ApolloServer } from 'apollo-server';
import { typeDefs } from './schema.js';
import { resolvers } from './resolvers.js';
import { createContext } from './context.js';

// starting point of the app
// defining resolvers, types and the context function for the server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: createContext,
});

// server started here
server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
