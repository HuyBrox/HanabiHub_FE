"use client";
import {
  useGetUsersQuery,
  useUpdateUserMutation,
} from "@/store/services/userApi";

export default function UserList() {
  const { data, isLoading } = useGetUsersQuery();
  const [updateUser] = useUpdateUserMutation();

  if (isLoading) return <p>Loading...</p>;

  return (
    <ul>
      {data?.map((u) => (
        <li key={u.id}>
          {u.name}
          <button
            onClick={() => updateUser({ id: u.id, body: { name: "New" } })}
          >
            Update
          </button>
        </li>
      ))}
    </ul>
  );
}
