import express from "express";
import auth from "../middleware/auth.js";
import {
  validateCreateUser,
  validateLoginUser,
  validateUpdateUser,
} from "../validation/userValidation.js";
import { createUser, loginUser } from "../controller/createUser.js";
import { updateUser } from "../controller/updateUser.js";
import { deleteUser } from "../controller/deleteUser.js";
import { getUser, getUsers } from "../controller/getUsers.js";

const router = express.Router();

router.post("/users", validateCreateUser, createUser);

router.post("/login", validateLoginUser, loginUser);

router.patch("/users/:id", validateUpdateUser, updateUser);

router.get("/users", getUsers);

router.get("/users/:id", getUser);

router.get("/dashboard", auth, (req, res) => {
  console.log("The Dashboard is working");
});

router.delete("/users/:id", deleteUser);

export default router;
