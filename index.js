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
const port = (process.env.NODE_ENV==='development')?1222 : process.env.PORT;
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
  console.log("register request",req.body);
    
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  const user = { email: req.body.email, password: hashedPassword };
  const userObj = new userDb(user);
  try {
    await userObj.save(userObj);
    console.log("user created",userObj);
    const currentTime = new Date().toISOString();
    res.json({ status:201, createdUser: req.body ,encodedToken:`${user}+${currentTime}` });
  } catch (err) {
    console.log(err);
    res.json({ status:400});
  }
});

app.post("/recentProducts", async (req, res) => {
  if (!req.body.page) req.body.page = 1;
  const dataArr = await fetch(
    `https://openlibrary.org/search.json?q=subject_key%3Afiction&mode=everything&limit=15&fields=key,title,author_key,author_name,subject,first_publish_year,ebook_count_i,lccn&sort=old&page=${req.body.page}`
  );
  const data = await dataArr.json(); 
  const records = data.numFound;
  const products = data.docs.map( book => {
    console.log(book);
    
    return {
      _id: book.key,
      title: book.title,
      brand: book.author_name ? book.author_name[0] : "Unknown",
      image : `https://covers.openlibrary.org/b/lccn/${book.lccn?book.lccn[0]:93005405}.jpg`,
      outOfStock : (book.ebook_count_i)?book.ebook_count_i:0
    };
  });
  const resObj = {
    data:products,status:200
  };
  
  res.json(resObj);
});



app.post("/login", (req, res, next) => {
  console.log("login request");
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      throw err;
    } else if (!user) {
      res.send({ status: 404, data: info });
    } else {
      const currentTime = new Date().toISOString();
      req.logIn(user, (err) => {
        if (err) {
          throw err;
        } else {
          res.send({
            status: 200,
            data: {foundUser:req.body.email,encodedToken:`${req.body.email}+${currentTime}`},
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
