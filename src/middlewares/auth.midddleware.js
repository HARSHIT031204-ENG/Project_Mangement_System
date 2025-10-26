import { z } from "zod";
import { ApiError } from "../utils/api-error.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";


export const authvalidation = async (req, res, next) => {
  const Token = req.cookies?.accestokren.replace("accestokren=", "").replace("; Path=/; Secure; HttpOnly;", "") //|| req.header("Authorization");
//   console.log("acces token", Token);

  if (!Token) {
    throw new ApiError(401, "not accessible token !");
}

try {
    const decodetoken = jwt.verify(Token, process.env.ACCESS_TOKEN_SECRET)

    const user = await User.findById(decodetoken?._id).select(
        "-password -refreshtoken -emailverificationToken -emailverificationexpiry"
    )

    console.log("from auth middleawre ", user);
    if(!user){
        throw new ApiError(401, "unauthorized user ")
    }

    req.user = user
    next()
} catch (error) {
      throw new ApiError(401, "invalid token");
  }

};
