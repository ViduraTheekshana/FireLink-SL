const mongoose = require("mongoose");
const Inventory = require("../models/Inventory");
require("dotenv").config({ path: "./config/config.env" });

const deleteOldItems = async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log("✅ Connected to MongoDB");

    const result = await Inventory.deleteMany({
      item_ID: { $gte: 2001, $lte: 2043 }
    });

    console.log(`✅ Deleted ${result.deletedCount} old items (2001-2043)`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

deleteOldItems();
