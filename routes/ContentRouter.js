import jwt from 'jsonwebtoken'
// model 
import contents from '../models/PostModel'

// middleware
import authMiddleware from '../middleware/AuthMiddleware'

import { Router } from 'express'
const router = Router()

// fetch testing with middleware
router.get('/testing',authMiddleware, (req, res) => {
    res.send(`This is a protected route ${ req.user}`)
})

// fetch content from mongoose 
router.get('', authMiddleware, async (req, res) => {
    try {
        const content = await contents.find().populate('userId')
        if (!content || content.length === 0) return res.status(404).send({ message: 'No Content Found' })
        const contentArray = []
        content.forEach((element) => {
            contentArray.push(constituteContent(element))
        })
        return res.status(200).send({ response: contentArray })
    } catch (error) {
        return res.status(500).send({ message: error.message })
    }
})

router.get('/Individual-Content/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params
        const content = await contents.find({ _id: id }).populate('userId')
        if (!content || content.length === 0) return res.status(404).send({ message: 'No Content Found' })
        const contentArray = []
        content.forEach((element) => {
            contentArray.push(constituteContent(element))
        })
        return res.status(200).send({ response: contentArray })
    } catch (error) {
        return res.status(500).send({ message: error.message })
    }
})

router.post('/constitute-content', authMiddleware, async (req, res) => {
    try {
        const {title, content, tags, postImage, option} = req.body
        if (!title && !content && !tags && !postImage) return res.status(400).send({ message: 'please fill blank' })
        const constitute_content = await contents({
            userId: req.user,
            title: title,
            content: content,
            option: option,
            tags: tags,
            postImage: postImage
        })
        await constitute_content.save((err) => {
            if (err) return res.status(401).send({ message: err.message })
            return res.status(200).json({ success: 'Content have been added' })
        })
    } catch (error) {
        return res.status(500).send({ message: error.message })
    }
})

// tag
router.get('/tag/:title', authMiddleware, async (req, res) => {
    try {
        const { title } = req.params
        const content = await contents.find({ tags: title }).populate('userId')
        if (!content) return res.status(400).send({ message: "Tag Not Found" })
        const contentArray = []
        content.forEach((element) => {
            contentArray.push(constituteContent(element))
        })
        return res.status(200).send({ response: contentArray })
    } catch (error) {
        return res.status(500).send({message: error.message})
    }
})

// search 
router.get('/search', authMiddleware, async (req, res) => {
    //console.log(req.query); Testing
    //error with search space 
    //solution for vue 3 js https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
    //testing encodeURIComponent ( How%20to%20Master%20Design%20in%206%20Simple%20Steps )
    //solution for server https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/decodeURIComponent
    //decodeURIComponent(encodedURI)
    const searchTitle = decodeURIComponent(req.query.searchTitle)
    try {
        const content = await contents.findByContent(searchTitle)
        if (!content) return req.status(404).send({ message: "An error occurred while searching" })
        const contentArray = []
        content.forEach((element) => {
            contentArray.push(constituteContent(element))
        })
        return res.status(200).json({ response : contentArray })
    } catch (error) {
        return res.status(500).send({message: error.message})
    }

})

// user - post
router.get('/user-post', authMiddleware, async (req, res) => {
    try {
        const content = await contents.where({ userId: req.user })
        if (content.length === 0) return res.status(404).send({ message: 'No Content Found' })
        if (!content) return res.status(400).send({ message: "Tag Not Found" })
        const contentArray = []
        content.forEach((element) => {
            contentArray.push(constituteContent(element))
        })
        return res.status(200).send({ response: contentArray })
    } catch (error) {
        return res.status(500).send({message: error.message})
    }
})

// user - delete - post
router.delete('/user-delete-post/:id', authMiddleware, async (req, res) => {
    try {
        // Find the content by id and remove it from the database
        const contentId = req.params.id;
        await contents.findByIdAndDelete(contentId);
        return res.status(200).json({ message: 'Content deleted successfully' });
    } catch (error) {
        return res.status(500).send({message: error.message})
    }
})

router.post('/:postId/like', authMiddleware, async (req, res) => {
    const { postId } = req.params;
    try {
        // Find the post to like
        const post = await contents.findById({_id: postId});
        if (!post) return res.status(404).send('Post not found')
        // Check if the user already liked the post
        if (post.likedBy.includes(req.user)) {
            return res.status(202).json({ message: true })
        }
        // Add the user's ID to the likes array
        post.likes++
        post.likedBy.push(req.user)
        // Save the updated post
        await post.save()
        return res.status(200).send('Post liked successfully');
    } catch (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
    }
});

router.post('/:postId/unlike', authMiddleware, async (req, res) => {
    const { postId } = req.params;
    try {
        // Find the post to unlike
        const post = await contents.findById({_id: postId})
        if (!post) return res.status(404).send('Post not found')
        // Check if the user already liked the post
        if (!post.likedBy.includes(req.user)) return res.status(400).send('User did not like this post')
        // Remove the user's ID from the likes array
        post.likes--
        post.likedBy.pull(req.user)
        // Save the updated post
        await post.save();
        return res.status(200).send('Post unliked successfully')
    } catch (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error')
    }
});

router.get('/:postId/isLike', authMiddleware, async (req, res) => {
    const { postId } = req.params;
    try {
        // Find the post to like
        const post = await contents.findById({_id: postId});
        if (!post) return res.status(404).send('Post not found')
        if (post.likedBy.includes(req.user)) {
            return res.status(202).json({ message: true })
        } else {
            return res.status(202).json({ message: false })
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
    }
});

function constituteContent (element) {
    const reconstituteContent = {
        id: element._id,
        title: element.title,
        time: element.createdAt,
        content: element.content,
        tags: element.tags,
        option: element.option,
        like: element.likes,
        postImage: element.postImage,
        userImage: element.userId.UserImage,
        userId: jwt.sign({ id: element.userId._id }, process.env.ID_TOKEN_SECRET),
        username: element.userId.username,
    }
    return reconstituteContent
}

module.exports = router;