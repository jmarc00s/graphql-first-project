const graphql = require("graphql");
const { api } = require("../service");

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLList,
} = graphql;

const CompanyType = new GraphQLObjectType({
  name: "Company",
  fields: () => ({
    id: {
      type: GraphQLInt,
    },
    name: {
      type: GraphQLString,
    },
    description: {
      type: GraphQLString,
    },
    users: {
      type: new GraphQLList(UserType),
      resolve: async (parentValue, args) => {
        const { data } = await api(`/companies/${parentValue.id}/users`);
        return data;
      },
    },
  }),
});

const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
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
  }),
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
    company: {
      type: CompanyType,
      args: { id: { type: GraphQLInt } },
      resolve: async (parentValue, args) => {
        const { data } = await api(`/companies/${args.id}`);
        return data;
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
});
