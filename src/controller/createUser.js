import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import User from "../model/user.js";
import logger from "../utils/logger.js";

const generateToken = (userId) => {
  return jwt.sign(
    {
      id: userId,
    },
    "shhhh",
    { expiresIn: "2h" }
  );
};

export const loginUser = async (req, res) => {
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
};

export const createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const existUser = await User.findOne({ email });
    if (existUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const encryptPassword = await bcryptjs.hash(password, 10);

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: encryptPassword,
    });

    const token = generateToken(newUser._id);

    newUser.password = undefined;

    logger.info("User created successfully:", newUser);

    res.status(201).json({ user: newUser, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
