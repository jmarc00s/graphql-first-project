const graphql = require("graphql");
const { api } = require("../service");

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull,
  GraphQLBoolean,
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

const RootMutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addUser: {
      type: UserType,
      args: {
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) },
        companyId: { type: GraphQLInt },
      },
      resolve: async (parentValue, args) => {
        const user = { ...args };
        const { data: createdUser } = await api.post("/users", user);
        return createdUser;
      },
    },
    removeUser: {
      type: GraphQLBoolean,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (parentValue, args) => {
        const response = await api.delete(`/users/${args.id}`);
        return response.status === 200;
      },
    },
    updateUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        firstName: { type: GraphQLString },
        age: { type: GraphQLInt },
        companyId: { type: GraphQLInt },
      },
      resolve: async (parentValue, { id, firstName, age, companyId }) => {
        const user = { firstName, age, companyId };
        const { data: updatedUser } = await api.patch(`/users/${id}`, user);
        return updatedUser;
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation,
});
