import { useEffect } from "react";
import { useSocketContext } from "@/providers/SocketProvider";
import { commentApi } from "@/store/services/commentApi";
import { postApi } from "@/store/services/postApi";
import { useAppDispatch } from "@/store/hooks";

export function useSocketLikes(postId?: string) {
  const { socket, connected } = useSocketContext();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!socket || !connected) return;

    const handlePostLiked = (data: {
      postId: string;
      userId: string;
      likes: string[];
      isLiked: boolean;
    }) => {
      if (postId && data.postId !== postId) return;

      dispatch(
        postApi.util.updateQueryData("getAllPosts", undefined, (draft) => {
          const post = draft.find((p) => p._id === data.postId);
          if (post) {
            post.likes = data.likes;
          }
        })
      );

      if (postId) {
        dispatch(
          postApi.util.updateQueryData("getPostById", data.postId, (draft) => {
            draft.likes = data.likes;
          })
        );
      }
    };

    const handleCommentLiked = (data: {
      commentId: string;
      postId: string;
      userId: string;
      likes: string[];
      isLiked: boolean;
    }) => {
      if (!postId || data.postId !== postId) return;

      dispatch(
        commentApi.util.updateQueryData("getCommentsByPost", data.postId, (draft) => {
          const updateCommentLikes = (comments: any[]): boolean => {
            for (const comment of comments) {
              if (comment._id === data.commentId) {
                comment.likes = data.likes;
                return true;
              }
              if (comment.replies && comment.replies.length > 0) {
                if (updateCommentLikes(comment.replies)) {
                  return true;
                }
              }
            }
            return false;
          };

          updateCommentLikes(draft);
        })
      );
    };

    socket.on("post:liked", handlePostLiked);
    socket.on("comment:liked", handleCommentLiked);

    return () => {
      socket.off("post:liked", handlePostLiked);
      socket.off("comment:liked", handleCommentLiked);
    };
  }, [socket, connected, postId, dispatch]);
}

