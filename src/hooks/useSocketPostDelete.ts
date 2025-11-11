import { useEffect } from "react";
import { useSocketContext } from "@/providers/SocketProvider";
import { postApi } from "@/store/services/postApi";
import { useAppDispatch } from "@/store/hooks";

export function useSocketPostDelete() {
  const { socket, connected } = useSocketContext();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!socket || !connected) return;

    const handlePostDeleted = (data: { postId: string }) => {
      dispatch(
        postApi.util.updateQueryData("getAllPosts", undefined, (draft) => {
          const index = draft.findIndex((p) => p._id === data.postId);
          if (index !== -1) {
            draft.splice(index, 1);
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

    socket.on("post:deleted", handlePostDeleted);

    return () => {
      socket.off("post:deleted", handlePostDeleted);
    };
  }, [socket, connected, dispatch]);
}

