import mongoose from "mongoose";

const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  membershipType: {
    type: String,
    required: true,
    enum: ['Basic', 'Premium', 'Couple', 'Student'] 
  },
  subscriptionStartDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  subscriptionEndDate: {
    type: Date,
    required: true,
    default: function () {
      const startDate = this.subscriptionStartDate || new Date();
      return new Date(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate());
    }
  },
  status: {
    type: String,
    enum: ['Active', 'Expired', 'Suspended'],
    default: 'Active'
  },
  paymentAmount: {
    type: Number,
    required: true
  }
}, { timestamps: true });

memberSchema.virtual('isActive').get(function () {
  return this.status === 'Active' && this.subscriptionEndDate > new Date();
});

memberSchema.statics.findExpiredMemberships = function () {
  const today = new Date();
  return this.find({
    subscriptionEndDate: { $lt: today },
    status: { $ne: 'Expired' }
  });
};

const Member = mongoose.models.Member || mongoose.model("Member", memberSchema);
export default Member;
