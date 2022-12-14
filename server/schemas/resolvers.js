const { Cart, Listing, Review, User } = require('../models');

const { ApolloError } = require('apollo-server-express');
const { signToken } = require('../auth');

const resolvers = {
  Query: {
    async getUser(_, { userId }) {
      return await User.findOne({ _id: userId });
    },
    async getUsers() {
      return await User.find();
    },
    async getListing(_, { listingId }) {
      return await Listing.findOne({ _id: listingId });
    },
    async getListings() {
      return await Listing.find().populate('listing_author').populate('reviews');
    },
  },
  Mutation: {
    // mutation called when registering a new user account
    async addUser(_, { email, password }, context) {
      try {
        // try to create user
        const userData = await User.create({ email, password });
        // create token based on user data
        const tokenData = signToken(userData);
        // return userdata and token
        return { userData, tokenData };
        // otherwise, error and break out
      } catch (err) {
        throw new ApolloError(err);
      }
    },
    // mutation called when logging into an existing account
    async loginUser(_, { email, password }, context) {
      // finds user by email and populates child data
      const userData = await User.findOne({ email })
        .populate('listings')
        .populate('shoppingCart')
        .populate('reviews');
      // no user found? throw error
      if (!userData)
        throw new ApolloError(`There isn't a user with that email`);
      // incorrect password? throw error
      if (!userData.validatePassword(password))
        throw new ApolloError(`Your password wrong. Think harder.`);
      // if user exists && has correct pass,,,
      try {
        // try signing token!
        const tokenData = signToken(userData);
        // return token and user
        return { userData, tokenData };
        // otherwise, throw error and break out
      } catch (err) {
        throw new ApolloError(err);
      }
    },
    async addListing(
      _,
      { item_name, description, category, quantity, image_url, price }
    ) {
      return Listing.create({
        item_name,
        description,
        category,
        quantity,
        image_url,
        price,
      });
    },
    async updateListing(
      _,
      { id, item_name, description, category, quantity, image_url, price }
    ) {
      return Listing.findOneAndUpdate(
        { _id: id },
        {
          item_name,
          description,
          category,
          quantity,
          image_url,
          price,
        }
      );
    },
  },
};

module.exports = resolvers;
