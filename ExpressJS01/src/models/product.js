const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },
    description: { 
      type: String, 
      required: true, 
      trim: true 
    },
    price: { 
      type: Number, 
      required: true, 
      min: 0 
    },
    originalPrice: { 
      type: Number, 
      min: 0 
    },
    category: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Category', 
      required: true 
    },
    images: [{ 
      type: String 
    }],
    stock: { 
      type: Number, 
      required: true, 
      min: 0, 
      default: 0 
    },
    slug: { 
      type: String, 
      unique: true, 
      lowercase: true 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    featured: { 
      type: Boolean, 
      default: false 
    },
    ratings: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 }
    },
    tags: [{ 
      type: String, 
      trim: true 
    }]
  },
  { timestamps: true }
);

// Create slug from name before saving
productSchema.pre('save', function(next) {
  if (this.isModified('name') || this.isNew) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  }
  next();
});

// Also create slug before validation
productSchema.pre('validate', function(next) {
  if (this.name && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  }
  next();
});

// Index for efficient queries
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ slug: 1 });
productSchema.index({ featured: 1 });

module.exports = mongoose.model('Product', productSchema);