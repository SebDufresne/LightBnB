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
  const getAllReservationsQuery = `
  SELECT properties.*, reservations.*, ROUND(AVG(rating),2) as average_rating
  FROM properties
  JOIN reservations ON reservations.property_id = properties.id
  JOIN users ON guest_id = users.id
  JOIN property_reviews ON property_reviews.property_id = properties.id
  WHERE users.id = $1
  AND end_date < now()::date
  GROUP BY properties.id, reservations.id
  ORDER BY start_date
  LIMIT $2;
  `;

  const reqParams = [guest_id, limit];

  return pgClient.query(getAllReservationsQuery, reqParams)
    .then(res => res.rows);
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

  const queryParams = [];
  
  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  `;

  if (options) {
    queryString += ` WHERE `;
    const keysLits = [];
    for (const keys in options) {
      if (options[keys]) {
        keysLits.push(keys);
      }
    }

    for (let i = 0; i < keysLits.length - (options.minimum_rating ? 1 : 0); i++) {
      if (keysLits[i] === 'city') {
        queryParams.push(`%${options[keysLits[i]]}%`);
        queryString += ` city LIKE $${queryParams.length} `;
      }

      if (keysLits[i] === 'owner_id') {
        queryParams.push(`${options[keysLits[i]]}`);
        queryString += ` owner_id = $${queryParams.length} `;
      }

      if (keysLits[i] === 'minimum_price_per_night') {
        queryParams.push(`${options[keysLits[i]]}`);
        queryString += ` cost_per_night > $${queryParams.length} `;
      }

      if (keysLits[i] === 'maximum_price_per_night') {
        queryParams.push(`${options[keysLits[i]]}`);
        queryString += ` cost_per_night < $${queryParams.length} `;
      }

      if (i < keysLits.length - (options.minimum_rating ? 2 : 1)) {
        queryString += ` AND `;
      }
    }
  }

  queryString += `
  GROUP BY properties.id
  `;

  if (options.minimum_rating) {
    queryParams.push(`${options.minimum_rating}`);
    queryString += ` HAVING avg(property_reviews.rating) > $${queryParams.length} `;
  }

  queryParams.push(limit);
  queryString += `
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;

  return pgClient.query(queryString, queryParams)
    .then(res => res.rows);
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
