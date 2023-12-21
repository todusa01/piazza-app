const express =require('express')
const router = express.Router()
const authMiddleware = require('../middlewares/authMiddleware');

const Post = require('../models/Post')

// POST (Create data)
router.post('/', authMiddleware, async(req,res)=>{
    //console.log(req.body)

    const postData = new Post({
        title:req.body.title,
        topics:req.body.topics,
        messageBody:req.body.messageBody,
        expirationTime:req.body.expirationTime,
        owner:req.body.owner,
        Status:req.body.Status,
        likes:req.body.likes,
        dislikes:req.body.dislikes,
        comments:req.body.comments
    })
    // try to insert...
    try{
        const postToSave = await postData.save()
        res.send(postToSave)
    }catch(err){
        res.send({message:err})
    }
})

// Retrieve posts for a specific topic
router.get('/:topic', authMiddleware, async (req, res) => {
    try {
        const { topic } = req.params;
        const posts = await Post.find({ topics: topic });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving posts' });
    }  
});


// Comment on a post
router.post('/:postId/comment', authMiddleware, async (req, res) => {
    try {
        const { postId } = req.params;
        const { comment } = req.body;
        const userId = req.user.id;

        // Check if the post is still active
        const post = await Post.findById(postId);
        if (!post || (post.expirationTime && post.expirationTime <= new Date())) {
            return res.status(404).json({ message: 'Post not found or has expired' });
        }

        // Check if the user is the owner of the post
        if (post.owner.toString() === userId) {
            return res.status(403).json({ message: 'Owners cannot comment on their own post' });
        }

        // Continue with the commenting
        await Post.findByIdAndUpdate(postId, { $push: { comments: { userId, message: comment } } });

        res.json({ message: 'Comment added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error adding comment' });
    }
});

// Like a post 
router.post('/:postId/like', authMiddleware, async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.id;

        // Check if the post is still active
        const post = await Post.findById(postId);
        if (!post || (post.expirationTime && post.expirationTime <= new Date())) {
            return res.status(404).json({ message: 'Post not found or has expired' });
        }

        // Check if the user is the owner of the post
        if (post.owner.toString() === userId) {
            return res.status(403).json({ message: 'Owners cannot like their own post' });
        }

        // Continue with  liking the post
        if (!post.likes.includes(userId)) {
            await Post.findByIdAndUpdate(postId, { $push: { likes: userId }, $inc: { likeCount: 1 } });
        } else {
            await Post.findByIdAndUpdate(postId, { $pull: { likes: userId }, $inc: { likeCount: -1 } });
        }

        // Remove dislike if the user dislikes the post
        if (post.dislikes.includes(userId)) {
            await Post.findByIdAndUpdate(postId, { $pull: { dislikes: userId }, $inc: { dislikeCount: -1 } });
        }

        res.json({ message: 'Post liked successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error liking post' });
    }
});

// Dislike a post
router.post('/:postId/dislike', authMiddleware, async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.id;

        // Check if the post is still active
        const post = await Post.findById(postId);
        if (!post || (post.expirationTime && post.expirationTime <= new Date())) {
            return res.status(404).json({ message: 'Post not found or has expired' });
        }

        // Check if the user is the owner of the post
        if (post.owner.toString() === userId) {
            return res.status(403).json({ message: 'Owners cannot dislike their own post' });
        }

        // Continue with the disliking 
        if (!post.dislikes.includes(userId)) {
            await Post.findByIdAndUpdate(postId, { $push: { dislikes: userId }, $inc: { dislikeCount: 1 } });
        } else {
            await Post.findByIdAndUpdate(postId, { $pull: { dislikes: userId }, $inc: { dislikeCount: -1 } });
        }

        // Remove like if the user likes the post
        if (post.likes.includes(userId)) {
            await Post.findByIdAndUpdate(postId, { $pull: { likes: userId }, $inc: { likeCount: -1 } });
        }

        res.json({ message: 'Post disliked successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error disliking post' });
    }
});


// Retrieve the most active post in a topic
router.get('/:topic/active', async (req, res) => {
    try {
        const { topic } = req.params;

        const posts = await Post.aggregate([
            // Matching posts that belong to the specified topic
            { $match: { topics: topic } },
            // Unwinding the 'likes' and 'dislikes' arrays to separate entries
            { $unwind: "$likes" },
            { $unwind: "$dislikes" },
            { $sort: { likes: -1, dislikes: -1 } },
            { $group: { _id: "$_id", post: { $first: "$$ROOT" } } },
            { $replaceRoot: { newRoot: "$post" } },
            { $limit: 1 }
        ]);

        res.json(posts[0] || {});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});



// Retrieve expired posts in a topic
router.get('/:topic/expired', authMiddleware,  async (req, res) => {
    const { topic } = req.params;
    const posts = await Post.find({ topics: topic, expirationTime: { $lt: new Date() } });
    res.json(posts);
});

module.exports = router