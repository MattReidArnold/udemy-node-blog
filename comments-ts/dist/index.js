'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const crypto_1 = require('crypto');
const axios_1 = require('axios');
const app = express();
app.use(bodyParser.json());
app.use(cors());
const commentsByPostId = {};
app.get('/posts/:id/comments', (req, res) => {
  res.send(commentsByPostId[req.params.id] || []);
});
app.post('/posts/:id/comments', async (req, res) => {
  const commentId = crypto_1.randomBytes(4).toString('hex');
  const { content } = req.body;
  const comments = commentsByPostId[req.params.id] || [];
  comments.push({ id: commentId, content, status: 'pending' });
  commentsByPostId[req.params.id] = comments;
  await axios_1.default.post('http://event-bus-srv:4005/events', {
    type: 'CommentCreated',
    data: {
      id: commentId,
      content,
      postId: req.params.id,
      status: 'pending',
    },
  });
  res.status(201).send(comments);
});
app.post('/events', async (req, res) => {
  const { type, data } = req.body;
  console.log('Received Event', type, data);
  if (type === 'CommentModerated') {
    const { postId, id, status, content } = data;
    const comments = commentsByPostId[postId];
    const comment = comments.find((comment) => comment.id === id);
    if (comment) {
      comment.status = status;
      await axios_1.default.post('http://event-bus-srv:4005/events', {
        type: 'CommentUpdated',
        data: {
          id,
          status,
          postId,
          content,
        },
      });
    }
  }
  res.send({});
});
const PORT = process.env.PORT || 4006;
app.listen(PORT, () => {
  console.log(`Server is running in http://event-bus-srv:${PORT}`);
});
//# sourceMappingURL=index.js.map
