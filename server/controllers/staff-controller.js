/**
 * @file staff-controller.js manages all interactions with the Staff table.
 * @module server/staff
 * @version 1.3.0
 */

const db = require('../db');
const token = require('./token-controller');
const pool = db.pool;

/**
 * The signIn function handles authentication when a user tries to sign in.
 * 
 * @param {string} username The username to authenticate.
 * @param {int} pin The pin number to authenticate.
 * @returns {json} The verified user token.
 */
async function signIn(username, pin) {
  let client;
  try {
    console.log('Attempting to sign in...');
    client = await pool.connect();//Establish Connection
    console.log('Connected to the database');
    const query = {
      text: 'SELECT * FROM staff WHERE staff_name = $1 AND staff_pin = $2',
      values: [username, pin],
    };
    const result = await client.query(query);
    if (result.rows.length === 0) {
      console.log('No matching user found');
      throw new Error('Invalid username or PIN. Please check your credentials and try again.');
    }
    console.log('Sign in successful');
    return username; // Return the token for staff member (for protected routes)
  } catch (error) {
    console.error(`Error signing in: ${error.message}`);
    throw new Error(`Unable to sign in: ${error.message}`);
  } finally {
    if (client) {
      console.log('client released');
      client.release(); // Release the client back to the pool
    }
  }
}

/**
 * The create account function handles creating new users.
 * 
 * @param {string} username The new username.
 * @param {int} pin The new pin number.
 * @returns {json} The newly created user.
 */
async function createAccount(username, pin, specialization) {
  let client;
  try {
    console.log('Creating account...');
    client = await pool.connect(); //Establish Connection
    console.log('Connected to the database');
    const checkQuery = {
      text: 'SELECT * FROM staff WHERE staff_name = $1',
      values: [username],
    };
    const checkResult = await client.query(checkQuery);
    if (checkResult.rows.length > 0) {
      throw new Error('An account with this username already exists.');
    }
    const query = {
      text: 'INSERT INTO staff (staff_name, staff_pin, staff_type) VALUES ($1, $2, $3) RETURNING *',
      values: [username, pin, specialization],
    };
    const result = await client.query(query);
    console.log('Account created successfully');
    return result.rows[0]; // Return the newly created staff member
  } catch (error) {
    throw new Error(`Unable to create account: ${error.message}`);
  } finally {
    if (client) {
      console.log('client released');
      client.release(); // Release the client back to the pool
    }
  }
}

module.exports = { signIn, createAccount };
