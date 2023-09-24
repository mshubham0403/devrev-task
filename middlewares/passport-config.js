import userDb from "../Schema/usersSchema.js";
import local from "passport-local";
import bcrypt from "bcrypt";



const LocalStrategy = local.Strategy;

async function initialize(passport) {
  passport.use(
    new LocalStrategy({ usernameField: "email" }, async (emailReq, passwordReq, done) => {
      try {
        const user = await userDb.findOne({ email: emailReq });

        if (!user) {
          return done(null, false, { message: "User not found" });
        }

        const passwordMatch = await bcrypt.compare(passwordReq, user.password);

        if (passwordMatch) {
          return done(null, user, { message: "Success" });
        } else {
          return done(null, false, { message: "Incorrect password" });
        }
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user, done) => {
    return done(null, user.email);
  });

  passport.deserializeUser(async (emailid, done) => {
    try {
      const user = await userDb.findOne({ email: emailid });
      const userInformation = {
        email: user.email,
      };
      return done(null, userInformation);
    } catch (err) {
      return done(err);
    }
  });
}

export default initialize;

