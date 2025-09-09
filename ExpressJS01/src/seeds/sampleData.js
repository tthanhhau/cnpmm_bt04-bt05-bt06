const mongoose = require('mongoose');
const Category = require('../models/category');
const Product = require('../models/product');

const sampleCategories = [
  {
    name: 'Electronics',
    description: 'Electronic devices and gadgets',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400'
  },
  {
    name: 'Clothing',
    description: 'Fashion and apparel',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400'
  },
  {
    name: 'Books',
    description: 'Books and educational materials',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400'
  },
  {
    name: 'Home & Garden',
    description: 'Home improvement and garden supplies',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400'
  },
  {
    name: 'Sports',
    description: 'Sports equipment and accessories',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'
  }
];

const sampleProducts = [
  // Electronics (20 products)
  {
    name: 'Tai nghe Bluetooth không dây',
    description: 'Tai nghe không dây chất lượng cao với khử tiếng ồn',
    price: 1990000,
    originalPrice: 2490000,
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'],
    stock: 50,
    featured: true,
    tags: ['wireless', 'bluetooth', 'audio', 'tai nghe'],
    views: 1250,
    sales: 45,
    ratings: { average: 4.5, count: 123 }
  },
  {
    name: 'iPhone 15 Pro Max',
    description: 'Điện thoại thông minh cao cấp với camera tiên tiến và nhiều tính năng',
    price: 29990000,
    originalPrice: 34990000,
    images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400'],
    stock: 30,
    featured: true,
    tags: ['smartphone', 'mobile', 'technology', 'iphone', 'apple'],
    views: 2890,
    sales: 78,
    ratings: { average: 4.8, count: 234 }
  },
  {
    name: 'Laptop Gaming MSI',
    description: 'Laptop hiệu suất cao cho công việc và chơi game',
    price: 25990000,
    images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400'],
    stock: 20,
    tags: ['laptop', 'computer', 'gaming', 'msi'],
    views: 1890,
    sales: 23,
    ratings: { average: 4.3, count: 89 }
  },
  {
    name: 'Chuột không dây Logitech',
    description: 'Chuột không dây tiện dụng với độ chính xác cao',
    price: 790000,
    originalPrice: 990000,
    images: ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400'],
    stock: 120,
    tags: ['mouse', 'wireless', 'computer', 'chuột', 'logitech'],
    views: 890,
    sales: 156,
    ratings: { average: 4.2, count: 67 }
  },
  {
    name: 'Bàn phím cơ Gaming RGB',
    description: 'Bàn phím cơ RGB với switch tactile cho game thủ',
    price: 2190000,
    images: ['https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400'],
    stock: 80,
    tags: ['keyboard', 'mechanical', 'gaming', 'bàn phím', 'rgb'],
    views: 1456,
    sales: 89,
    ratings: { average: 4.6, count: 145 }
  },
  {
    name: '4K Monitor',
    description: '27-inch 4K UHD monitor with HDR support',
    price: 399.99,
    images: ['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400'],
    stock: 25,
    featured: true,
    tags: ['monitor', '4k', 'display']
  },
  {
    name: 'Webcam HD',
    description: '1080p HD webcam with auto-focus',
    price: 79.99,
    images: ['https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400'],
    stock: 60,
    tags: ['webcam', 'hd', 'streaming']
  },
  {
    name: 'Bluetooth Speaker',
    description: 'Portable bluetooth speaker with deep bass',
    price: 89.99,
    originalPrice: 119.99,
    images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400'],
    stock: 90,
    tags: ['speaker', 'bluetooth', 'portable']
  },
  {
    name: 'Smart Watch',
    description: 'Fitness tracking smartwatch with heart rate monitor',
    price: 249.99,
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'],
    stock: 40,
    featured: true,
    tags: ['smartwatch', 'fitness', 'wearable']
  },
  {
    name: 'Tablet 10-inch',
    description: '10-inch tablet with stylus support',
    price: 329.99,
    images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400'],
    stock: 35,
    tags: ['tablet', 'stylus', 'portable']
  },
  {
    name: 'Wireless Charger',
    description: 'Fast wireless charging pad for smartphones',
    price: 39.99,
    images: ['https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400'],
    stock: 150,
    tags: ['charger', 'wireless', 'fast']
  },
  {
    name: 'USB-C Hub',
    description: '7-in-1 USB-C hub with HDMI and card readers',
    price: 59.99,
    images: ['https://images.unsplash.com/photo-1625842268584-8f3296236761?w=400'],
    stock: 100,
    tags: ['usb-c', 'hub', 'adapter']
  },
  {
    name: 'Gaming Headset',
    description: '7.1 surround sound gaming headset with microphone',
    price: 129.99,
    images: ['https://images.unsplash.com/photo-1599669454699-248893623440?w=400'],
    stock: 70,
    tags: ['headset', 'gaming', 'surround']
  },
  {
    name: 'Portable SSD',
    description: '1TB portable SSD with USB-C connectivity',
    price: 149.99,
    originalPrice: 199.99,
    images: ['https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400'],
    stock: 55,
    tags: ['ssd', 'storage', 'portable']
  },
  {
    name: 'Action Camera',
    description: '4K action camera with waterproof case',
    price: 199.99,
    images: ['https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400'],
    stock: 30,
    featured: true,
    tags: ['camera', '4k', 'waterproof']
  },
  {
    name: 'Drone with Camera',
    description: 'Quadcopter drone with 4K camera and GPS',
    price: 599.99,
    images: ['https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400'],
    stock: 15,
    tags: ['drone', 'camera', 'gps']
  },
  {
    name: 'Smart Home Hub',
    description: 'Voice-controlled smart home hub',
    price: 99.99,
    images: ['https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400'],
    stock: 45,
    tags: ['smart home', 'voice control', 'hub']
  },
  {
    name: 'Power Bank 20000mAh',
    description: 'High-capacity power bank with fast charging',
    price: 49.99,
    images: ['https://images.unsplash.com/photo-1609592713154-0f1b2e8e1c1d?w=400'],
    stock: 200,
    tags: ['power bank', 'portable', 'fast charging']
  },
  {
    name: 'VR Headset',
    description: 'Virtual reality headset with controllers',
    price: 299.99,
    originalPrice: 399.99,
    images: ['https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=400'],
    stock: 20,
    featured: true,
    tags: ['vr', 'virtual reality', 'gaming']
  },
  {
    name: 'Electric Toothbrush',
    description: 'Smart electric toothbrush with app connectivity',
    price: 79.99,
    images: ['https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=400'],
    stock: 80,
    tags: ['toothbrush', 'electric', 'smart']
  },

  // Clothing (15 products)
  {
    name: 'Classic Cotton T-Shirt',
    description: 'Comfortable cotton t-shirt in various colors',
    price: 24.99,
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'],
    stock: 100,
    tags: ['t-shirt', 'cotton', 'casual']
  },
  {
    name: 'Denim Jeans',
    description: 'Classic blue denim jeans with perfect fit',
    price: 79.99,
    images: ['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400'],
    stock: 75,
    featured: true,
    tags: ['jeans', 'denim', 'casual']
  },
  {
    name: 'Hoodie Sweatshirt',
    description: 'Warm and comfortable hoodie for cold days',
    price: 59.99,
    images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400'],
    stock: 90,
    tags: ['hoodie', 'sweatshirt', 'warm']
  },
  {
    name: 'Summer Dress',
    description: 'Light and breezy summer dress',
    price: 49.99,
    originalPrice: 69.99,
    images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400'],
    stock: 60,
    tags: ['dress', 'summer', 'light']
  },
  {
    name: 'Business Shirt',
    description: 'Professional business shirt for office wear',
    price: 39.99,
    images: ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400'],
    stock: 120,
    tags: ['shirt', 'business', 'formal']
  },
  {
    name: 'Sports Jacket',
    description: 'Lightweight sports jacket for active lifestyle',
    price: 89.99,
    images: ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400'],
    stock: 45,
    featured: true,
    tags: ['jacket', 'sports', 'active']
  },
  {
    name: 'Casual Sneakers',
    description: 'Comfortable casual sneakers for everyday wear',
    price: 69.99,
    images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400'],
    stock: 80,
    tags: ['sneakers', 'casual', 'comfortable']
  },
  {
    name: 'Winter Coat',
    description: 'Warm winter coat with insulation',
    price: 149.99,
    originalPrice: 199.99,
    images: ['https://images.unsplash.com/photo-1544966503-7cc5ac882d5e?w=400'],
    stock: 30,
    tags: ['coat', 'winter', 'warm']
  },
  {
    name: 'Polo Shirt',
    description: 'Classic polo shirt for casual and semi-formal occasions',
    price: 34.99,
    images: ['https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400'],
    stock: 110,
    tags: ['polo', 'shirt', 'casual']
  },
  {
    name: 'Yoga Pants',
    description: 'Flexible yoga pants for workout and leisure',
    price: 44.99,
    images: ['https://images.unsplash.com/photo-1506629905587-4028f60bbe35?w=400'],
    stock: 95,
    tags: ['yoga', 'pants', 'flexible']
  },
  {
    name: 'Baseball Cap',
    description: 'Adjustable baseball cap with logo',
    price: 19.99,
    images: ['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400'],
    stock: 150,
    tags: ['cap', 'baseball', 'adjustable']
  },
  {
    name: 'Leather Belt',
    description: 'Genuine leather belt with metal buckle',
    price: 29.99,
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400'],
    stock: 85,
    tags: ['belt', 'leather', 'accessory']
  },
  {
    name: 'Silk Scarf',
    description: 'Elegant silk scarf for style and warmth',
    price: 39.99,
    images: ['https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400'],
    stock: 70,
    featured: true,
    tags: ['scarf', 'silk', 'elegant']
  },
  {
    name: 'Running Shorts',
    description: 'Moisture-wicking running shorts',
    price: 24.99,
    images: ['https://images.unsplash.com/photo-1506152983158-b4a74a01c721?w=400'],
    stock: 100,
    tags: ['shorts', 'running', 'moisture-wicking']
  },
  {
    name: 'Formal Blazer',
    description: 'Professional blazer for business meetings',
    price: 129.99,
    images: ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400'],
    stock: 40,
    tags: ['blazer', 'formal', 'business']
  },

  // Books (10 products)
  {
    name: 'JavaScript Programming Guide',
    description: 'Complete guide to modern JavaScript programming',
    price: 39.99,
    images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400'],
    stock: 40,
    tags: ['programming', 'javascript', 'education']
  },
  {
    name: 'Web Development Handbook',
    description: 'Essential handbook for web developers',
    price: 49.99,
    images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'],
    stock: 35,
    featured: true,
    tags: ['web development', 'programming', 'handbook']
  },
  {
    name: 'Python for Beginners',
    description: 'Learn Python programming from scratch',
    price: 29.99,
    images: ['https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400'],
    stock: 60,
    tags: ['python', 'programming', 'beginners']
  },
  {
    name: 'Data Science Essentials',
    description: 'Comprehensive guide to data science and analytics',
    price: 59.99,
    originalPrice: 79.99,
    images: ['https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400'],
    stock: 25,
    tags: ['data science', 'analytics', 'statistics']
  },
  {
    name: 'React.js Cookbook',
    description: 'Practical recipes for React development',
    price: 44.99,
    images: ['https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400'],
    stock: 45,
    tags: ['react', 'javascript', 'frontend']
  },
  {
    name: 'Machine Learning Basics',
    description: 'Introduction to machine learning concepts',
    price: 54.99,
    images: ['https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400'],
    stock: 30,
    featured: true,
    tags: ['machine learning', 'ai', 'algorithms']
  },
  {
    name: 'Database Design Fundamentals',
    description: 'Learn database design and optimization',
    price: 42.99,
    images: ['https://images.unsplash.com/photo-1554475901-4538ddfbccc2?w=400'],
    stock: 35,
    tags: ['database', 'sql', 'design']
  },
  {
    name: 'Mobile App Development',
    description: 'Guide to iOS and Android app development',
    price: 47.99,
    images: ['https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400'],
    stock: 40,
    tags: ['mobile', 'ios', 'android']
  },
  {
    name: 'Cloud Computing Guide',
    description: 'Understanding cloud platforms and services',
    price: 52.99,
    images: ['https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400'],
    stock: 28,
    tags: ['cloud', 'aws', 'azure']
  },
  {
    name: 'Cybersecurity Handbook',
    description: 'Protect your digital assets and data',
    price: 49.99,
    images: ['https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400'],
    stock: 32,
    featured: true,
    tags: ['cybersecurity', 'security', 'protection']
  },

  // Home & Garden (10 products)
  {
    name: 'Indoor Plant Collection',
    description: 'Beautiful indoor plants for home decoration',
    price: 29.99,
    images: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400'],
    stock: 60,
    tags: ['plants', 'indoor', 'decoration']
  },
  {
    name: 'Smart LED Bulbs',
    description: 'Wi-Fi enabled color-changing LED bulbs',
    price: 39.99,
    originalPrice: 59.99,
    images: ['https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=400'],
    stock: 120,
    tags: ['led', 'smart', 'lighting']
  },
  {
    name: 'Coffee Maker',
    description: 'Programmable coffee maker with thermal carafe',
    price: 89.99,
    images: ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400'],
    stock: 35,
    featured: true,
    tags: ['coffee', 'maker', 'kitchen']
  },
  {
    name: 'Air Purifier',
    description: 'HEPA air purifier for clean indoor air',
    price: 149.99,
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'],
    stock: 25,
    tags: ['air purifier', 'hepa', 'clean air']
  },
  {
    name: 'Garden Tool Set',
    description: 'Complete set of essential garden tools',
    price: 79.99,
    images: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400'],
    stock: 40,
    tags: ['garden', 'tools', 'set']
  },
  {
    name: 'Vacuum Cleaner',
    description: 'Cordless stick vacuum with multiple attachments',
    price: 199.99,
    originalPrice: 249.99,
    images: ['https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400'],
    stock: 30,
    tags: ['vacuum', 'cordless', 'cleaning']
  },
  {
    name: 'Kitchen Scale',
    description: 'Digital kitchen scale with precise measurements',
    price: 24.99,
    images: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400'],
    stock: 80,
    tags: ['scale', 'kitchen', 'digital']
  },
  {
    name: 'Throw Pillows Set',
    description: 'Decorative throw pillows for living room',
    price: 34.99,
    images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400'],
    stock: 90,
    tags: ['pillows', 'decorative', 'living room']
  },
  {
    name: 'Humidifier',
    description: 'Ultrasonic humidifier for better air quality',
    price: 59.99,
    images: ['https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400'],
    stock: 50,
    featured: true,
    tags: ['humidifier', 'ultrasonic', 'air quality']
  },
  {
    name: 'Picture Frames Set',
    description: 'Elegant picture frames for family photos',
    price: 19.99,
    images: ['https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400'],
    stock: 100,
    tags: ['frames', 'pictures', 'family']
  },

  // Sports (10 products)
  {
    name: 'Yoga Mat Premium',
    description: 'High-quality non-slip yoga mat with carrying strap',
    price: 34.99,
    images: ['https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400'],
    stock: 80,
    tags: ['yoga', 'mat', 'exercise']
  },
  {
    name: 'Running Shoes',
    description: 'Comfortable running shoes for all terrains',
    price: 129.99,
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'],
    stock: 45,
    featured: true,
    tags: ['running', 'shoes', 'sports']
  },
  {
    name: 'Dumbbell Set',
    description: 'Adjustable dumbbell set for home workouts',
    price: 199.99,
    originalPrice: 249.99,
    images: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'],
    stock: 20,
    tags: ['dumbbell', 'weights', 'fitness']
  },
  {
    name: 'Basketball',
    description: 'Official size basketball for indoor and outdoor play',
    price: 29.99,
    images: ['https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400'],
    stock: 60,
    tags: ['basketball', 'sports', 'ball']
  },
  {
    name: 'Tennis Racket',
    description: 'Professional tennis racket with grip tape',
    price: 89.99,
    images: ['https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400'],
    stock: 35,
    tags: ['tennis', 'racket', 'sports']
  },
  {
    name: 'Resistance Bands',
    description: 'Set of resistance bands for strength training',
    price: 19.99,
    images: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'],
    stock: 120,
    featured: true,
    tags: ['resistance', 'bands', 'training']
  },
  {
    name: 'Cycling Helmet',
    description: 'Lightweight cycling helmet with ventilation',
    price: 49.99,
    images: ['https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400'],
    stock: 70,
    tags: ['helmet', 'cycling', 'safety']
  },
  {
    name: 'Swimming Goggles',
    description: 'Anti-fog swimming goggles with UV protection',
    price: 14.99,
    images: ['https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400'],
    stock: 150,
    tags: ['goggles', 'swimming', 'uv protection']
  },
  {
    name: 'Fitness Tracker',
    description: 'Water-resistant fitness tracker with heart rate monitor',
    price: 79.99,
    images: ['https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400'],
    stock: 85,
    tags: ['fitness', 'tracker', 'heart rate']
  },
  {
    name: 'Skateboard Complete',
    description: 'Complete skateboard setup ready to ride',
    price: 69.99,
    originalPrice: 89.99,
    images: ['https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400'],
    stock: 40,
    featured: true,
    tags: ['skateboard', 'complete', 'ride']
  }
];

