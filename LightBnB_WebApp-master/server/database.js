const properties = require('./json/properties.json');
const users = require('./json/users.json');
const { Client } = require('pg');
require('dotenv').config();

// Create the connection settings for the db
const connectionSettings = {
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
};

const pgClient = new Client(connectionSettings);

// Connect to the database
pgClient
  .connect()
  .then(() => {
    console.log(`Connected to ${pgClient.database} database`);
  })
  .catch(err => console.log(err));

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  const getUserByEmailQuery = `
  SELECT *
  FROM users
  WHERE email = $1;
  `;

  return pgClient.query(getUserByEmailQuery, [email])
    .then(res => res.rows[0]);
};

exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  const getUserByEmailQuery = `
  SELECT *
  FROM users
  WHERE id = $1;
  `;

  return pgClient.query(getUserByEmailQuery, [id])
    .then(res => res.rows[0]);
};
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser =  function(user) {
  const insertUserQuery = `
  INSERT INTO users (name, email, password)
  VALUES ($1, $2, $3)
  RETURNING *;
  `;

  const idInfo = [user.name,user.email,user.password];

  return pgClient.query(insertUserQuery, idInfo)
    .then(res => res.rows);
};
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  return getAllProperties(null, 2);
};
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */

const getAllProperties = function(options, limit = 10) {
  const getAllPropertiesQuery = `
    SELECT *
    FROM properties
    LIMIT $1;
  `;

  return pgClient.query(getAllPropertiesQuery, [limit])
    .then(res => {
      const limitedProperties = {};
      for (let i = 1; i <= res.rows.length; i++) {
        limitedProperties[i] = properties[i];
      }
      return limitedProperties;
    });
};
exports.getAllProperties = getAllProperties;

/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
}
exports.addProperty = addProperty;
