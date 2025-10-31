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
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const Payment = models.Payment || model("Payment", paymentSchema);
export default Payment;
