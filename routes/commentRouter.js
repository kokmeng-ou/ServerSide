import jwt from 'jsonwebtoken'

// model
import comments from '../models/commentModel'

// middleware
import authMiddleware from '../middleware/AuthMiddleware'

import { Router } from 'express'
const router = Router()

router.get('/:contentId', authMiddleware, async (req, res) =>{
    const { contentId } = req.params
    try {
        const comment = await comments.where({content : contentId }).populate('userId')
        if (comment.length === 0) return res.status(404).send({ message : 'No Content found' })
        return res.status(200).json({ comment: comment })
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
})

router.post('/:contentId/constituteComment', authMiddleware, async (req, res) => {
    if (!req.params.contentId) return res.status(400).send("Access denied. No content provided. 🥲")
    try {
        const comment = await comments({
            userId: req.user,
            content: req.params.contentId,
            text: req.body.text,
        })
        await comment.save((err) =>{
            if (err) return res.status(400).send(err);
            return res.status(200).json({ success: 'Successful Add' })
        })
    } catch (error) {
        return res.status(500).send({ message: error.message })
    }
})

module.exports = router