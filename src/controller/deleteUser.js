import User from "../model/user.js";
import logger from "../utils/logger.js";

export const deleteUser = async (req, res) => {
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
};
