import express from "express";
import User from "../model/user.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/users", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password) {
      return res
        .status(400)
        .json({ error: "Missing required fields in the request body" });
    }

    const existUser = await User.findOne({ email });
    if (existUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const encryptPassword = await bcryptjs.hash(password, 10);
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: encryptPassword,
    });

    const token = jwt.sign(
      {
        id: user._id,
      },
      "shhhh",
      { expiresIn: "2h" }
    );
    user.token = token;
    user.password = undefined;

    res.status(201).json({ user, token });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Missing required fields in the request body" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    if (user && (await bcryptjs.compare(password, user.password))) {
      const token = jwt.sign({ id: user._id }, "shhhh", { expiresIn: "2h" });
      user.token = token;
      user.password = undefined;

      const options = {
        expires: new Date(Date.now() + 2 * 60 * 60 * 1000),
        httpOnly: true,
      };
      const result = res.status(200).cookie("token", token, options).json({
        success: true,
        token: token,
        user,
      });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    return res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/dashboard", auth, (req, res) => {
  console.log("The Dashboard is working");
});

export default router;
