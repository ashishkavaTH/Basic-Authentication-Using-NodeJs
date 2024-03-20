import express from "express";
import User from "../model/user.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import auth from "../middleware/auth.js";
import logger from "../utils/logger.js";

const router = express.Router();

router.post("/users", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const missingFields = [];

    if (!firstName) {
      missingFields.push("firstName");
    }
    if (!lastName) {
      missingFields.push("lastName");
    }
    if (!email) {
      missingFields.push("email");
    }
    if (!password) {
      missingFields.push("password");
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Missing required fields in the request body: ${missingFields.join(
          ", "
        )}`,
      });
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

    logger.info("User created successfully:", user);

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
      return res.status(400).json({ error: "User is not present" });
    }

    if (user && (await bcryptjs.compare(password, user.password))) {
      const token = jwt.sign({ id: user._id }, "shhhh", { expiresIn: "2h" });
      user.token = token;
      user.password = undefined;

      const options = {
        expires: new Date(Date.now() + 2 * 60 * 60 * 1000),
        httpOnly: true,
      };

      logger.info("User logged in successfully:", user);

      const result = res.status(200).cookie("token", token, options).json({
        success: true,
        token: token,
        user: user._id,
      });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.patch("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email } = req.body;

    const checkUser = await User.findById(id);
    if (!checkUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { firstName, lastName, email },
      { new: true }
    );

    logger.info("User updated successfully:", updatedUser);

    res.status(204).json(updatedUser);
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

router.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    logger.info("User deleted successfully:", user);

    res.status(204).json(user);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
