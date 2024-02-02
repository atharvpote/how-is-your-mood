"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { AiOutlinePlus } from "react-icons/ai";
import { errorAlert } from "@/utils/error";
import { LoadingSpinner } from "./loading";
import {
  QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { z } from "zod";
import { zodSafeParseValidator } from "@/utils/validator";

export default function NewEntry() {
  const loading = useRef<HTMLDialogElement | null>(null);

  const { mutate: createNewEntry, isPending } = useNewEntry(
    useQueryClient(),
    useRouter(),
  );

  useEffect(() => {
    if (loading.current)
      isPending ? loading.current.showModal() : loading.current.close();
  }, [isPending]);

  return (
    <>
      <button
        aria-label="new entry"
        onClick={() => {
          createNewEntry();
        }}
        className="btn bg-neutral text-neutral-content hover:bg-neutral-800"
      >
        <div className="flex w-16 items-center justify-between">
          <AiOutlinePlus className="text-lg" />
          <span className="text-lg capitalize">New</span>
        </div>
      </button>
      <dialog
        className="bg-transparent backdrop:backdrop-brightness-75"
        ref={loading}
      >
        <LoadingSpinner />
      </dialog>
    </>
  );
}

function useNewEntry(queryClient: QueryClient, router: AppRouterInstance) {
  return useMutation({
    mutationFn: async () => {
      const { data } = await axios.post<unknown>("/api/entry");

      const validation = z.object({ id: z.string() }).safeParse(data);

      const { id } = zodSafeParseValidator(validation);

      return id;
    },
    onSuccess: async (data) => {
      router.push(`/journal/${data}`);

      await queryClient.invalidateQueries({ queryKey: ["entries"] });
    },
    onError(error) {
      errorAlert(error);
    },
  });
}
