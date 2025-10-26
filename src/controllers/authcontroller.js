import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asynchandler } from "../utils/async-handler.js";
import SendMail from "../utils/mail.js";
import EmailverificationMailgen from "../utils/mail.js";

const generate_Access_Refresh_Token = async (usreId) => {
  try {
    const user = await User.findOne(usreId);

    const AccesToken = await user.generate_access_token();
    const RefreshToken = await user.generate_refresh_token();

    // console.log("only refresh ", RefreshToken);

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
  const { email, password } = req.validation;

  if (!email || !password) {
    throw new ApiError(400, "email or password requierd!");
  }

  const existUser = await User.findOne({ email });

  if (!existUser) {
    throw new ApiError(400, "user doesn't exist!");
  }

  const { AccesToken, RefreshToken } = await generate_Access_Refresh_Token(
    existUser._id,
  );

  // console.log("acces token", AccesToken);
  // console.log("refresh token", RefreshToken);

  const isPasswordCorrect = await existUser.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "password incorrect!");
  }

  const loginuser = await User.findOne({ email }).select(
    "-password -refreshtoken -emailverificationToken -emailverificationexpiry",
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("accestokren", AccesToken, options)
    .cookie("refreshtokren", RefreshToken, options)
    .json(
      new ApiResponse(200, {
        message: "Logged in successful",
        loggeduser: loginuser,
        refreshtoken: RefreshToken,
        AccesToken: AccesToken,
      }),
    );
});

export const logoutusre = asynchandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,

    {
      $set: {
        refreshtoken: "",
      },
    },

    {
      new: true,
    },
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  const AccesToken = req.user.AccesToken;
  const refreshtoken = req.user.refreshtoken;
  return res
    .status(200)
    .clearCookie("accestokren", AccesToken, options)
    .clearCookie("refreshtokren", refreshtoken, options)
    .json(new ApiResponse(200, "Logout user successfull"));
});

export const getcurrentuser = asynchandler(async (req, res) => {
  res
    .status(200)
    .json(new ApiResponse(200, req.user, "get current user successfull!"));
});

export const verifyemail = asynchandler(async (req, res) => {
  const { verificationtoken } = req.params;

  const hashedtoken = crypto
    .createHash("sha256")
    .update(verificationtoken)
    .digest("hex");

  const usre = await User.findOne({
    emailverificationToken: hashedtoken,
    emailverificationexpiry: { gt: Date.now() },
  });

  if (!usre) {
    throw new ApiError(400, "emailverification not valid!");
  }

  ((usre.emailverificationexpiry = undefined),
    (usre.emailverificationToken = undefined),
    (usre.isEmailverified = true));
  await usre.validate({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, "email vreification successfull"));
});

export const resendemailverification = asynchandler(async (req, res) => {
  const user = await User.findOne(req.user._id);
  if (!user) {
    throw new ApiError(404, "usre not founf from emial resend verification");
  }
  if (user.isEmailverified) {
    throw new ApiError(404, "usre exist already!");
  }

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

  return res.status(200).json(200, "resend email verification successfull");
});

export const newrfereshtoken = asynchandler(async (req, res) => {
  const incomingrefreshtoken = req.cookie.refreshtoken || req.body.refreshtoken;

  if (!incomingrefreshtoken) {
    throw new ApiError(401, "unauthorized usre!");
  }

  try {
    const decodetoken = jwt.verify(
      incomingrefreshtoken,
      process.env.REFRESH_TOKEN_SECRET,
      process.env.REFRESH_TOKEN_EXPIRY,
    );

    const user = await User.findById(decodetoken?._id);
    if (user.refreshtoken !== decodetoken) {
      throw new ApiError(401, "refreh tokem is expired!");
    }

    const {AccesToken, RefreshToken} = await generate_Access_Refresh_Token(user._id)
    const options = {
      httpOnly : true,
      secure : true
    }

    user.refreshtoken = RefreshToken
    await user.save()

    res.status(200)
    .cookie("Refresh token is :",RefreshToken, options)
    .cookie("Access token is :",RefreshToken, options)
    .json(
      200, 
      "Access token totally refreshed!",
      {"Access toekn" : AccesToken},
      {"Refersh toekn" : RefreshToken}
    )
  } catch (error) {
    throw new ApiError(401, "invalid access token refreshed!")
  }
});

// export const verifyemail = asynchandler(async(req, res) => {})
