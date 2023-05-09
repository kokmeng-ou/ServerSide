import jwt from 'jsonwebtoken'

// user model 
import contents from '../models/PostModel'

import { Router } from 'express'
const router = Router()

// get Content 
router.get('/content', async (req, res) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1];
    // console.log(token);
    if (!token) {
        return res.status(401).json({ message: 'Authorization token is missing' });
      }
    try {
        const content = await contents.find().populate('userId')
        if (!content || content.length === 0) return res.status(404).send({ message: 'No Content Found' })
        res.status(200).json({ response : content })
    } catch (err) {
        res.status(500).send({ message: 'Error Content' })
    }
})

router.get('/content/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const content = await contents.find({ _id: id }).populate('userId')
        if (!content || content.length === 0) return res.status(404).send({ message: 'No Content Found' })
        const Response = { response : content }
        res.status(200).json(Response)
    } catch (err) {
        res.status(500).send({ message: 'error content' })
    }
})

router.post('/content/addcontent', async (req, res) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1];
    // console.log(token);
    if (!token) {
      return res.status(401).json({ message: 'Authorization token is missing' });
    }
    let decode
    try {
        decode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        // console.log(decode);
        const content = await contents({ 
            userId : decode.user._id,
            title: req.body.title,
            content: req.body.content,
            tags: req.body.tag, // error cuz forgot s with tag 
            like: 0,
            postImage: req.body.Image
        })
        await content.save((err) => {
            if(err) {
                return res.status(401).send({ message: err.message })
            }
            res.status(200).json({ success: 'Content have been added' })
        })
    } catch (err) {
        return res.status(500).send({message: err.message})
    }
})

router.get('/search', async (req, res) => {
    //console.log(req.query); Testing
    //error with search space 
    //solution for vue 3 js https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
    //testing encodeURIComponent ( How%20to%20Master%20Design%20in%206%20Simple%20Steps )
    //solution for server https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/decodeURIComponent
    //decodeURIComponent(encodedURI)
    const contentTitle = decodeURIComponent(req.query.title)
    console.log(contentTitle);
    try {
        const content = await contents.findByContent(contentTitle) // in models contents
        if (!content) return req.status(404).send({ message: "An error occurred while searching" })
        const Response = { response : content }
        res.status(200).json(Response)
    } catch (err) {
        res.status(500).send({message: err.message})
    }
})

router.get('/tag/:title', async (req, res) => {
    try {
        const { title } = req.params
        const content = await contents.find({ tags: title }).populate('userId')
        if (!content) return res.status(400).send({ message: "Tag Not Found" })
        res.status(200).json({ response: content })
    } catch (err) {
        res.status(500).send({message: err.message})
    }
})

router.get('/user-post/', async (req, res) =>{
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1];
    // console.log(token);
    if (!token) {
      return res.status(401).json({ message: 'Authorization token is missing' });
    }
    try {
        const decode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const content = await contents.where({ userId: decode.user._id })
        if (content.length === 0) return res.status(404).send({ message: 'No Content Found' })
        res.status(200).json({ response: content })
    } catch (err) {
        res.status(500).send({message : err.message})
    }
})

module.exports = router;
