const DB = require("../schema");

exports.getLatestPosts = (req, res) => {
  let getLatestPostsStmt = DB.prepare(
    `SELECT * FROM POSTS ORDER BY posted_date DESC LIMIT 30;`,
  );
  let latestPosts = getLatestPostsStmt.all();
  if (latestPosts.lgngth > 0) {
    return res.status(200).json(latestPosts);
  } else {
    return res.status(204).json({ message: "No post yet." });
  }
};

exports.addPost = (req, res) => {
  const { thumbnail, title, author, category, topic, summary, content } =
    req.body;
  if (thumbnail && title && author && category && topic && summary && content) {
    const insertPostStmt = DB.prepare(
      `INSERT INTO posts (thumbnail, title, author, category, topic, summary, content) VALUES (?,?,?,?,?,?,?);`,
    );
    const newPostId = insertPostStmt.run(
      thumbnail,
      title,
      author,
      category,
      topic,
      summary,
      content,
    ).lastInsertRowid;
    const getPostStmt = DB.prepare(`SELECT * FROM posts WHERE id=?;`);
    const newPost = getPostStmt.get(newPostId);
    return res.status(200).json(newPost);
  } else {
    return res.status(400).json({ message: "All the fields are required" });
  }
};

exports.updatePost = (req, res) => {
  const { thumbnail, title, author, category, topic, summary, content } =
    req.body;
  const postId = req.params.id;
  if (thumbnail && title && author && category && topic && summary && content) {
    const updatePostStmt = DB.prepare(
      `UPDATE posts SET thumbnail=?, title=?, author=?, category=?, topic=?, summary=?, content=? WHERE  id=?;`,
    );
    updatePostStmt.run(
      thumbnail,
      title,
      author,
      category,
      topic,
      summary,
      content,
      postId,
    );

    const getPostStmt = DB.prepare(`SELECT * FROM posts WHERE id=?;`);
    const updatedPost = getPostStmt.get(postId);
    return res.status(200).json(updatedPost);
  } else {
    return res.status(400).json({ message: "All the fields are required" });
  }
};

exports.deletePost = (req, res) => {
  const postId = req.params.id;
  if (postId) {
    let getPostStmt = DB.prepare(`SELECT * FROM posts WHERE id=?;`);
    let post = getPostStmt.get(postId);
    if (post) {
      const deletePostStmt = DB.prepare(`DELETE FROM posts WHERE id=?;`);
      deletePostStmt.run(postId);
      return res.status(200).json(
        { message: "Post is deleted successfully." },
      );
    } else {
      return res.status(404).json({ message: "Post does not exist" });
    }
  } else {
    return res.status(404).json({ message: "That post does not exist" });
  }
};
