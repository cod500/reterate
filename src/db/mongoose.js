const mongoose = require('mongoose');

// Connect to MongoDB
// mongodb://127.0.0.1:27017/rating-api
mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB connected')
}).catch((e) => {
    console.log(e)
})