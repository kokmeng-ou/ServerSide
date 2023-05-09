import { Router } from 'express'
import jwt from 'jsonwebtoken'

import users from '../models/UserModel'

const router = Router()

router.get('/anotheruser/:id', async (req, res) => {
    try {
        //Find the user with the specified _id 
        const user = await users.findById({ _id: req.params.id });
        
        res.status(200).json({ user : user })
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: error.message });
    }
})

router.get('/profile', async  (req, res) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1];
    // console.log(token);
    if (!token) {
        return res.status(401).json({ message: 'Authorization token is missing' });
    }
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        // console.log(decoded);
        const user = await users.findById({_id: decoded.user._id})
        // console.log(user._id);
        //const userJson = JSON.stringify(user)
        return res.status(200).json({response: user })
    } catch (err) {
        return res.status(500).send({message: err.message})
    }
})




module.exports = router