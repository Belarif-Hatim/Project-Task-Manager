const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//Generate jwt Token
const generateToken = (userId) => {
    return jwt.sign({id: userId}, process.env.JWT_SECRET, {expiresIn:"7d"});
};

//@desc Register a new user
//@route POST /api/auth/register
//@access publice

const registerUser = async ( req, res) => {
    try{
        const {name, email, password, profileImageUrl, adminInviteToken} = 
        req.body;

        //chech if user already exists
        const userExists = await User.findOne({email});
        if(userExists){
            return res.status(400).json({message: "User allready exists"});
        }
        //Determine user role :ADMIN IF CORRECT TOKEN PROVIDED, OTHERWISE member
        let role = "member";
        if(adminInviteToken &&adminInviteToken==process.env.ADMIN_INVITE_TOKEN
        ){
            role = "admin";
        }
        //hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(password, salt);

        //Create new user
        const user = await User.create({
            name,
            email,
            password:hashedPassword,
            profileImageUrl,
            role,
        });

        //Retern user data with jwt
        res.status(201).json({
            _id:user._id,
            name:user.name,
            email: user.email,
            role: user.role,
            profileImageUrl: user.profileImageUrl,
            token: generateToken(user._id),
        })
    }catch(error){
        res.status(500).json({message:"Serveur error", error:error.message});
    }
};

//@desc login user
//@route POST /api/auth/login
//@access publice

const loginUser = async ( req, res) => {
        try{
            const {email, password } = req.body;

            const user = await User.findOne({email});
            if(!user){
                return res.status(401).json({message: "Invalid email or password"});
            }

            // Compare password
            const isMath = await bcrypt.compare(password, user.password);
            if(!isMath){
                return res.status(401).json({message: "Invalid email or password"});
            }

            //return user data with JWT
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profileImageUrl: user.profileImageUrl,
                token: generateToken(user._id),
            });
        }catch(error){
        res.status(500).json({message:"Serveur error", error:error.message});
    }
};

//@desc Get user profile
//@route Get /api/auth/profile
//@access Private (Requires JWT)

const getUserProfile = async ( req, res) => {
        try{
            const user = await User.findById(req.user.id).select("-password");
            if(!user){
                return res.status(404).json({message:"User not found"});
            }
            res.json(user);
        }catch(error){
        res.status(500).json({message:"Serveur error", error:error.message});
    }
};

//@desc update user profile
//@route Get /api/auth/profile
//@access Private (Requires JWT)

const updateUserProfile = async ( req, res) => {
        try{
            const user = await User.findById(req.user.id);
            if(!user){
                return res.status(404).json({message:"User not found"});
            }

            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;

            if(req.body.password){
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(req.body.password, salt);
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                token: generateToken(updatedUser._id),
            });
        }catch(error){
        res.status(500).json({message:"Serveur error", error:error.message});
    }
};

module.exports = {registerUser, loginUser, getUserProfile, updateUserProfile};