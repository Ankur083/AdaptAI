import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";


export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {

        const options = {
            httpOnly: true,
            secure: false
        }

        const token = req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "")

        if (!token) {
            return res
                .status(401)
                .clearCookie("accessToken", options)
                .clearCookie("refreshToken", options)
                .json({ message: "Unauthorized" });
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken._id).select("-password -refreshToken");

        if (!user) {
            // NEXT VIDEO -> discuss about frontend 
            throw new ApiError(401, "Invalid Access token");
        }

        req.user = user;
        next();

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access token");
    }


})
