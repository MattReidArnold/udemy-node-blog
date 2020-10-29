import Comment from './Comment';

type Post = {
  id: string;
  title: string;
  comments: Comment[];
};

export default Post;
