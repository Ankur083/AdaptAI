import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";

// if res not use in the code then you write in place of res -> _
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new ApiError(404, "User not found in token generation")
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken }

    } catch (error) {
        console.log("TOKEN ERROR:", error);
        throw new ApiError(500, "Something went wrong when generating access and refresh tokens");
    }
}


const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend 
    // validate user details(validation means - not empty)
    // check if user already exists : username or email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - creat entry in database
    // remove password and refresh token field from response
    // check for user creation
    // return response

    const { email, name, password } = req.body;
    // console.log("email:", email)
    // console.log("password:", password) 

    if (name === ""  || email === "" || password === "") {
        throw new ApiError(400, "All fields is required")
    }

    const existedUser = await User.findOne({
       email: email.toLowerCase(),
    })

    if (existedUser) {
        throw new ApiError(409, "User already exists with this email or username")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    // const coverImageLocalPath = req.files?.coverImage[0]?.path

    

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);


    console.log(avatar);

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    const user = await User.create({
        email,
        fullName:name,
        password,
        avatar: avatar.url,
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id);

    const options = {
        httpOnly: true,
        secure: false
    }

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong on registering user")
    }

    return res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                createdUser, accessToken, refreshToken
            },
            "User registered successfully"
        )
    )    

})


const loginUser = asyncHandler(async (req, res) => {
    // req.body -> data
    // username or email
    // find user in database with username or email
    // password check
    // access token and refresh token 
    // send cookie 

    const { email, password } = req.body;

    // console.log(email,password)

    if (! email) {
        throw new ApiError(400, "email is required")
    }

    const user = await User.findOne({email: email.toLowerCase()});

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }
    console.log(user)
    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }

    const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: false
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                loggedInUser, accessToken, refreshToken
            },
            "User logged in successfully"
        )
    )
})


const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        { 
            $set: { 
                refreshToken: null
            }
        }, 
        { 
            new: true 
        }
    )

    const options = {
        httpOnly: true,
        secure: false
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));   
})


const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken  = req.cookies?.refreshToken || req.body?.refreshToken;
    console.log(incomingRefreshToken)
    const options = {
            httpOnly: true,
            secure: false
        }

    if (!incomingRefreshToken) {
         return res
            .status(401)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json({
                success: false,
                message: "No refresh token. Please login again"
            });
    }
    console.log("COOKIES:", req.cookies);

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        
        const user = await User.findById(decodedToken?._id)
    
        if(!user){
             return res
                .status(401)
                .clearCookie("accessToken", options)
                .clearCookie("refreshToken", options)
                .json({
                    success: false,
                    message: "Invalid refresh token"
                });
        }
    
    
        if(user?.refreshToken !== incomingRefreshToken){
            return res
                .status(401)
                .clearCookie("accessToken", options)
                .clearCookie("refreshToken", options)
                .json({
                    success: false,
                    message: "Expired or invalid refresh token"
                });

        }
    
        
    
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    
                },
                "Access token refreshed successfully"
            )
        )   
    } catch (error) {
        return res
        .status(401)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json({
            success: false,
            message: "Session expired. Please login again"
        });
    }
})


const changeCurrentPassword = asyncHandler(async (req, res) => {

    const {oldPassword, newPassword} = req.body;
    
    if(!oldPassword || !newPassword){
        throw new ApiError(400, "Old password and new password is required")
    }

    const user = await User.findById(req.user?._id);

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if(!isPasswordCorrect){
        throw new ApiError(401, "Invalid Old password")
    }

    user.password = newPassword;

    await user.save({ validateBeforeSave: false });

    return res.status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})


const getCurrentUser = asyncHandler(async (req, res) => 
    
 res.status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"))
)


const updateAccountDetails = asyncHandler(async (req, res) => {
   
    const {fullName, email} = req.body;

    if(!fullName || !email){
        throw new ApiError(400, "All fields are required")
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email
            }
        },
        {new: true}
    ).select("-password")

    return res.status(200)
    .json(new ApiResponse(200, updatedUser, "Account details updated successfully"))
})

const updateUserAvatar = asyncHandler(async (req, res) => {

    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is Missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    
    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar")
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")

    return res.status(200)
    .json(new ApiResponse(200, updatedUser, "User avatar updated successfully"))    
})


const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(404, "User with this email does not exist");
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 mins
    await user.save({ validateBeforeSave: false });

    // Send email
    const frontendURL = process.env.CORS_ORIGIN || "http://localhost:3000";
    const resetURL = `${frontendURL}/reset-password/${resetToken}`;
    const message = `We received a request to reset your password. Please click the link below to set a new password:\n\n${resetURL}\n\nIf you did not request this, please ignore this email.`;

    if (!process.env.EMAIL_USERNAME || !process.env.EMAIL_PASSWORD) {
         console.warn(`[DEVELOPMENT MODE] Email credentials not found. Mocking the email functionality.`);
         console.warn(`[DEVELOPMENT MODE] Password reset link: ${resetURL}`);
         return res.status(200).json(new ApiResponse(200, {}, "Password reset link sent to your email (Mocked to Console)."));
    }

    try {
        await sendEmail({
            email: user.email,
            subject: "Password Reset Request",
            message
        });

        // Success - DO NOT RETURN TOKEN IN PAYLOAD
        return res.status(200).json(new ApiResponse(200, {}, "Password reset link sent to your email."));
    } catch (error) {
        console.error("\n Email sending failed. Google SMTP returned an error. Did you copy your App Password correctly?");
        console.error("error: ", error.message);
        
        // Return success functionally so the Frontend doesn't crash on a 500 Error
        return res.status(200).json(new ApiResponse(200, {}, "Email configuration failed"));
    }
});

const resetPassword = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
        throw new ApiError(400, "Token is invalid or has expired");
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.status(200).json(new ApiResponse(200, {}, "Password has been successfully changed"));
});

export { registerUser,
        loginUser,
        logoutUser, 
        refreshAccessToken, 
        changeCurrentPassword, 
        getCurrentUser,
        updateAccountDetails,
        updateUserAvatar,
        forgotPassword,
        resetPassword
    }