import jwt from 'jsonwebtoken'
import bcryptjs from 'bcryptjs'
// model
import users from '../models/UserModel'

// middleware
import authMiddleware from '../middleware/AuthMiddleware'


import { Router } from 'express'
const router = Router()

router.get('', authMiddleware, async (req, res) => {
    try {
        const user = await users.findById({_id: req.user}).populate('following')
        //const userJson = JSON.stringify(user)
        const userArray = []
        userArray.push(constituteProfile(user))
        return res.status(200).json(userArray)
    } catch (error) {
        return res.status(500).send({ message: error.message })
    }
})

router.get('/another-user/:id', authMiddleware, async (req, res) => {
    try {
        const decodeID = jwt.verify(req.params.id, process.env.ID_TOKEN_SECRET)
        //Find the user with the specified _id 
        const user = await users.findById({_id: decodeID.id}).populate('following')
        const userArray = []
        userArray.push(constituteProfile(user))
        return res.status(200).json({ user : userArray })
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
})

// update profile
router.put('/update', authMiddleware, async (req, res) => {
    try {
        const { username, weblink, age, telephone, UserImage, Bio, Location } = req.body
        const update = await users.updateOne(
                            { _id: req.user },
                            { $set: { 
                                        username: username, 
                                        weblink: weblink,
                                        age: age,
                                        telephone: telephone,
                                        UserImage: UserImage,
                                        Bio: Bio,
                                        Location: Location
                                    } 
                            }
                        )
        if (!update) return res.status(401).send({ message: 'Sorry we can update you information right now' })
        return res.status(200).send({ success : 'Successful Update information' }) 
    } catch (error) {
        return res.status(500).send({ message: error.message })
    }
})

// update password
router.put('/new-password', authMiddleware, async (req, res) => {
    try {
        const { currentPassword ,password } = req.body
        const user = await users.findOne({ _id: req.user })
        const validPassword = await bcryptjs.compare(currentPassword, user.password)
        if (!validPassword) return res.status(402).send({ message: 'Invalid Password' })
        const salt = await bcryptjs.genSalt(10)
        const hashedPassword = await bcryptjs.hash(password, salt)
        const UpdatePassword = await users.updateOne({ _id: req.user}, {$set: { password : hashedPassword }})
        if (!UpdatePassword) return res.status(403).send({ message: 'Sorry we can update you password right now' })
        return res.status(200).send({ success: 'Successful Update password' })
    } catch (error) {
        return res.status(500).send({ message: error.message })
    }
})

router.patch('/unfollow', authMiddleware, async (req, res) => {
    try {
        // Find the user to unfollow
        const user = await users.findById(req.user)
        const decodeID = jwt.verify(req.body.followerId, process.env.ID_TOKEN_SECRET)
        if (!user) return res.status(404).send('User not found')
        // Check if the user already follow the user
        if (!user.following.includes(decodeID.id)) return res.status(400).send('User did not follow ')
        // Remove the follower
        user.following.pull(decodeID.id)
        // Save the updated user
        await user.save()
        return res.status(200).send({message : 'User unfollowed successfully'})
    } catch (err) {
        console.error(err)
        return res.status(500).send('Internal Server Error')
    }
});

router.patch("/follow", authMiddleware, async (req, res) => {
    try {
        const user = await users.findById({ _id: req.user })
        const decodeID = jwt.verify(req.body.followId, process.env.ID_TOKEN_SECRET)
        if (!user) return res.status(404).send("User not found")
        // Check if the user already liked the post
        if (user.following.includes(decodeID.id)) return res.status(400).send('User already following')
        user.following.push(decodeID.id);
        await user.save();
        return res.status(200).send({ message: "User followed successfully." });
    } catch (error) {
        return res.status(500).send({ message: 'Server 404 😞' });
    }
});

// check if user follow or not 
router.get("/isFollowing/:id", authMiddleware, async (req, res) => {
    try {
        const user = await users.findById({ _id: req.user });
        const decodeID = jwt.verify(req.params.id, process.env.ID_TOKEN_SECRET)
        if (!user) return res.status(404).send("User not found")
        const isFollowing = user.following.includes(decodeID.id)
        return res.status(200).send({ message: isFollowing });
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
});

router.post("/logout", authMiddleware, async (req, res) => {
    console.log(req.token)
    try {
        console.log(req.token)
        const user = await users.findOne({ loginToken: req.token })
        if ( !user ) return res.status(403).send({ message: 'Please Provide Correct Token ⚠️' })
        await users.updateOne(
            { _id: req.user },
            { $set: { loginToken: '' } }
        )
        return res.status(200).json({ respond: true })
    } catch (error) {
        return res.status(500).send({ message: 'Server 404 😞' });
    }
});


function constituteProfile (element) {
    const ReconstituteProfile = {
        username: element.username,
        email: element.email,
        Location: element.Location,
        Bio: element.Bio,
        weblink: element.weblink,
        age: element.age,
        telephone: element.telephone,
        UserImage: element.UserImage,
        createTime: element.createdAt,
        following_username: element.following.username
    }
    if (element.following.length){  // Adding a new property 'following_id' with value 'jwt.sign' to each object
        element.following.forEach((object) => {
            ReconstituteProfile.following_id = jwt.sign({ id: object._id }, process.env.ID_TOKEN_SECRET)
            ReconstituteProfile.following_username =  object.username
            ReconstituteProfile.following_email =  object.email
        })
    }
    return ReconstituteProfile
};


module.exports = router