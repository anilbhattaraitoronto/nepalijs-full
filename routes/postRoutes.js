const { Router } = require("express");
const router = Router();
const { verifyAdmin } = require("../middlewares/verifyToken");

const { getLatestPosts, addPost, updatePost, deletePost } = require(
  "../controllers/postController",
);

router.get("/latest", getLatestPosts); //unprotected
router.post("/addpost", verifyAdmin, addPost); //protected and only admin is allowed
router.post("/updatepost/:id", verifyAdmin, updatePost);
router.delete("/deletepost/:id", verifyAdmin, deletePost);

module.exports = router;
