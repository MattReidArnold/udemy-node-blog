import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import { randomBytes } from 'crypto';
import axios from 'axios';

const app = express();

app.use(bodyParser.json());
app.use(cors());

type comment = {
  id: string;
  content: string;
  status: string;
};

const commentsByPostId: {
  [key: string]: comment[];
} = {};

app.get('/posts/:id/comments', (req, res) => {
  res.send(commentsByPostId[req.params.id] || []);
});

app.post('/posts/:id/comments', async (req, res) => {
  const commentId = randomBytes(4).toString('hex');
  const { content } = req.body;

  const comments = commentsByPostId[req.params.id] || [];

  comments.push({ id: commentId, content, status: 'pending' });

  commentsByPostId[req.params.id] = comments;
  await axios.post('http://event-bus-srv:4005/events', {
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

      await axios.post('http://event-bus-srv:4005/events', {
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
  console.log(`Listening on port ${PORT}`);
});
