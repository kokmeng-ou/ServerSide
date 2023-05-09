import { Router } from 'express'
const router = Router()

router.get('/testing', (req, res) => {
    return res.status(200).json( { message : 'Get Information' })
}),

router.post('/testing/:id', (req, res) => {
    const { id } = req.params
    return res.status(200).json( { message : id })
}),

router.post('/ReceiveHTML', (req, res) => {
    try{
        const { startTag, attributes, text, endTag } = req.body
        if (!startTag && !attributes && !text && !endTag) return res.status(400).send({ message: 'please fill blank' })
        const formData = {
            startTag: startTag,
            attributes: {
              id: attributes.id,
              className: attributes.className
            },
            close: '>',
            text: text,
            endTag: endTag
        }
        console.log(formData)
        return res.status(200).json({htmlFormat: formData})
    } catch (err) {
        return res.status(500).send({message: err.message})
    }
})

module.exports = router