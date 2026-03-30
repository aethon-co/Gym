import mongoose, { Schema, model, models } from "mongoose";

const expenseSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      enum: ["Rent", "Salary", "Utilities", "Equipment", "Maintenance", "Marketing", "Other"],
      default: "Other",
    },
    expenseDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

expenseSchema.index({ expenseDate: -1, category: 1 });

const Expense = models.Expense || model("Expense", expenseSchema);
export default Expense;
