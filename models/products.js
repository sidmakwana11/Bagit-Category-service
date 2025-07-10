console.log("products route active: ");
const mongoose = require("mongoose");

const ProductsSchema = new mongoose.Schema({
    name : {type : String, required: true },
    description : {type : String, required: true },
    category : {type : String, required: true },
    price : {type : Number, required: true },
    quantity : {type: Number, require: true },
});

module.exports = mongoose.model("Products", ProductsSchema); 
 