// import package
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'

// import models
import users from '../models/UserModel'
import saveTokens from '../models/SaveTokenModel'

import { Router } from 'express'
const router = Router()

// Login
/*
When user login by email and password 
server need to check password with bcryptjs
Take Information ({ id }) and convert to token
and send token , as well as ({ name , email , image }) to the client-side,
save Token to LoginToken
*/
router.post('', async function(req, res) {
    // Find User Email with request body == json inside MongoDB
    const { email, password } = req.body
    const user = await users.findOne({ email: email })
    // check user, If user ? true || false, if does not existed, status (401) send ( 'Email not found' )
    if (!user) return res.status(404).send({ message: `This ${ email } not found` })
    try {
        // when check email === true , compare password
        const validPassword = await bcryptjs.compare(password, user.password)
        // if password doesn't match ({{ validPassword ? true || false }}), status (400) send ('Invalid password')
        if (!validPassword) return res.status(402).send({ message: 'Invalid Password' })
        // jwt.sign is a method used in the JSON Web Token (JWT) library to create a new signed JWT token.
        // store _id in token , going to profile , decode and find byD _id
        const token = jwt.sign({ id: user._id}, process.env.ACCESS_TOKEN_SECRET)
        // save Token to LoginToken to check if token exist   
        await users.updateOne(
            { _id : user._id },
            { $set: { loginToken: token } }
        )
        // const saveToken = new saveTokens({ loginToken: token })
        // await saveToken.save();
        // send token to client with status 200
        const SendRequest = {
            token : token,
            name: user.username,
            email: user.email,
            image: user.UserImage,
        }
        res.status(200).json({ respond: SendRequest })
    } catch (error) {
        res.status(500).send({ message: error })
    }
})

// Logout
router.post('/logout', async (req, res) => {
    try {
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
        if (!token) return res.status(401).json({ message: 'Token is missing 😵' })
        // Find the user with the specified token
        const user = await users.findOne({ loginToken: token })
        // const saveToken = await saveTokens.findOne({ loginToken : token })
        // error if user ? true || false
        // if ( !user && !saveToken ) return res.status(403).send({ message: 'Please Provide Correct Token ⚠️' })
        if ( !user ) return res.status(403).send({ message: 'Please Provide Correct Token ⚠️' })
        // const decodeSaveToken = jwt.verify(saveToken.loginToken, process.env.ACCESS_TOKEN_SECRET)
        // if (decodeLogin.loginToken === decodeSaveToken.loginToken){
        if (user.loginToken === token){
            await saveTokens.deleteOne(
                { loginToken: user.loginToken }
            )
            /*
            await users.updateOne(
                { _id : decodeLogin.id },
                { $set: { loginToken: null } }
            )
            */
            return res.status(200).send({ message: 'Successful Logout 🥰 ' })
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({ message : 'Error With Logout 🙇‍♂️ 🙇‍♀️'})
    }
})

// ( reset-password ) Send Request To email 
// Client send email as json , check if email exist ( true || false)
// if email exist send reset-password to email a long with token number

router.post('/reset-password', async function (req, res) {
    try {
        // find user with the specified email
        const { email } = req.body
        const user = await users.findOne({ email : email })
        // check user, If user ? true || false, if does not existed, status (401) send ( 'Email not found' )
        if(!user) return res.status(404).send({ message: `Sorry , ${ email } does not exist 😰` })
        // generate a reset token ( { user._id, (generate random number{ Math.random }) })and send to email , token expires in 1h
        const random = Math.random()
        const resetToken = jwt.sign({ id: user._id, number: random }, process.env.JWT_TOKEN_SECRET, { expiresIn: '1h' } )
        // save the reset token to resetToken 
        const saveToken = new saveTokens({ ResetPasswordToken: resetToken })
        await saveToken.save();
        // update user reset-token
        await users.updateOne({ _id: user._id }, { $set: { resetToken: resetToken } })
        sendEmail(resetToken, email)
        return res.status(200).send({ message: 'Password reset email sent' })
    } catch (error) {
        console.log(error)
        return res.status(500).send({ message : 'Error sending password reset email 🙇‍♂️ 🙇‍♀️'})
    }
})

// Input Password
router.post('/reset-password/protected', async function (req, res){
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token is missing 😵' });
    const { password } = req.body // get password from json
    // check password validation
    if (!password) return res.status(401).send({ message: 'Invalid password ⚠️' });
    try {
        // Find the user with the specified token
        const user = await users.findOne({ resetToken: token });
        // error if user ? true || false
        if ( !user ) return res.status(403).send({ message: 'Please Provide Correct Token ⚠️' })
        const saveToken = await saveTokens.findOne({ ResetPasswordToken: token });
        // error if saveToken ? true || false
        if ( !saveToken ) return res.status(404).send({ message: 'Please Provide Correct Token ⚠️' })
        const decodeLogin = jwt.verify(user.resetToken, process.env.JWT_TOKEN_SECRET)
        const decodeSaveToken = jwt.verify(saveToken.ResetPasswordToken, process.env.JWT_TOKEN_SECRET)
        console.log(decodeLogin.exp)
        console.log(Math.floor(Date.now() / 1000))
        // check if the reset token is valid 
        if ( decodeSaveToken.number !== decodeLogin.number) return res.status(402).send({ message: 'Invalid Token ⚠️' })
        else if ( decodeSaveToken.number === decodeLogin.number){
            if(UpdatePassword(password, decodeLogin.id, token)) return res.status(200).send({ message: ` password update 🤗 ` })
        }
    } catch (e) {
        console.log(e)
        return res.status(500).send({ e }) 
    }
})

// send email
async function sendEmail(resetToken, email) {
    // send the reset password to user email
    // source code ( https://www.npmjs.com/package/nodemailer )
    // error and solution ( // https://www.youtube.com/watch?v=MJhsVDpYzQs )
    let transporter = nodemailer.createTransport({ // 
        host: 'smtp.gmail.com', // error read this (https://support.google.com/mail/answer/7126229?p=BadCredentials&visit_id=636943772581505122-3298699215&rd=2#cantsignin&zippy=%2Ci-cant-sign-in-to-my-email-client%2Ctoo-many-simultaneous-connections-error%2Csecurity-certificate-cn-error%2Cmy-email-client-is-crashing-or-emails-are-taking-too-long-to-download%2Cstep-check-that-imap-is-turned-on%2Cstep-change-smtp-other-settings-in-your-email-client)
        port: 465,
        secure: true,
        auth: {
            user: 'han.suki46@gmail.com', // example email
            pass: 'hnasfhguwovovbyf' // please don't steal password
        }
    });
    let info = await transporter.sendMail({ 
        from: '"Reset-password" <han.suki46@gmail.com>', 
        to: email, // user = email .
        subject: 'Password Reset',
        text: `Use the following link to reset your password: http://localhost:3000/user/reset-password/${resetToken}`,
        html: `
        <p>
            Use the following link to reset your password: 
            <a class="btn" href="http://localhost:8080/auth/forget-password/${resetToken}/set-New-password">
            Reset-Password
            </a>
        </p>`
    });
    console.log('Message sent: %s', info.messageId, '/nPreview URL: %s', nodemailer.getTestMessageUrl(info));
}

async function UpdatePassword(password, id,token) {
    // generate the password to bcrypt
    // source code https://www.npmjs.com/package/bcryptjs
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);
    // update password bcrypt
    await users.updateOne(
        { _id: id },
        { $set: { password: hashedPassword, resetToken: null } }
    );
    await saveTokens.deleteOne(
        { ResetPasswordToken: token }
    );
    return true
}

module.exports = router;