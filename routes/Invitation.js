import nodemailer from 'nodemailer'
import { Router } from 'express'
const router = Router()

router.get('/testing', (req, res) => {
    res.send(`This is a protected route`)
}),

router.post('/chat', async (req, res) => {
    const { title, email } = req.body
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com', 
        port: 465,
        secure: true,
        auth: {
            user: 'han.suki46@gmail.com', // example email
            pass: 'hnasfhguwovovbyf' // please don't steal password
        }
    })
    let info = await transporter.sendMail({ 
        from: '"Invitation" <han.suki46@gmail.com>', 
        to: email,
        subject: 'Invitation',
        text: `Your friend sending link to editor link: http://localhost:8080/editor/title/${title}`,
        html: `
        <p>
            Your friend sending link to editor link: 
            <a href="http://localhost:8080/editor/title/${title}">
            Invitation
            </a>
        </p>`
    })
    return res.send({ Message: 'Successful send Invitation' })
}),

module.exports = router