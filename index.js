import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userDb from "./Schema/usersSchema.js";
import bodyParser from "body-parser";
import passport from "passport";
import initializePassport from "./middlewares/passport-config.js";
import bcrypt from "bcrypt";
import session from "express-session";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const app = express();
const port = 1222;
initializePassport(passport);

app.use(cors());
app.use(express.json());
app.use(bodyParser.raw({ type: "*/*" }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

mongoose
  .connect(
    `mongodb+srv://mshubham:${process.env.MONGOPASS}@clusterh.ilp8ion.mongodb.net/Devrev?retryWrites=true&w=majority`
  )
  .then((e) => {
    console.log(`connected to ${e.connection.host}`);
  })
  .catch((err) => {
    console.log(err);
  });

app.get("/", (req, res) => {
  res.json({ title: "this is a server for devrevTask" });
});

app.post("/register", async (req, res) => {
  console.log("register request");

  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  const user = { email: req.body.email, password: hashedPassword };
  const userObj = new userDb(user);
  try {
    await userObj.save(userObj);

    res.json({ statusCode:200, savedUser: user });
  } catch (err) {
    console.log(err);
    res.json({ statusCode:400});
  }
});

app.post("/login", (req, res, next) => {
  console.log("login request");
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      throw err;
    } else if (!user) {
      res.send({ statusCode: 404, status: info, user: null });
    } else {
      req.logIn(user, (err) => {
        if (err) {
          throw err;
        } else {
          res.send({
            statusCode: 200,
            status: "Success",
            user: req.body.email,
          });
          console.log(req.user);
        }
      });
    }
  })(req, res, next);
});

app.get("/user", (req, res) => {
  res.send(req.user);
});

app.listen(port, () => {
  console.log(`The server is listening on ${port}`);
});
