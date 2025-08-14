    const generate = ()=>{
        const otp = Math.floor(Math.random() * 1000000);
        console.log(otp)
        return otp.toString()
    }
    
    module.exports = generate