import { useEffect } from "react";
import { useSocketContext } from "@/providers/SocketProvider";
import { commentApi } from "@/store/services/commentApi";
import { postApi } from "@/store/services/postApi";
import { useAppDispatch } from "@/store/hooks";
import { Comment } from "@/types/post";

export function useSocketComments(postId?: string) {
  const { socket, connected } = useSocketContext();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!socket || !connected || !postId) return;

    const handleCommentCreated = (data: {
      comment: Comment;
      postId: string;
      parentId: string | null;
    }) => {
      if (data.postId !== postId) return;

      dispatch(
        commentApi.util.updateQueryData("getCommentsByPost", data.postId, (draft) => {
          const findAndReplaceTemp = (comments: Comment[]): boolean => {
            for (let i = 0; i < comments.length; i++) {
              if (comments[i]._id.startsWith("temp-")) {
                const tempComment = comments[i];
                if (
                  tempComment.text === data.comment.text &&
                  tempComment.targetId === data.comment.targetId &&
                  tempComment.parentId === data.parentId
                ) {
                  comments[i] = data.comment;
                  return true;
                }
              }
              if (comments[i].replies && comments[i].replies.length > 0) {
                if (findAndReplaceTemp(comments[i].replies!)) {
                  return true;
                }
              }
            }
            return false;
          };

          const commentExists = (comments: Comment[], commentId: string): boolean => {
            for (const comment of comments) {
              if (comment._id === commentId) return true;
              if (comment.replies && comment.replies.length > 0) {
                if (commentExists(comment.replies, commentId)) return true;
              }
            }
            return false;
          };

          if (commentExists(draft, data.comment._id)) {
            return;
          }

          if (findAndReplaceTemp(draft)) {
            return;
          }

          if (data.parentId) {
            const addReply = (comments: Comment[]): boolean => {
              for (const comment of comments) {
                if (comment._id === data.parentId) {
                  if (!comment.replies) {
                    comment.replies = [];
                  }
                  comment.replies.push(data.comment);
                  return true;
                }
                if (comment.replies && comment.replies.length > 0) {
                  if (addReply(comment.replies)) {
                    return true;
                  }
                }
              }
              return false;
            };

            if (!addReply(draft)) {
              draft.unshift(data.comment);
            }
          } else {
            draft.unshift(data.comment);
          }
        })
      );

      dispatch(
        postApi.util.invalidateTags([
          { type: "Post", id: data.postId },
          "Post",
        ])
      );
    };

    socket.on("comment:created", handleCommentCreated);

    return () => {
      socket.off("comment:created", handleCommentCreated);
    };
  }, [socket, connected, postId, dispatch]);
}

