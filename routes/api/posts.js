const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Get The model of post
const Post = require('../../models/Post');

// Get The model of profile
const Profile = require('../../models/profile');

//Validation
const validatePostInput = require('../../validation/post');

//@route    GET api/posts/test
//@desc     Tests post route 
//@access   public
router.get('/test', (req,res) =>res.json({msg: 'Posts Works'}));

//@route    GET api/posts
//@desc     Get posts
//@access   public
router.get('/', (req,res) =>{
    Post.find()
    .sort({date: -1})
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({nopostfound:'No posts found'}));
});

//@route    GET api/posts/:id
//@desc     Get posts by id
//@access   public
router.get('/:id', (req,res) =>{
    Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err =>
     res.status(404).json({nopostfound:'No post found with this Id.'}));
});

//@route    Post api/posts
//@desc     Create post
//@access   private
router.post('/', passport.authenticate('jwt',{ session:false }), (req,res) =>{
    const { errors, isValid } = validatePostInput(req.body);

    //check validation
    if (!isValid){
        //If any errors, send 400 with errors object
        return res.status(400).json(errors);
    }
    const newPost = new Post({
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id
    });
    newPost.save().then(post => res.json(post));
});

//@route    Delete api/posts/:id
//@desc     Delete post
//@access   private
router.delete('/:id',passport.authenticate('jwt',{session: false}),(req,res)=>{
    Profile.findOne({ user: req.user.id})
    .then(profile =>{
        Post.findById(req.params.id)
        .then(post =>{
            //check for post owner
            if(post.user.toString() !== req.user.id){
                return res.status(401).json({notauthorized:'User not authorized'})
            }

            //Delete
            post.remove().then(()=> res.json({success: true}));
        })
        .catch(err => res.status(404).json({postnotfound:'No post found'}));
    });
});

//@route    Post api/posts/like/:id
//@desc     like post
//@access   private
router.post('/like/:id',passport.authenticate('jwt',{session: false}),(req,res)=>{
    Profile.findOne({ user: req.user.id})
    .then(profile =>{
        Post.findById(req.params.id)
        .then(post =>{
            if(post.likes.filter(like => like.user.toString() === req.user.id).length>0){
                return res.status(400).json({alreadyliked: 'User already liked post'});
            }
            //Add user id to likes array
            post.likes.unshift({user: req.user.id});

            post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({postnotfound:'No post found'}));
    });
});

//@route    Post api/posts/Unlike/:id
//@desc     Unlike post
//@access   private
router.post('/unlike/:id',passport.authenticate('jwt',{session: false}),(req,res)=>{
    Profile.findOne({ user: req.user.id})
    .then(profile =>{
        Post.findById(req.params.id)
        .then(post =>{
            if(post.likes.filter(like => like.user.toString() === req.user.id).length===0){
                return res.status(400).json({notliked: 'you have not yet like this post'});
            }
            //Get remove index
            const removeIndex = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id);
            //Splice out of array
            post.likes.splice(removeIndex,1);
            //save
            post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({postnotfound:'No post found'}));
    });
});

//@route    Post api/posts/Comment/:id
//@desc     Add comment to post
//@access   private
router.post('/comment/:id',passport.authenticate('jwt',{session: false}),(req,res)=>{
    const { errors, isValid } = validatePostInput(req.body);

    //check validation
    if (!isValid){
        //If any errors, send 400 with errors object
        return res.status(400).json(errors);
    }
    Post.findById(req.params.id)
    .then(post =>{
        const newComment ={
            text: req.body.text,
            name: req.body.name,
            avatar: req.body.avatar,
            user: req.body.user,
        }
        // Add to comments array
        post.comments.unshift(newComment);
        //save
        post.save().then(post => res.json(post))
    })
    .catch(err => res.status(404).json({postnotfound:'No post found'}));
});

module.exports = router;