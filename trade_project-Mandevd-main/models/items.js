const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const itemSchema = new Schema({
    category: {type: String, required: [true, 'Category is required']},
    title: {type: String, required: [true, 'Product Name is required']},
    author: {type: Schema.Types.ObjectId, ref:'User'},
    director: {type: String, required: [true, 'Director Name is required']},
    content: {type: String, required: [true, 'Content is required'], 
            minLength: [10, 'The content should have at least 10 characters']},
    image: {type: String, required: [true, 'Image is required']},
    status: {type: String, required: [true, 'Status is required']},
    offerId: {type: Schema.Types.ObjectId, ref: 'Offer'},
    watchBy: {type: Array, default: []}
},
{timestamps: true}
)

module.exports = mongoose.model('Item', itemSchema);


