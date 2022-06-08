const graphql = require("graphql");
const axios = require("axios");

const api = axios.create({
  baseURL: "http://localhost:3000",
});

const { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLSchema } = graphql;

const CompanyType = new GraphQLObjectType({
  name: "Company",
  fields: {
    id: {
      type: GraphQLInt,
    },
    name: {
      type: GraphQLString,
    },
    description: {
      type: GraphQLString,
    },
  },
});

const UserType = new GraphQLObjectType({
  name: "User",
  fields: {
    id: {
      type: GraphQLString,
    },
    firstName: {
      type: GraphQLString,
    },
    age: {
      type: GraphQLInt,
    },
    company: {
      type: CompanyType,
      resolve(parentValue, args) {
        const { companyId } = parentValue;
        return api(`/companies/${companyId}`).then((response) => response.data);
      },
    },
  },
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    user: {
      type: UserType,
      args: { id: { type: GraphQLString } },
      resolve(parentValue, args) {
        return api(`/users/${args.id}`).then((response) => response.data);
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
});
