import { User } from "../models/user.model.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asynchandler } from "../utils/async-handler.js";
import SendMail from "../utils/mail.js";

const generate_Access_Refresh_Token = async (usreId) => {
  try {
    const user = await User.findOne(usreId);
    console.log("user is ", user);

    const AccesToken = await user.generate_access_token();
    const RefreshToken = await user.generate_refresh_token();

    user.refreshtoken = RefreshToken;
    await user.save({ validateBeforeSave: false });
    return { AccesToken, RefreshToken };
  } catch (error) {
    console.log("Error in accesing tokens :", error);
    throw new ApiError(400, { message: "problem in accessing tokens" }, []);
  }
};
export const Rgisteruser = asynchandler(async (req, res) => {
  const { email, username } = req.validation;
  const { password, role } = req.body;
  // console.log(password);

  const exisusre = await User.findOne({
    email,
  });

  if (exisusre) throw new ApiError(409, "user exist already !");

  const user = await User.create({
    email,
    password,
    username,
    isEmailverified: false,
  });

  // console.log("usre is", user);

  const { unhashedtoken, hashedtoken, tokenexpiry } =
    user.generate_temporaray_token();

  const { AccesToken, RefreshToken } = await generate_Access_Refresh_Token(
    user._id,
  );

  user.emailverificationToken = hashedtoken;
  user.emailverificationexpiry = tokenexpiry;

  await user.save({ validateBeforeSave: false });

  await SendMail({
    email: user?.email,
    subject: "Please verify your mail ",
    mailgenContent: EmailverificationMailgen(
      user.username,
      `${req.protocol}://${req.get("host")}/api/v1/user/verify-email${unhashedtoken}`,
    ),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshtoken -emailverificationToken -emailverificationexpiry",
  );

  if (!createdUser) {
    throw new ApiError(500, "something went wrong while registering a user");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: createdUser },
        "user registerd successfull as well as verification successfull",
      ),
    );
});

export const loginUser = asynchandler(async (req, res) => {
  const { email, password } = await req.body;

  if (!email || !password) {
    throw new ApiError(400, "email or password requierd!");
  }

  const existUser = await User.findOne({ email });
  if (!existUser) {
    throw new ApiError(400, "user doesn't exist!");
  }

  const { AccesToken, refreshtoken } = await generate_Access_Refresh_Token(
    existUser._id,
  );

  const isPasswordCorrect = await existUser.isPasswordCorrect(password);

  //    console.log(ispasswordcorrect);
  console.log("User hashed password:", existUser.password);
console.log("Entered password:", password);
console.log("Compare result:", isPasswordCorrect);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "password incorrect!");
  }

  const loginuser = await existUser
    .findOne({ email })
    .select(
      "-password -refreshtoken -emailverificationToken -emailverificationexpiry",
    );

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .send(200)
    .cookie("acces tokren", AccesToken, options)
    .cookie("refresh tokren", refreshtoken, options)
    .json(
      new ApiResponse(200, {
        message: "Logged in successful",
        loggeduser: loginuser,
        refreshtoken: refreshtoken,
        AccesToken: AccesToken,
      }),
    );
});
