const otpgen = require('../utils/otpGenerator')
const prisma = require('../config/prisma/client')
const Joi = require('joi')

const aadhaarSchema = Joi.string()
  .pattern(/^[2-9][0-9]{11}$/)
  .required()
  .messages({
    'string.pattern.base': 'Aadhaar number must be exactly 12 digits and start with digits 2–9.',
    'string.empty': 'Aadhaar number is required.',
    'any.required': 'Aadhaar number is required.'
  });
const panSchema = Joi.string()
  .pattern(/^[A-Z]{5}[0-9]{4}[A-Z]$/)
  .required()
  .messages({
    'string.pattern.base': 'PAN number must be 10 characters: 5 uppercase letters, 4 digits, followed by 1 uppercase letter.',
    'string.empty': 'PAN number is required.',
    'any.required': 'PAN number is required.'
  });


const addharverify = async(req,res,next)=>{
    const {adharID, fullName} = req.body
    if(!adharID || !fullName){
        return res.status(400).json({message : "Addhar Number and Full Name are Required"})
    }
    const { error } = aadhaarSchema.validate(adharID);
    if(error){
        return res.status(400).json({message : error.details[0].message})
    }
    const duplicate = await prisma.user.findUnique({
        where : {adharID}
    })
    if(duplicate && duplicate.status === "verified"){
        return res.status(409).json({message : "User Already Registered"})
    }
    const otp = otpgen()
    if(duplicate && duplicate.status === "draft"){
        await prisma.user.update({
            where : {adharID},
            data : {otp : otp}
        }).then(()=>{
            return res.status(201).json({
                message: "You are already registerd but Un-verified",
                otp : otp
            })
        }).catch(()=>{
            return res.status(500).json("Somthing Went Wrong")
        })
    }
    try{
        const newUser = await prisma.user.create({
            data : {
                adharID, 
                otp,
                fullName
            }
        })
        if(newUser){
            return res.status(200).json({id : newUser.id,
                otp : otp,
                message : "Done"}
            )
        }
        else{
            return res.status(404).json({message:"Something Went Wrong"})
        }
    }
    catch(err){
        console.log("Error while saving to DB", err)
        return res.status(500).json({message: "Internal Server Error"})
    }


}

const otpValidation = async(req,res,next)=>{
    const { userId, otp } = req.body;
    if(!userId){
        return res.status(400).json({ message: "User Not Found" });
    }

    try{
        const user = await prisma.user.findUnique({
            where: { adharID: userId }
        });

        if(!user){
            return res.status(404).json({ message: "Unauthorized access" });
        }

        if(user.otp === otp){
            await prisma.user.update({
                where: { adharID: userId },
                data: {
                    otp: null,
                    status: "verified"
                }
            });
            return res.status(200).json({ message: "OTP Verified" });
        } else {
            return res.status(400).json({ message: "Invalid OTP" });
        }
    }
    catch(err){
        console.log(err)
        return res.status(500).json({message: "Internal Server Error"})
    }
}

const panVerify = async(req,res,next)=>{
    const {pan, adharID} = req.body
    if(!pan || !adharID){
        return res.status(400).json({message : "Please Provide the Required Field"})
    }
    const { error } = panSchema.validate(pan);
        if(error){
            return res.status(400).json({message : error.details[0].message})
    }
    try{
        const user = await prisma.user.findUnique({
            where : {adharID}
        })
        if(!user){
            return res.status(404).json({message : "User Not Found"})
        }
        const duplicate = await prisma.user.findFirst({
            where: { pan }
        });

        if(duplicate){
            return res.status(409).json({message: "Pan Card Already Exists"})
        }
        await prisma.user.update({
            where : {adharID},
            data : {
                pan : pan
            }
        }).then(()=>{
            return res.status(200).json({
                message : "User Updated Sucessfully",
                id : user.id,
                fullName : user.fullName,
                adharID : adharID
            })
        })
        .catch((err)=>{
            return res.status(500).json({message : "Something Went Wrong"})
        })
    }
    catch(err){
        return res.status(500).json({message : "Something Went Wrong"})
    }
}
module.exports = {addharverify, otpValidation, panVerify}