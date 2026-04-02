import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    image: {
      type: String,
    },
    phone: {
      type: String,
    },
    city: {
      type: String,
    },
    address: {
      type: String, // Complete Address
    },
    landmark: {
      type: String,
    },
    savedAddresses: {
      type: [
        new mongoose.Schema(
          {
            id: { type: String, required: true },
            label: { type: String, default: '' },
            recipientName: { type: String, default: '' },
            phone: { type: String, default: '' },
            city: { type: String, default: '' },
            address: { type: String, default: '' },
            landmark: { type: String, default: '' },
            isDefault: { type: Boolean, default: false },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    forceLogoutAt: {
      type: Date,
    },
    wishlist: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User || mongoose.model('User', UserSchema);
