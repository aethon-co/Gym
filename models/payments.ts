import mongoose, { Schema, model, models } from "mongoose";

const paymentSchema = new Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "UPI", "Card", "BankTransfer"],
      default: "Cash",
    },
    duration: {
      type: Number,
      enum: [1, 3, 6, 12],
      default: 1,
    },
    coupleGroupId: {
      type: String,
      default: null,
      index: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

paymentSchema.index({ memberId: 1, createdAt: -1 });

const Payment = models.Payment || model("Payment", paymentSchema);
export default Payment;
