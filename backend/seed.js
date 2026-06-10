/**
 * Seed script – inserts sample categories + products into MongoDB
 * Run: node seed.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Category = require("./models/Category");
const Product = require("./models/Product");

const MONGO_URI = process.env.MONGO_URI;

const categories = [
  { name: "Vegetables" },
  { name: "Fruits" },
  { name: "Grains" },
  { name: "Dairy" },
  { name: "Meat & Poultry" },
  { name: "Herbs & Spices" },
  { name: "Eggs" },
  { name: "Honey" },
];

const sampleProducts = [
  // Vegetables
  { title: "Tomatoes", description: "Fresh, ripe red tomatoes straight from the farm. Perfect for cooking and salads.", price: 120, unit: "kg", quantity: 200, category: "Vegetables", tags: ["tomatoes", "fresh", "vegetables"], isFeatured: true },
  { title: "Onions", description: "Freshly harvested onions with a strong flavour. Great for stews and frying.", price: 80, unit: "kg", quantity: 300, category: "Vegetables", tags: ["onions", "vegetables", "fresh"] },
  { title: "Carrots", description: "Sweet, crunchy carrots rich in vitamins. Ideal for juicing, soups, and salads.", price: 100, unit: "kg", quantity: 150, category: "Vegetables", tags: ["carrots", "vegetables", "healthy"] },
  { title: "Cabbage", description: "Large, fresh green cabbages. Perfect for stews, salads, and stir-fries.", price: 60, unit: "piece", quantity: 100, category: "Vegetables", tags: ["cabbage", "vegetables", "fresh"] },
  { title: "Potatoes", description: "Premium quality Irish potatoes, freshly harvested. Ideal for frying, boiling, and mashing.", price: 90, unit: "kg", quantity: 500, category: "Vegetables", tags: ["potatoes", "vegetables", "starch"], isFeatured: true },
  { title: "Kale (Sukuma Wiki)", description: "Fresh green kale leaves, a Kenyan staple vegetable. Nutritious and delicious.", price: 30, unit: "bunch", quantity: 200, category: "Vegetables", tags: ["kale", "sukuma", "vegetables", "greens"] },
  { title: "Spinach", description: "Tender spinach leaves, rich in iron and vitamins. Great for salads and cooking.", price: 40, unit: "bunch", quantity: 150, category: "Vegetables", tags: ["spinach", "vegetables", "greens", "healthy"] },

  // Fruits
  { title: "Mangoes", description: "Sweet and juicy Kenyan mangoes, handpicked at peak ripeness. A tropical delight.", price: 150, unit: "kg", quantity: 100, category: "Fruits", tags: ["mangoes", "fruits", "tropical", "sweet"], isFeatured: true },
  { title: "Bananas", description: "Fresh yellow bananas, naturally ripened. Perfect for breakfast and smoothies.", price: 50, unit: "bunch", quantity: 200, category: "Fruits", tags: ["bananas", "fruits", "tropical"] },
  { title: "Avocados", description: "Creamy Hass avocados freshly picked. Rich in healthy fats and nutrients.", price: 200, unit: "kg", quantity: 80, category: "Fruits", tags: ["avocados", "fruits", "healthy", "hass"] },
  { title: "Watermelon", description: "Large, sweet and refreshing watermelons. Perfect for hot days and parties.", price: 180, unit: "piece", quantity: 50, category: "Fruits", tags: ["watermelon", "fruits", "refreshing", "sweet"] },
  { title: "Passion Fruits", description: "Tangy and sweet passion fruits. Great for juicing and flavouring desserts.", price: 120, unit: "kg", quantity: 100, category: "Fruits", tags: ["passion fruit", "fruits", "juice", "tropical"] },

  // Grains
  { title: "Maize Flour (Unga)", description: "Finely milled white maize flour for making ugali and porridge. 2kg pack.", price: 160, unit: "2kg pack", quantity: 300, category: "Grains", tags: ["maize", "flour", "unga", "grains", "ugali"], isFeatured: true },
  { title: "Brown Rice", description: "Nutritious whole grain brown rice. Rich in fibre and essential minerals.", price: 220, unit: "kg", quantity: 200, category: "Grains", tags: ["rice", "brown rice", "grains", "healthy"] },
  { title: "Dry Beans", description: "High-quality dried beans, perfect for stews and soups. Protein-rich.", price: 130, unit: "kg", quantity: 250, category: "Grains", tags: ["beans", "grains", "protein", "legumes"] },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Create or find a demo farmer account
    let farmer = await User.findOne({ email: "farmer@agrilink.com" });
    if (!farmer) {
      const hashed = await bcrypt.hash("Farmer123!", 12);
      farmer = await User.create({
        name: "Demo Farmer",
        email: "farmer@agrilink.com",
        password: hashed,
        role: "farmer",
        farmName: "Green Valley Farm",
        farmDescription: "Fresh produce from our family farm.",
        farmLocation: "Nairobi, Kenya",
        isVerified: true,
      });
      console.log("👤 Demo farmer created: farmer@agrilink.com / Farmer123!");
    } else {
      console.log("👤 Demo farmer already exists");
    }

    // Create or find a demo admin account
    let admin = await User.findOne({ email: "admin@agrilink.com" });
    if (!admin) {
      const hashed = await bcrypt.hash("Admin123!", 12);
      admin = await User.create({
        name: "Admin User",
        email: "admin@agrilink.com",
        password: hashed,
        role: "admin",
        isVerified: true,
      });
      console.log("👤 Admin created: admin@agrilink.com / Admin123!");
    } else {
      console.log("👤 Admin already exists");
    }

    // Upsert categories
    const categoryMap = {};
    for (const cat of categories) {
      const slug = cat.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      const saved = await Category.findOneAndUpdate(
        { slug },
        { name: cat.name, slug },
        { upsert: true, new: true }
      );
      categoryMap[cat.name] = saved._id;
      console.log(`📂 Category: ${cat.name}`);
    }

    // Insert products (skip if title already exists for this farmer)
    let created = 0;
    for (const p of sampleProducts) {
      const exists = await Product.findOne({ title: p.title, farmer: farmer._id });
      if (exists) { console.log(`⏭  Skipped (exists): ${p.title}`); continue; }

      await Product.create({
        title: p.title,
        description: p.description,
        price: p.price,
        unit: p.unit,
        quantity: p.quantity,
        category: categoryMap[p.category],
        farmer: farmer._id,
        tags: p.tags || [],
        isFeatured: p.isFeatured || false,
        isActive: true,
        image: `https://placehold.co/400x400/16a34a/ffffff?text=${encodeURIComponent(p.title)}`,
        imagePublicId: "",
        rating: +(Math.random() * 1.5 + 3.5).toFixed(1),
        numReviews: Math.floor(Math.random() * 30),
        salesCount: Math.floor(Math.random() * 100),
      });
      console.log(`✅ Created: ${p.title}`);
      created++;
    }

    console.log(`\n🌱 Seeding complete! ${created} new products added.`);
    console.log("\nDemo accounts:");
    console.log("  Farmer: farmer@agrilink.com  /  Farmer123!");
    console.log("  Admin:  admin@agrilink.com   /  Admin123!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err.message);
    process.exit(1);
  }
}

seed();
