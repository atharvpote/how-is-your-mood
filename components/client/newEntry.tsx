"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { AiOutlinePlus } from "react-icons/ai";
import { LoadingSpinner } from "../server/loading";
import {
  QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { z } from "zod";
import { validatedData } from "@/utils/validator";
import { ErrorAlert } from "./modal";
import { handleModal } from "@/utils";

export default function NewEntry() {
  const loading = useRef<HTMLDialogElement | null>(null);

  const {
    mutate: create,
    isPending,
    isError,
    error,
  } = useNewEntry(useQueryClient(), useRouter());

  useEffect(() => {
    handleModal(loading, isPending);
  }, [isPending]);

  return (
    <>
      <button
        aria-label="new entry"
        onClick={() => {
          create();
        }}
        className="btn bg-neutral text-neutral-content hover:scale-105 hover:bg-neutral-800"
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
      <ErrorAlert isError={isError} error={error} />
    </>
  );
}

function useNewEntry(queryClient: QueryClient, router: AppRouterInstance) {
  return useMutation({
    mutationFn: async () => {
      const { data } = await axios.post<unknown>("/api/entry");

      const newEntrySchema = z.object({ id: z.string() });

      const { id } = validatedData(newEntrySchema, data);

      return { id };
    },
    onSuccess: async ({ id }) => {
      router.push(`/journal/${id}`);

      await queryClient.invalidateQueries({ queryKey: ["entries"] });
    },
  });
}
