import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import validator from 'validator'

import users from '../models/UserModel'

import { Router } from 'express'
const router = Router()

// using post method to fetch Email and Username from clientServer , set 1h for token and convert to token.
// After convert to token , Then send email with token to user email ( http://website.name/${Token} ) 
// router name ( /register )
router.post('/register', async function (req, res) { 
    //var format = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    try {
        const { email, username } = req.body // Fetch email and username from client json
        // validation email Address learn from ( https://www.w3resource.com/javascript/form/email-validation.php )
        // check is match == true , 
        // or check email using validation from ( npm i validator )
        if (!validator.isEmail(email)) {
            return res.status(400).json({ error: 'Invalid email address' });
        }
        if (!username) {
            return res.status(401).json({ error: 'Invalid Username' });
        }
        // Check if user in mongoDB ( NoSQL ), if not, status 404.json ({ email is already Existed })
        const check_user = await users.findOne({ email: email })
        if (check_user) {
            return res.status(404).json({ error: 'This Email already exited' });
        }
        // if not email does not exited
        // create token can send it to email
        // https://www.youtube.com/watch?v=mbsmsi7l3r4&t=501s
        // Create Token 
        const createNewToken = jwt.sign({email: email, username: username} , process.env.JWT_TOKEN_SECRET, { expiresIn: '1h' } )
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
            from: '"Confirm-Register" <han.suki46@gmail.com>', 
            to: email,
            subject: 'Confirm Register',
            text: `Use the following link to reset your password: http://localhost:3000/user/register/${createNewToken}`,
            html: `<p>Use the following link to enter your password: <a href="http://localhost:3000/user/register/${createNewToken}">http://localhost:3000/user/register/${createNewToken}</a></p>`
        });
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        res.status(200).json({ message: 'Please check email to register your email 🤗' })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message })
    }
})

// Check Register Token if token valid or not
// which Token store in URL
// router name ( /register )
router.post('/register/setPassword', async (req , res) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) res.status(400).json({ message: 'No token existed' })
    if (!req.body.password) res.status(401).json({ message: 'Password is required' })
    let decoded
    try {
        //Create decoded to Verify the token
        decoded = jwt.verify(token, process.env.JWT_TOKEN_SECRET)
        // Generate the password to bcrypt
        // source code https://www.npmjs.com/package/bcryptjs
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        // Store use in mongodb
        const newUser = new users({ username: decoded.username, email: decoded.email, password: hashedPassword  })
        await newUser.save();
        res.status(200).json({ Success: 'Successfully register' })
    } catch (error) {
        return res.status(404).json({ message: 'Invalid Token' })
    }
})

module.exports = router