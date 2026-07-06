const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    accountType: {
      type: String,
      required: true,
      enum: ['customer', 'agent'],
      default: 'customer'
    },
    fullname: {
      type: String,
      trim: true
    },
    agencyName: {
      type: String,
      trim: true
    },
    licenseNumber: {
      type: String,
      trim: true
    },
    agencyId: {
      type: String,
      unique: true,
      sparse: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: {
      countryCode: {
        type: String,
        required: true
      },
      number: {
        type: String,
        required: true
      }
    },
    password: {
      type: String,
      required: true,
      select: false
    }
  },
  {
    timestamps: true
  }
);

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  if (this.accountType === 'agent' && !this.agencyId) {
    const rand = Math.floor(100000 + Math.random() * 900000);
    this.agencyId = `AGY-${rand}`;
  }

  next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
