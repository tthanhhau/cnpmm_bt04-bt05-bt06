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
    }],
    views: {
      type: Number,
      default: 0,
      min: 0
    },
    sales: {
      type: Number,
      default: 0,
      min: 0
    },
    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
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
// slug index is already created by unique: true
productSchema.index({ featured: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'ratings.average': -1 });
productSchema.index({ views: -1 });
productSchema.index({ sales: -1 });
productSchema.index({ discountPercentage: -1 });

// Virtual for checking if product has discount
productSchema.virtual('hasDiscount').get(function() {
  return this.originalPrice && this.originalPrice > this.price;
});

// Virtual for calculating discount percentage
productSchema.virtual('calculatedDiscountPercentage').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return this.discountPercentage || 0;
});

// Ensure virtual fields are serialized
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);