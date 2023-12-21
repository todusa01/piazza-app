const mongoose = require('mongoose')

const PostSchema = mongoose.Schema({
    title: {
        type:String,
        required:true
    },
    topics:{
        type:[String],
        required:true
    },
    timestamp:{
        type:Date,
       Default:Date.Now
    },
    messageBody:{
        type:String,
        required:true
    },
    expirationTime:{
        type:Date
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required:true
    },
    Status:{
        type:String,
        enum: ['Live', 'Expired'], 
        default: 'Live'
    },
    
    likes: {
        type: [String], 
        default: []
    },
    likeCount: {
        type: Number,
        default: 0
    },
    dislikes: {
        type: [String],
        default: []
    },
    dislikeCount: {
        type: Number,
        default: 0
    },
    comments: [{
        userId:String, 
        message:String
    }]
    
})

module.exports = mongoose.model('Post',PostSchema)