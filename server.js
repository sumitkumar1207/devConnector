const express = require('express');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const passport =require('passport');

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

const port = process.env.PORT || 5000;

app.listen(port,() => console.log(`Sever is running on ${port}`));