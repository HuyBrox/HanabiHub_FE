"use client";
import {
  useGetUsersQuery,
  useUpdateUserMutation,
} from "@/store/services/userApi";
import { TestComponentProps } from "@/types/common";
import styles from "./TestComponent.module.css";

export function TestComponent({}: TestComponentProps) {
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
