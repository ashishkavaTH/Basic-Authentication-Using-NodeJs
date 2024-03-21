import User from "../model/user.js";
import logger from "../utils/logger.js";

export const updateUser = async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (
      (firstName && firstName === checkUser.firstName) ||
      (lastName && lastName === checkUser.lastName) ||
      (email && email === checkUser.email)
    ) {
      return res.status(400).json({ error: "User fields are already updated" });
    }

    if (!firstName && !lastName && !email) {
      return res.status(400).json({ error: "At least one field is required" });
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
};
