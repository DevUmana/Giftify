import User from "../models/User.js";

const cleanDB = async (): Promise<void> => {
  try {
    await User.deleteMany({});
    console.log("Course collection cleaned.");
  } catch (err) {
    console.error("Error cleaning collections:", err);
    process.exit(1);
  }
};

export default cleanDB;
