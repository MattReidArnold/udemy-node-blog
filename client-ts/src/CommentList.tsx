import React from 'react';
import Comment from './Comment'

type props = {
  comments: Comment[]
}

export default ({ comments }: props) => {
  const renderedComments = comments.map((comment) => {
    let content;

    if (comment.status === 'approved') {
      content = comment.content;
    }

    if (comment.status === 'pending') {
      content = 'This comment is awaiting moderation';
    }

    if (comment.status === 'rejected') {
      content = 'This comment has been rejected';
    }

    return <li key={comment.id}>{content}</li>;
  });
  return <ul>{renderedComments}</ul>;
};