const seedDatabase = async () => {
  try {
    // Clear existing data
    await Category.deleteMany({});
    await Product.deleteMany({});
    
    console.log('Existing data cleared');

    // Insert categories one by one to trigger pre hooks
    const categories = [];
    for (const categoryData of sampleCategories) {
      const category = new Category(categoryData);
      await category.save();
      categories.push(category);
    }
    console.log(`${categories.length} categories created`);

    // Assign categories to products and insert
    const categoryMap = {
      'Electronics': categories.find(c => c.name === 'Electronics')._id,
      'Clothing': categories.find(c => c.name === 'Clothing')._id,
      'Books': categories.find(c => c.name === 'Books')._id,
      'Home & Garden': categories.find(c => c.name === 'Home & Garden')._id,
      'Sports': categories.find(c => c.name === 'Sports')._id
    };

    const productsWithCategories = sampleProducts.map((product, index) => {
      let categoryName;
      if (index < 20) categoryName = 'Electronics';        // 0-19: Electronics (20 products)
      else if (index < 35) categoryName = 'Clothing';       // 20-34: Clothing (15 products)
      else if (index < 45) categoryName = 'Books';          // 35-44: Books (10 products)
      else if (index < 55) categoryName = 'Home & Garden';  // 45-54: Home & Garden (10 products)
      else categoryName = 'Sports';                         // 55-64: Sports (10 products)

      return {
        ...product,
        category: categoryMap[categoryName]
      };
    });

    // Insert products one by one to trigger pre hooks
    const products = [];
    for (const productData of productsWithCategories) {
      const product = new Product(productData);
      await product.save();
      products.push(product);
    }
    console.log(`${products.length} products created`);

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

module.exports = seedDatabase;

// Run seeding if this file is executed directly
if (require.main === module) {
  require('dotenv').config();
  const connectDB = require('../config/connectDB');
  
  connectDB(process.env.MONGODB_URI)
    .then(() => seedDatabase())
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}