const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product is required'],
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },

    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },

    comment: {
      type: String,
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters'],
      default: '',
    },

    // Admin must approve before review shows publicly
    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ─── One review per user per product ────────────────────────────────────────
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// ─── After saving a review, update product average rating ───────────────────
reviewSchema.statics.updateProductRating = async function (productId) {
  const result = await this.aggregate([
    { $match: { product: productId, isApproved: true } },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        numReviews:    { $sum: 1 },
      },
    },
  ]);

  if (result.length > 0) {
    await mongoose.model('Product').findByIdAndUpdate(productId, {
      averageRating: parseFloat(result[0].averageRating.toFixed(1)),
      numReviews:    result[0].numReviews,
    });
  } else {
    await mongoose.model('Product').findByIdAndUpdate(productId, {
      averageRating: 0,
      numReviews:    0,
    });
  }
};

reviewSchema.post('save', function () {
  this.constructor.updateProductRating(this.product);
});

module.exports = mongoose.model('Review', reviewSchema);