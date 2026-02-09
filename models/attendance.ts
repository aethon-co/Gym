import mongoose from "mongoose";


const attendanceSchema = new mongoose.Schema({
    memberId:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "Member",
        required:true,
    },
    date:{
        type:Date,
        required:true,
        default:Date.now
    },
    
},{timestamps:true})

attendanceSchema.index({ memberId: 1, date: -1 });
attendanceSchema.index({ date: -1 });


const Attendance = mongoose.models.Attendance || mongoose.model("Attendance",attendanceSchema);

export default Attendance;
