const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const usersSchema = mongoose.Schema({
    username: {
        type:String,
        required:true
    },
    email:{
        type:String,
        unique: true,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        Default: Date.Now
    }
});

// Hash the password before saving
usersSchema.pre('save', async function (next) {
    const users = this;
    if (users.isModified('password') || users.isNew) {
      const hash = await bcrypt.hash(users.password, 10);
      users.password = hash;
    }
    next();
});

  // Add a method to compare passwords
usersSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
  };

  module.exports = mongoose.model('Users',usersSchema)