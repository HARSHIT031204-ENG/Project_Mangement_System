import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from 'crypto'


const userSchema = new Schema(
  {
    avatar: {
      type: {
        url: String,
        localpath: String,
      },
      default: {
        url: `http://placehold.co/200x200`,
        localpath: "",
      },
    },
    name: {
      type: String,
      index: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "email is required "],
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullname: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
    forgotPasswordToken: {
      type: String,
    },
    forgotPasswordexpiry: {
      type: Date,
    },
    emailverificationToken: {
      type: String,
    },
    emailverificationexpiry: {
      type: Date,
    },
    isEmailverified: {
      type: Boolean,
      default: false,
    },
    refreshtoken: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);


userSchema.methods.generate_access_token = function () {
  return jwt.sign(
    {
      _id : this._id,
      email : this.email,
      username : this.username
    },
    process.env.ACCESS_TOKEN_SECRET,
    {expiresIn : process.env.ACCESS_TOKEN_EXPIRY}
  )
}
userSchema.methods.generate_refresh_token = function () {
  return jwt.sign(
    {
      _id : this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {expiresIn : process.env.REFRESH_TOKEN_EXPIRY}
  )
}
userSchema.methods.generate_temporaray_token = function () {
  const unhashedtoken = crypto.randomBytes(20).toString('hex')
  const hashedtoken = crypto.createHash('sha256').update(unhashedtoken).digest('hex')
  const tokenexpiry = Date.now() + 20*60*1000   // 20 minutes 

  return {unhashedtoken, hashedtoken, tokenexpiry}

}

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
export const User = mongoose.model("User", userSchema);
