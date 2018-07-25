const express = require('express');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const passport =require('passport');
const path = require ('path');
const users = require('./routes/api/users');
const profile = require('./routes/api/profile.js');
const posts = require('./routes/api/posts.js');

const app = express();

//Body parser middleware
app.use(bodyparser.urlencoded({extended:false}));
app.use(bodyparser.json());
//db config 
const db = require('./config/keys.js').mongoURI;

//connect to mongodb 
mongoose
    .connect(db) 
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

//passport middleware
app.use(passport.initialize());

//passport config
require('./config/passport')(passport);

//use routes
app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);

//Server static assests if in production 
if (process.env.NODE_ENV === 'production'){
// Set static folder
app.use(express.static('client/build'));
app.get('*', (req,res) =>{
    res.sendfile(path.resolve(__dirname,'client','build', 'index.html'));
});
}
const port = process.env.PORT || 5000;

app.listen(port,() => console.log(`Sever is running on ${port}`));