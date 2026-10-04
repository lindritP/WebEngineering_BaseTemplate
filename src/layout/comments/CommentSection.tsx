import { useState } from 'react';
import type { ReactElement, SubmitEvent } from 'react';
import type { Comment } from '../../types.ts';

interface CommentSectionProps {
  // You can add props here if needed in the future
  comments: Comment[];
  onAddComment: (comment: Comment) => void;
}

export default function CommentSection({
  comments,
  onAddComment,
}: CommentSectionProps): ReactElement {
  const [name, setName] = useState('');
  const [commentText, setCommentText] = useState('');

  function handleSubmit(e: SubmitEvent<HTMLFormElement>): void {
    e.preventDefault();

    if (name.trim() === '' || commentText.trim() === '') {
      //alert('Please fill in both name and comment fields.');
      return;
    }

    const newComment: Comment = {
      name: name.trim(),
      comment: commentText.trim(),
    };

    onAddComment(newComment);
    setName('');
    setCommentText('');
  }

  return (
    <div className="comment-wrapper">
      <h4>Add comment</h4>
      <form className="comment-form" onSubmit={handleSubmit}>
        <div className="flex-pair">
          Your name:
          <input
            type="text"
            name="name"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
          />
        </div>
        <div className="flex-pair">
          Your comment:
          <input
            type="text"
            name="comment"
            placeholder="Enter your comment"
            value={commentText}
            onChange={(e) => {
              setCommentText(e.target.value);
            }}
          />
        </div>
        <div>
          <input type="submit" value="Submit comment" />
        </div>
      </form>

      <h4>Comments</h4>
      <ul className="comment-container">
        {comments.map((comment, index) => (
          <li key={index}>
            <p>{comment.name}</p>
            <p>{comment.comment}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
