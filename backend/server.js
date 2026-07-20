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
  crossOriginResourcePolicy: false // Allows loading external Unsplash images if requested in frontend
}));
app.use(express.json());
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
    // Seed Initial Products
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('Seeding initial products into MongoDB...');
      const productsData = [
        // Fashion
        {
          name: 'Premium Slim-Fit Denim Jacket',
          description: 'A classic denim jacket tailored for a modern slim fit, constructed from organic cotton denim with subtle vintage washing.',
          price: 79.99,
          category: 'Fashion',
          image_url: '/IMGS/Premium Slim-Fit Denim Jacket.jpg',
          stock: 45,
          tag: 'trending'
        },
        {
          name: 'Minimalist Leather Sneakers',
          description: 'Clean silhouette sneakers made with full-grain calfskin leather, memory foam insoles, and natural rubber outsoles.',
          price: 129.99,
          category: 'Fashion',
          image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80',
          stock: 30,
          tag: 'none'
        },
        {
          name: 'Classic Linen Summer Shirt',
          description: 'Breathable, lightweight summer shirt made from 100% fine linen. Perfect for hot beach days or casual dining.',
          price: 45.00,
          category: 'Fashion',
          image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80',
          stock: 50,
          tag: 'new'
        },
        {
          name: 'Hooded Wool Blend Coat',
          description: 'Double-breasted heavyweight wool coat with a spacious lined hood, front slip pockets, and comfortable insulation.',
          price: 149.99,
          category: 'Fashion',
          image_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
          stock: 15,
          tag: 'offer'
        },

        // Mobiles
        {
          name: 'Vertex Phone 15 Pro',
          description: 'Next-gen flagship smartphone featuring a 6.7-inch dynamic AMOLED display, triple lens 108MP camera, and a titanium frame.',
          price: 999.99,
          category: 'Mobiles',
          image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
          stock: 15,
          tag: 'trending'
        },
        {
          name: 'PocketFold Flip 4G',
          description: 'Ultra-compact folding phone with a seamless hinge mechanism, high-performance octa-core processor, and secondary outer screen.',
          price: 799.99,
          category: 'Mobiles',
          image_url: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=600&q=80',
          stock: 20,
          tag: 'offer'
        },
        {
          name: 'Aura Phone Lite 5G',
          description: 'Budget-friendly 5G phone offering a high-density IPS screen, expandable storage, and long-lasting 6000mAh battery cell.',
          price: 299.99,
          category: 'Mobiles',
          image_url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80',
          stock: 40,
          tag: 'new'
        },
        {
          name: 'Quantum Max Z',
          description: 'Ultra flagship packing a stylus, massive 1TB storage, liquid cooling chamber, and advanced satellite messaging capabilities.',
          price: 1199.99,
          category: 'Mobiles',
          image_url: 'https://images.unsplash.com/photo-1565849906660-7e7229f39088?auto=format&fit=crop&w=600&q=80',
          stock: 10,
          tag: 'none'
        },

        // Electronics
        {
          name: 'Aura Pro Wireless Headphones',
          description: 'Active noise cancelling over-ear headphones with high-fidelity spatial audio, 40-hour battery life, and memory foam earcups.',
          price: 299.99,
          category: 'Electronics',
          image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
          stock: 25,
          tag: 'trending'
        },
        {
          name: 'VisionStream 4K Projector',
          description: 'Home theater cinematic smart projector with native 4K resolution, 2500 ANSI lumens, and integrated Dolby Atmos speakers.',
          price: 450.00,
          category: 'Electronics',
          image_url: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?auto=format&fit=crop&w=600&q=80',
          stock: 12,
          tag: 'offer'
        },
        {
          name: 'SmartWatch Fit Series X',
          description: 'Amoled smart fitness watch with built-in GPS, multi-sport activity trackers, blood oxygen sensor, and notification sync.',
          price: 150.00,
          category: 'Electronics',
          image_url: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=600&q=80',
          stock: 35,
          tag: 'new'
        },
        {
          name: 'UltraSound Bar Pro',
          description: 'Slimline smart soundbar featuring wireless subwoofers, Dolby Digital surround sound, and integrated voice assistants.',
          price: 220.00,
          category: 'Electronics',
          image_url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80',
          stock: 20,
          tag: 'none'
        },

        // Beauty
        {
          name: 'Organic Rosehip Face Serum',
          description: 'Pure cold-pressed rosehip seed oil infused with Vitamin C and E to brighten skin tone, reduce fine lines, and hydrate deeply.',
          price: 24.50,
          category: 'Beauty',
          image_url: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=600&q=80',
          stock: 100,
          tag: 'offer'
        },
        {
          name: 'Elysian Woods Eau De Parfum',
          description: 'A sophisticated blend of cedarwood, soft amber, and white musk with top notes of bergamot and dry pear.',
          price: 85.00,
          category: 'Beauty',
          image_url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=600&q=80',
          stock: 50,
          tag: 'trending'
        },
        {
          name: 'Charcoal Detox Face Mask',
          description: 'Activated charcoal mask blended with bentonite clay to extract blackheads, cleanse pores, and control excess sebum production.',
          price: 19.99,
          category: 'Beauty',
          image_url: 'https://images.unsplash.com/photo-1567894340315-735d7c361db0?auto=format&fit=crop&w=600&q=80',
          stock: 75,
          tag: 'new'
        },
        {
          name: 'Coconut Hair Therapy Oil',
          description: 'Nourishing botanical formulation with pure coconut extracts to control hair frizz, treat split ends, and add vibrant shine.',
          price: 15.50,
          category: 'Beauty',
          image_url: 'https://images.unsplash.com/photo-1626015713026-d837d172406f?auto=format&fit=crop&w=600&q=80',
          stock: 80,
          tag: 'none'
        },

        // Home
        {
          name: 'Ultrasonic Essential Oil Diffuser',
          description: 'Handcrafted ceramic aromatherapy diffuser with ambient warm-light glow, automatic safety shutoff, and ultra-quiet misting.',
          price: 39.99,
          category: 'Home',
          image_url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80',
          stock: 60,
          tag: 'new'
        },
        {
          name: 'Waffle Turkish Cotton Towel Set',
          description: 'Loomed from 100% long-staple Turkish cotton. Set includes two bath towels, two hand towels, and two washcloths.',
          price: 55.00,
          category: 'Home',
          image_url: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=600&q=80',
          stock: 40,
          tag: 'none'
        },
        {
          name: 'Premium Ceramic Mug Set',
          description: 'Set of 4 hand-glazed ceramic mugs with unique speckled details, ergonomic comfortable handles, and microwave-safe build.',
          price: 28.00,
          category: 'Home',
          image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
          stock: 30,
          tag: 'offer'
        },
        {
          name: 'Smart LED Desk Lamp',
          description: 'Flexible neck table lamp with color temperature sliders, integrated Qi wireless charging dock, and auto-sleep timer settings.',
          price: 49.99,
          category: 'Home',
          image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80',
          stock: 25,
          tag: 'trending'
        },

        // Books
        {
          name: 'The Design of Everyday Things',
          description: 'The classic primer by cognitive scientist Don Norman on how design serves as the interface between technology and human behavior.',
          price: 18.99,
          category: 'Books',
          image_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80',
          stock: 35,
          tag: 'none'
        },
        {
          name: 'Gourmet Alchemy Cookbook',
          description: 'An award-winning cookbook featuring 150 recipes explaining the chemistry, heritage, and techniques behind high culinary arts.',
          price: 32.50,
          category: 'Books',
          image_url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=600&q=80',
          stock: 25,
          tag: 'offer'
        },
        {
          name: 'Zero to One (Startup Wisdom)',
          description: 'Legendary startup advice book written by billionaire investor Peter Thiel. Explains key techniques to innovate.',
          price: 15.99,
          category: 'Books',
          image_url: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80',
          stock: 50,
          tag: 'trending'
        },
        {
          name: 'Sapiens: A Brief History',
          description: 'Yuval Noah Harari explores the history of humankind from the Stone Age to our modern technological future.',
          price: 22.00,
          category: 'Books',
          image_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
          stock: 45,
          tag: 'new'
        },

        // Furniture
        {
          name: 'Mid-Century Lounge Chair',
          description: 'Premium walnut plywood shell upholstered in top-grain aniline leather, supported by a heavy-duty swivel aluminum base.',
          price: 599.99,
          category: 'Furniture',
          image_url: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=600&q=80',
          stock: 8,
          tag: 'trending'
        },
        {
          name: 'Solid Oak Writing Desk',
          description: 'Sturdy home office desk crafted from FSC-certified solid European oak, featuring built-in cable management and two drawers.',
          price: 349.99,
          category: 'Furniture',
          image_url: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=600&q=80',
          stock: 10,
          tag: 'none'
        },
        {
          name: 'Scandinavian Coffee Table',
          description: 'Elegant walnut veneer circular coffee table supported by three minimalist tapered oak legs. Easy screw-in assembly.',
          price: 180.00,
          category: 'Furniture',
          image_url: 'https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&w=600&q=80',
          stock: 15,
          tag: 'offer'
        },
        {
          name: 'Ergonomic Mesh Office Chair',
          description: 'High-back desk chair featuring pneumatic gas lifters, synchronous tilt locks, adjustable headrests and dense mesh support.',
          price: 240.00,
          category: 'Furniture',
          image_url: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=600&q=80',
          stock: 22,
          tag: 'new'
        }
      ];

      await Product.insertMany(productsData); // Insert all 28 products
      console.log('Initial products seeded successfully!');
    }
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
