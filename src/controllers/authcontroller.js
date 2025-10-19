import { User } from "../models/user.model.js";
import {ApiError} from '../utils/api-error.js'
import {ApiResponse} from '../utils/api-response.js'
import {asynchandler} from '../utils/async-handler.js'
import SendMail from '../utils/mail.js'

const generate_Access_Refresh_Token = async(usreId) => {
    
    try {
        const user = User.findOne({usreId})
        const AccesToken = user.generate_access_token()
        const RefreshToken = user.generate_refresh_token()


        user.refreshtoken = RefreshToken
        await user.save({validateBeforeSave : false})
        return {AccesToken, RefreshToken}
        
    } catch (error) {
        console.log("Error in accesing tokens :", error);
        throw new ApiError(400, {message : "problem in accessing tokens"}, [])
        
    }
}
export const Rgisteruser = asynchandler(async (req, res) => {
    const{ email, password, username, role } = req.body
    
  const exisusre = User.findOne({
        email
    })
    
    if(exisusre) throw new ApiError(409, {message: "user exist already !"}, [])

    const user = await User.create({
        email, 
        password, 
        username, 
        isEmailverified : false
    })


    console.log("usre is", user);
    
    const {unhashedtoken, hashedtoken, tokenexpiry} = user.generate_temporaray_token()

    const {AccesToken, RefreshToken} = generate_Access_Refresh_Token()

    user.emailverificationToken = hashedtoken
    user.emailverificationexpiry = tokenexpiry

    await user.save({validateBeforeSave: false})

    await SendMail({
        email : user?.email,
        subject : "Please verify your mail ",
        mailgenContent: EmailverificationMailgen(user.username, 
            `${req.protocol}://${req.get("host")}/api/v1/user/verify-email${unhashedtoken}`
        )
    })

   const createdUser =  await User
        .findById(user._id)
        .select("-password -refreshtoken -emailverificationToken -emailverificationexpiry")

    if(!createdUser) {
        throw new ApiError(500, "something went wrong while registering a user")
    }

    return res.status(200).json( new ApiResponse(200, {user : createdUser}, "user registerd successfull as well as verification successfull"))
})
