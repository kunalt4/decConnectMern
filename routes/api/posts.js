const express = require("express");
const router = express.Router();
const mongooge = require("mongoose");
const passport = require("passport");

const Post = require("../../models/Posts");
const Profile = require("../../models/Profile");
const validatePostInput = require("../../validation/post");

//@route    GET /api/posts/test
//@desc     tests posts route
//@access   public
router.get(`/test`, (req, res) => res.json({ msg: "Posts Works" }));

//@route    GET /api/posts
//@desc     Get posts
//@access   public

router.get("/", (req, res) => {
  const errors = {};

  Post.find()
    .sort({ date: -1 })
    .then(posts => {
      if (!posts) {
        errors.posts = "No one has posted here.";
        res.status(404).json(errors);
      }

      res.json(posts);
    })
    .catch(err => res.status(404).json(err));
});

//@route    GET /api/posts/:id
//@desc     Get post by id
//@access   public

router.get("/:id", (req, res) => {
  const errors = {};

  Post.findById(req.params.id)
    .then(post => {
      if (!post) {
        errors.posts = "No post here, not for that given id anyways.";
        res.status(404).json(errors);
      }

      res.json(post);
    })
    .catch(err =>
      res.status(404).json({ nopost: "No post for that ID. Wrong ID." })
    );
});

//@route    POST /api/posts/
//@desc     Create post
//@access   private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    //Check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }

    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    });

    newPost.save().then(post => res.json(post));
  }
);

//@route    DELETE /api/posts/:id
//@desc     Delete post
//@access   private
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          //Check post owner id
          if (post.user.toString() !== req.user.id) {
            return res
              .status(401)
              .json("You can't delete this! Not authorised.");
          }

          //Delete post
          post.remove().then(() => res.json({ success: true }));
        })
        .catch(err => res.status(404).json(err));
    });
  }
);

//@route    POST /api/posts/like/:id
//@desc     Like post
//@access   private
router.post(
  "/like/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length > 0
          ) {
            return res
              .status(400)
              .json({ alreadyliked: "Cannot like more than once" });
          }

          //Add user to likes array
          post.likes.unshift({ user: req.user.id });

          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json(err));
    });
  }
);

//@route    POST /api/posts/unlike/:id
//@desc     Unlike post
//@access   private
router.post(
  "/unlike/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length === 0
          ) {
            return res
              .status(400)
              .json({ notliked: "Can't unlike what you haven't liked!" });
          }

          const removeIndex = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id);

          //splice out of array
          post.likes.splice(removeIndex, 1);

          //Save
          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json(err));
    });
  }
);

//@route    POST /api/posts/comment/:id
//@desc     Add comment to post
//@access   private
router.post(
  "/comment/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    //Check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }

    //   Profile.findOne({ user: req.user.id }).then(profile => {
    Post.findById(req.params.id)
      .then(post => {
        const newComment = {
          text: req.body.text,
          name: req.body.name,
          avatar: req.body.avatar,
          user: req.user.id
        };

        //Add comment to array
        post.comments.unshift(newComment);

        //Save
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json(err));
    //   });
  }
);

//@route    DELETE /api/posts/comment/:id/:comment_id
//@desc     Remove comment from post
//@access   private
router.delete(
  "/comment/:id/:comment_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    //   Profile.findOne({ user: req.user.id }).then(profile => {
    Post.findById(req.params.id)
      .then(post => {
        //Check if comment exits
        if (
          post.comments.filter(
            comment => comment._id.toString() === req.params.comment_id
          ).length === 0
        ) {
          return res.status(404).json({
            commentnotfound: "Comment does not exist."
          });
        }

        //Get remove index
        const removeIndex = post.comments
          .map(item => item._id.toString())
          .indexOf(req.params.comment_id);

        //Check for comment owner
        if (post.comments[removeIndex].user.toString() !== req.user.id) {
          return res.status(401).json({
            unauthorized: "Not your comment to delete."
          });
        }

        //Splice

        post.comments.splice(removeIndex, 1);
        //Save
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json(err));
    //   });
  }
);

module.exports = router;
