import mongoose, { Schema, model, models } from "mongoose";

const memberSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (email) {
          if (!email) return true;
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(email);
        },
        message: "Please provide a valid email address",
      },
      required: false,
    },
    phoneNumber: { type: String, required: true, unique: true, trim: true },
    address: { type: String, required: true, trim: true },
    membershipType: {
      type: String,
      enum: ["Basic", "Premium", "Couple", "Student", "Custom"],
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      enum: [1, 3, 6, 12],
      default: 1,
    },
    subscriptionStartDate: { type: Date, required: true },
    subscriptionEndDate: { type: Date, required: true },
    paymentAmount: { type: Number, required: true },
    customAmount: { type: Number, default: null },
    status: {
      type: String,
      enum: ["Active", "Expired", "Suspended"],
      default: "Active",
    },

    // 👇 New field
    fingerprintId: {
      type: Number,
      min: 1,
      max: 255,
      unique: true,
      sparse: true,
      set: (value: unknown) => {
        if (value === null || value === undefined || value === "") return undefined;
        const parsed = Number(value);
        return Number.isInteger(parsed) ? parsed : value;
      },
    },
    coupleGroupId: {
      type: String,
      default: null,
      index: true,
    },
    couplePartnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      default: null,
    },
  },
  { timestamps: true }
);

memberSchema.index({ fingerprintId: 1 });
memberSchema.index({ status: 1, subscriptionEndDate: 1 });
memberSchema.index({ coupleGroupId: 1, couplePartnerId: 1 });

memberSchema.pre("save", function (next) {
  if (
    this.isModified("duration") ||
    this.isModified("subscriptionStartDate") ||
    this.isNew
  ) {
    const endDate = new Date(this.subscriptionStartDate);
    endDate.setMonth(endDate.getMonth() + this.duration);
    this.subscriptionEndDate = endDate;
  }
  next();
});

memberSchema.pre("save", async function (next) {
  if (!this.isNew || this.fingerprintId) return next();

  const Member = mongoose.model("Member");

  const members = await Member.find({}, "fingerprintId").lean();
  const usedIds = new Set(members.map((m) => m.fingerprintId).filter(Boolean));

  for (let i = 1; i <= 255; i++) {
    if (!usedIds.has(i)) {
      this.fingerprintId = i;
      return next();
    }
  }

  return next(new Error("No available fingerprint IDs (1-255) left."));
});

memberSchema.methods.updateStatus = function () {
  const now = new Date();
  if (now > this.subscriptionEndDate) {
    this.status = "Expired";
  } else if (this.status === "Expired" && now <= this.subscriptionEndDate) {
    this.status = "Active";
  }
  return this.status;
};

memberSchema.statics.findActiveMembers = function () {
  return this.find({
    status: "Active",
    subscriptionEndDate: { $gte: new Date() },
  });
};

memberSchema.statics.findExpiredMembers = function () {
  return this.find({
    $or: [{ status: "Expired" }, { subscriptionEndDate: { $lt: new Date() } }],
  });
};

const Member = models.Member || model("Member", memberSchema);
export default Member;
