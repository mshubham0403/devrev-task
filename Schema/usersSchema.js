import mongoose from "mongoose";

const userSchema =mongoose.Schema({
    email :{type :String, required :true,unique:true},
    password :{type :String, required:true},
    
})
const userDb = mongoose.model('userDb',userSchema);
export default userDb;