import { useEffect } from "react";
import { useSocketContext } from "@/providers/SocketProvider";
import { commentApi } from "@/store/services/commentApi";
import { postApi } from "@/store/services/postApi";
import { useAppDispatch } from "@/store/hooks";
import { Comment } from "@/types/post";

export function useSocketCommentDelete(postId?: string) {
  const { socket, connected } = useSocketContext();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!socket || !connected || !postId) return;

    const handleCommentDeleted = (data: {
      commentId: string;
      postId: string;
      parentId: string | null;
    }) => {
      if (data.postId !== postId) return;

      dispatch(
        commentApi.util.updateQueryData("getCommentsByPost", data.postId, (draft) => {
          const removeComment = (comments: Comment[]): boolean => {
            for (let i = 0; i < comments.length; i++) {
              if (comments[i]._id === data.commentId) {
                comments.splice(i, 1);
                return true;
              }
              if (comments[i].replies && comments[i].replies.length > 0) {
                if (removeComment(comments[i].replies!)) {
                  return true;
                }
              }
            }
            return false;
          };

          removeComment(draft);
        })
      );

      dispatch(
        postApi.util.invalidateTags([
          { type: "Post", id: data.postId },
          "Post",
        ])
      );
    };

    socket.on("comment:deleted", handleCommentDeleted);

    return () => {
      socket.off("comment:deleted", handleCommentDeleted);
    };
  }, [socket, connected, postId, dispatch]);
}

