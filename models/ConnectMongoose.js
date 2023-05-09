import mongoose from 'mongoose'

// Connection to NoSQL mongoose

mongoose.set('strictQuery', false)
mongoose.connect('mongodb+srv://Hansuki:UP5xsqnmUQMv3OrZ@cluster0.qb5sw7i.mongodb.net/?retryWrites=true&w=majority')
    .then((result) => {
        console.log('Connected to MongoDB');
    }).catch((err) => {
        console.log(err);
    });