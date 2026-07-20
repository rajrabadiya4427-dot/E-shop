require('dotenv').config(); // Load environment variables from .env
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const { User, Product } = require('./models');
const path = require('path');
// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false
}));
app.use(express.json());

// Serve uploaded images
const imgPath = process.env.NODE_ENV === 'production'
  ? path.join(__dirname, '..', 'frontend', 'dist', 'img')
  : path.join(__dirname, '..', 'frontend', 'public', 'img');
app.use('/img', express.static(imgPath));

app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.url}`);
  next();
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'An unexpected error occurred on the server',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Sync Database and Seed Data
const seedDatabase = async () => {
  try {
    console.log('Syncing initial products into MongoDB...');
    const productsData = [
        // Fashion
        {
          name: 'Premium Slim-Fit Denim Jacket',
          description: 'A classic denim jacket tailored for a modern slim fit, constructed from organic cotton denim with subtle vintage washing.',
          price: 79.99,
          category: 'Fashion',
          stock: 45,
          tag: 'trending'
        },
        {
          name: 'Minimalist Leather Sneakers',
          description: 'Clean silhouette sneakers made with full-grain calfskin leather, memory foam insoles, and natural rubber outsoles.',
          price: 129.99,
          category: 'Fashion',
          stock: 30,
          tag: 'none'
        },
        {
          name: 'Classic Linen Summer Shirt',
          description: 'Breathable, lightweight summer shirt made from 100% fine linen. Perfect for hot beach days or casual dining.',
          price: 45.00,
          category: 'Fashion',
          stock: 50,
          tag: 'new'
        },
        {
          name: 'Hooded Wool Blend Coat',
          description: 'Double-breasted heavyweight wool coat with a spacious lined hood, front slip pockets, and comfortable insulation.',
          price: 149.99,
          category: 'Fashion',
          stock: 15,
          tag: 'offer'
        },

        // Mobiles
        {
          name: 'Vertex Phone 15 Pro',
          description: 'Next-gen flagship smartphone featuring a 6.7-inch dynamic AMOLED display, triple lens 108MP camera, and a titanium frame.',
          price: 999.99,
          category: 'Mobiles',
          stock: 15,
          tag: 'trending'
        },
        {
          name: 'PocketFold Flip 4G',
          description: 'Ultra-compact folding phone with a seamless hinge mechanism, high-performance octa-core processor, and secondary outer screen.',
          price: 799.99,
          category: 'Mobiles',
          stock: 20,
          tag: 'offer'
        },
        {
          name: 'Aura Phone Lite 5G',
          description: 'Budget-friendly 5G phone offering a high-density IPS screen, expandable storage, and long-lasting 6000mAh battery cell.',
          price: 299.99,
          category: 'Mobiles',
          stock: 40,
          tag: 'new'
        },
        {
          name: 'Quantum Max Z',
          description: 'Ultra flagship packing a stylus, massive 1TB storage, liquid cooling chamber, and advanced satellite messaging capabilities.',
          price: 1199.99,
          category: 'Mobiles',
          stock: 10,
          tag: 'none'
        },

        // Electronics
        {
          name: 'Aura Pro Wireless Headphones',
          description: 'Active noise cancelling over-ear headphones with high-fidelity spatial audio, 40-hour battery life, and memory foam earcups.',
          price: 299.99,
          category: 'Electronics',
          stock: 25,
          tag: 'trending'
        },
        {
          name: 'VisionStream 4K Projector',
          description: 'Home theater cinematic smart projector with native 4K resolution, 2500 ANSI lumens, and integrated Dolby Atmos speakers.',
          price: 450.00,
          category: 'Electronics',
          stock: 12,
          tag: 'offer'
        },
        {
          name: 'SmartWatch Fit Series X',
          description: 'Amoled smart fitness watch with built-in GPS, multi-sport activity trackers, blood oxygen sensor, and notification sync.',
          price: 150.00,
          category: 'Electronics',
          stock: 35,
          tag: 'new'
        },
        {
          name: 'UltraSound Bar Pro',
          description: 'Slimline smart soundbar featuring wireless subwoofers, Dolby Digital surround sound, and integrated voice assistants.',
          price: 220.00,
          category: 'Electronics',
          stock: 20,
          tag: 'none'
        },

        // Beauty
        {
          name: 'Organic Rosehip Face Serum',
          description: 'Pure cold-pressed rosehip seed oil infused with Vitamin C and E to brighten skin tone, reduce fine lines, and hydrate deeply.',
          price: 24.50,
          category: 'Beauty',
          stock: 100,
          tag: 'offer'
        },
        {
          name: 'Elysian Woods Eau De Parfum',
          description: 'A sophisticated blend of cedarwood, soft amber, and white musk with top notes of bergamot and dry pear.',
          price: 85.00,
          category: 'Beauty',
          stock: 50,
          tag: 'trending'
        },
        {
          name: 'Charcoal Detox Face Mask',
          description: 'Activated charcoal mask blended with bentonite clay to extract blackheads, cleanse pores, and control excess sebum production.',
          price: 19.99,
          category: 'Beauty',
          stock: 75,
          tag: 'new'
        },
        {
          name: 'Coconut Hair Therapy Oil',
          description: 'Nourishing botanical formulation with pure coconut extracts to control hair frizz, treat split ends, and add vibrant shine.',
          price: 15.50,
          category: 'Beauty',
          stock: 80,
          tag: 'none'
        },

        // Home
        {
          name: 'Ultrasonic Essential Oil Diffuser',
          description: 'Handcrafted ceramic aromatherapy diffuser with ambient warm-light glow, automatic safety shutoff, and ultra-quiet misting.',
          price: 39.99,
          category: 'Home',
          stock: 60,
          tag: 'new'
        },
        {
          name: 'Waffle Turkish Cotton Towel Set',
          description: 'Loomed from 100% long-staple Turkish cotton. Set includes two bath towels, two hand towels, and two washcloths.',
          price: 55.00,
          category: 'Home',
          stock: 40,
          tag: 'none'
        },
        {
          name: 'Premium Ceramic Mug Set',
          description: 'Set of 4 hand-glazed ceramic mugs with unique speckled details, ergonomic comfortable handles, and microwave-safe build.',
          price: 28.00,
          category: 'Home',
          stock: 30,
          tag: 'offer'
        },
        {
          name: 'Smart LED Desk Lamp',
          description: 'Flexible neck table lamp with color temperature sliders, integrated Qi wireless charging dock, and auto-sleep timer settings.',
          price: 49.99,
          category: 'Home',
          stock: 25,
          tag: 'trending'
        },

        // Books
        {
          name: 'The Design of Everyday Things',
          description: 'The classic primer by cognitive scientist Don Norman on how design serves as the interface between technology and human behavior.',
          price: 18.99,
          category: 'Books',
          stock: 35,
          tag: 'none'
        },
        {
          name: 'Gourmet Alchemy Cookbook',
          description: 'An award-winning cookbook featuring 150 recipes explaining the chemistry, heritage, and techniques behind high culinary arts.',
          price: 32.50,
          category: 'Books',
          stock: 25,
          tag: 'offer'
        },
        {
          name: 'Zero to One (Startup Wisdom)',
          description: 'Legendary startup advice book written by billionaire investor Peter Thiel. Explains key techniques to innovate.',
          price: 15.99,
          category: 'Books',
          stock: 50,
          tag: 'trending'
        },
        {
          name: 'Sapiens: A Brief History',
          description: 'Yuval Noah Harari explores the history of humankind from the Stone Age to our modern technological future.',
          price: 22.00,
          category: 'Books',
          stock: 45,
          tag: 'new'
        },

        // Furniture
        {
          name: 'Mid-Century Lounge Chair',
          description: 'Premium walnut plywood shell upholstered in top-grain aniline leather, supported by a heavy-duty swivel aluminum base.',
          price: 599.99,
          category: 'Furniture',
          stock: 8,
          tag: 'trending'
        },
        {
          name: 'Solid Oak Writing Desk',
          description: 'Sturdy home office desk crafted from FSC-certified solid European oak, featuring built-in cable management and two drawers.',
          price: 349.99,
          category: 'Furniture',
          stock: 10,
          tag: 'none'
        },
        {
          name: 'Scandinavian Coffee Table',
          description: 'Elegant walnut veneer circular coffee table supported by three minimalist tapered oak legs. Easy screw-in assembly.',
          price: 180.00,
          category: 'Furniture',
          stock: 15,
          tag: 'offer'
        },
        {
          name: 'Ergonomic Mesh Office Chair',
          description: 'High-back desk chair featuring pneumatic gas lifters, synchronous tilt locks, adjustable headrests and dense mesh support.',
          price: 240.00,
          category: 'Furniture',
          stock: 22,
          tag: 'new'
        }
      ];

    for (const pData of productsData) {
      await Product.findOneAndUpdate(
        { name: pData.name },
        { ...pData, image_url: '' },
        { upsert: true, new: true }
      );
    }
    console.log('Initial products synchronized successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "..", "frontend", "dist")));

  app.get("*any",(req,res)=>{
    res.sendFile(path.resolve(__dirname, "../frontend", "dist", "index.html"));
  })

}


// Initialize server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // seed database with initial records
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Database connection or server startup failed:', error);
    process.exit(1);
  }
};

startServer();
