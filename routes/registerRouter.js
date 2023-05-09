// import package
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import validator from 'validator'

// import models
import users from '../models/UserModel'
import saveTokens from '../models/SaveTokenModel'

import { Router } from 'express'
const router = Router()

//register
/*
using post method to fetch Email and Username from clientServer , set 1h for token and convert to token.
After convert to token , Then send email with token to user email ( http://website.name/${Token} ) 
router name ( /register )
*/

router.post('' , async function (req, res) {
    //var format = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    try {
        // Fetch email and username from client json
        const { email, username } = req.body
        // validation email Address learn from ( https://www.w3resource.com/javascript/form/email-validation.php )
        // check is match == true , 
        // or check email using validation from ( npm i validator )
        if (!validator.isEmail(email)) return res.status(400).json({ error: 'Invalid email address' })
        if (!username) return res.status(401).json({ error: 'Invalid Username' })
        // check if user in mongoDB ( NoSQL ) ? true || false === status 404.json ({ email is already Existed })
        const check_user = await users.findOne({ email: email })
        if (check_user) return res.status(404).send({ message: `This ${ email } already exited` })
        // if not email does not exited
        // create token can send it to email
        // https://www.youtube.com/watch?v=mbsmsi7l3r4&t=501s
        const registerToken = jwt.sign({email: email, username: username} , process.env.JWT_TOKEN_SECRET, { expiresIn: '1h' } )
        const saveToken = new saveTokens({ RegisterToken: registerToken })
        await saveToken.save();
        sendEmail(registerToken, email) 
        res.status(200).json({ message: 'Please check email to register your email 🤗' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
})

// Check Register Token if token valid or not
// which Token store in URL
// router name ( /register )
router.post('/setPassword', async (req , res) => {
    try {
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
        const { password } = req.body
        const saveToken = await saveTokens.findOne({ RegisterToken: token })
        if (!token) return res.status(400).send({ message: 'No token existed' })
        if (!password) return res.status(401).send({ message: 'Password is required' })
        if (!saveToken)  return res.status(402).send({ message: 'This Token does not exist' })
        const decodeRegister = jwt.verify(token, process.env.JWT_TOKEN_SECRET)
        const decodeSaveToken = jwt.verify(saveToken.RegisterToken, process.env.JWT_TOKEN_SECRET)
        if (decodeRegister.email !== decodeSaveToken.email) return res.status(403).send({ message: 'Invalid Token ⚠️' })
        else if (decodeRegister.email === decodeSaveToken.email) {
            if(setPassword(password, decodeSaveToken.username, decodeSaveToken.email , token))  return res.status(200).send({ Success: 'Successfully register' })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: error.message })
    }

})


// send email
async function sendEmail(registerToken, email) {
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
        from: '"Set-password" <han.suki46@gmail.com>', 
        to: email,
        subject: 'Set Password',
        text: `Use the following link to Set your password: http://localhost:8080/auth/register/${registerToken}/set-password`,
        html: `
        <p>
            Use the following link to Set your password: 
            <a href="http://localhost:8080/auth/register/${registerToken}/set-password">
            set-password link
            </a>
        </p>`
    });
    console.log('Message sent: %s', info.messageId, '/nPreview URL: %s', nodemailer.getTestMessageUrl(info));
}

// setPassword
async function setPassword (password, username, email, token ) {
    try {
        // Generate the password to bcrypt
        // source code https://www.npmjs.com/package/bcryptjs
        const salt = await bcryptjs.genSalt(10)
        const hashedPassword = await bcryptjs.hash(password, salt)
        const newUser = new users(
            { 
                username: username,
                email: email,
                password: hashedPassword
            }
        )
        await newUser.save();
        // Store use in mongodb
        await saveTokens.deleteOne(
            { RegisterToken: token }
        );
        return true
    } catch (error) {
        return false
    }
}

module.exports = router;