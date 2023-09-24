import mongoose from "mongoose";

const productSchema =new mongoose.Schema({
    product_id:{type:String ,unique:true},
    stock : {type:Number}
});

const productDb = mongoose.model('productDb',productSchema);
export default productDb;