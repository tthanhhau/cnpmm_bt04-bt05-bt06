const seedDatabase = require('../seeds/sampleData');

// Seed database endpoint
const seedData = async (req, res) => {
  try {
    console.log('🌱 Starting database seeding...');
    await seedDatabase();
    
    res.status(200).json({
      success: true,
      message: 'Database seeded successfully'
    });
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    res.status(500).json({
      success: false,
      message: 'Error seeding database',
      error: error.message
    });
  }
};

module.exports = {
  seedData
};