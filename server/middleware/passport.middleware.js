const config = require('../config');
const secret = config.AUTH_SECRET_KEY;
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const argon2 = require('argon2');
const User = require('../models/user.model');
const LocalStrategy = require('passport-local').Strategy;
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;

module.exports = (passport) => {

  passport.use('local-register', new LocalStrategy({
    usernameField : 'email',
    passwordField : 'password'
  }, async (email, password, done) => {
    try {
      let token = crypto.randomBytes(32).toString('base64');
      let emailVerificationHash = await argon2.hash(token, {type: argon2.argon2id});
      let passHash = await argon2.hash(password, {type: argon2.argon2id});
      let user = await new User;
      user.local.email = email;
      user.local.password = passHash;
      user.local.emailVerificationHash = emailVerificationHash;
      user.save( (err) => {
        if (err) {
          console.log('error saving user')
          return done(null, false, { message : 'Error creating account' });
        }
        return done(null, user, {
          message : 'Account created, check your email to activate your account',
          emailAddress: user.local.email,
          emailVerificationToken: token
        });
      })
    } catch (err) {
      console.log(err);
      return done(null, false, { message : err });
    }
  }));

  passport.use('local-login', new LocalStrategy({
    usernameField : 'email',
    passwordField : 'password'
  }, async (email, password, done) => {
    try {
      //Find the user associated with the email provided by the user
      const user = await User.findOne({ "local.email": email });
      if( !user ){
        //If the user isn't found in the database, return a message
        return done(null, false, { message : 'Account not found. Check username or register an account'});
      }
      //Validate password and make sure it matches with the corresponding hash stored in the database
      const validate = await user.isValidPassword(password);
      if( !validate ){
        return done(null, false, { message : 'Incorrect Password'});
      }
      //Send the user information to the next middleware
      return done(null, user, { message : 'Logged in Successfully'});
    } catch (error) {
      return done(error);
    }
  }));

  //This verifies that the token sent by the user is valid
  passport.use('jwt', new JWTstrategy({
    secretOrKey : secret,
    jwtFromRequest : ExtractJWT.fromAuthHeaderAsBearerToken()
  }, async (payload, done) => {
    try {
      //Pass the user details to the next middleware
      return done(null, payload);
    } catch (error) {
      console.log(error)
      done(error);
    }
  }));
}
