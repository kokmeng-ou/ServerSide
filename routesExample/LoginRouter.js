import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'

import users from '../models/UserModel'

import { Router } from 'express'
const router = Router()

// Check login by email and compare password with bcryptjs
router.post('/login' , async function (req , res) {
    // Find Email in MongoDB
    const user = await users.findOne({ email: req.body.email })
    // If user does not existed, status (401) send ( 'Email not found' )
    if (!user) return res.status(401).send({ message: 'Email not found' })
    try {
        // compare password in mongodb
        const validPassword = await bcryptjs.compare(req.body.password, user.password)
        // if password doesn't match , status (400) send ('Invalid password')
        if (!validPassword) return res.status(402).send({ message: 'Invalid Password' })
        // jwt.sign is a method used in the JSON Web Token (JWT) library to create a new signed JWT token.
        // store _id in token , going to profile , decode and find byD _id
        const token = jwt.sign({ user: user}, process.env.ACCESS_TOKEN_SECRET)
        // send token to mongodb and front-end
        res.status(200).json({ token })
    } catch (e) {
        console.log(e)
        res.sendStatus(500)
    }
})

router.post('/login/reset-password' , async function (req , res) {
    try {
        // find user with the specified email
        const user = await users.findOne({ email: req.body.email })
        // if user doesn't existed , status (400) send ('User not found')
        if(!user) return res.status(404).send({ message: 'User not found' })
        // generate a reset token and send to email , token expires in 1h
        const resetToken = jwt.sign({ id: user._id }, process.env.JWT_TOKEN_SECRET, { expiresIn: '1h' } )
        // Save the reset token in the database
        await users.updateOne({ _id: user._id }, { $set: { resetToken: resetToken } })
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
            to: user.email,
            subject: 'Password Reset',
            text: `Use the following link to reset your password: http://localhost:3000/user/reset-password/${resetToken}`,
            html: `
            <p>
                Use the following link to reset your password: 
                <a href="http://localhost:3000/user/reset-password/${resetToken}">
                http://localhost:3000/user/reset-password/${resetToken}
                </a>
            </p>`
        });
        console.log('Message sent: %s', info.messageId, '/nPreview URL: %s', nodemailer.getTestMessageUrl(info));
        res.status(200).send({ message: 'Password reset email sent' });
    } catch (error) {
        res.status(500).send({message : 'Error sending password reset email 🙇‍♂️ 🙇‍♀️'})
    }
})

router.post('/login/reset-password/protected', async function (req , res) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1];
    // console.log(token);
    if (!token) {
      return res.status(401).json({ message: 'Authorization token is missing' });
    }
    const { password } = req.body; // get password from json
    // check input validation
    if(!password){
        return res.status(401).send({ message: 'Invalid password ⚠️' });
    }
    let decode
    try {
        decode = jwt.verify(token, process.env.JWT_TOKEN_SECRET)
    } catch (error) {
        return res.status(500).send({ message: 'Invalid token ⚠️ 500' });
    }        
    // Find the user with the specified email
    const user = await users.findOne({ _id: decode.id });
    // error if user == false , No user
    if(!user){
        return res.status(403).send({ message: 'User not found ⚠️' });
    }
    // check if the reset token is valid
    if(!user.resetToken || user.resetToken !== token){
        return res.status(402).send({ message: 'Invalid Token ⚠️' });
    }
    // generate the password to bcrypt
    // source code https://www.npmjs.com/package/bcryptjs
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);
    // update password bcrypt
    await users.updateOne(
        { _id: decode.id },
        { $set: { password: hashedPassword, resetToken: null } }
    );
    return res.status(200).send({ message: ` password update 🤗 ` })

})



module.exports = router;
