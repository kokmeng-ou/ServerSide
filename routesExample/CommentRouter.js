import jwt from 'jsonwebtoken'

import comments from '../models/commentModel'

import { Router } from 'express'
const router = Router()

router.get('/:contentID', async (req, res) =>{
    const { contentID } = req.params
    try {
        const comment = await comments.where({content : contentID }).populate('userId')
        if (comment.length === 0) return res.status(404).send({ message : 'No Content found' })
        return res.status(200).json({ comment: comment })
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
})

router.post('/:contentID/comment', async (req, res) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(400).send("Access denied. No token provided. 🥲")
    if (!req.params.contentID) return res.status(400).send("Access denied. No content provided. 🥲")
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const comment = await comments({
            userId: decoded.user._id,
            content: req.params.contentID,
            text: req.body.text,
        })
        await comment.save((err) =>{
            if (err) {
                return res.status(400).send(err);
              }
              return res.status(200).json({ success: 'Successful Add' });
        })
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
})

module.exports = router