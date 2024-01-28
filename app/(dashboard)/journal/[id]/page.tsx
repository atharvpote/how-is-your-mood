import Editor from "@/components/editor";
import { getUserIdByClerkId } from "@/utils/auth";
import { analysisNotFound } from "@/utils/error";
import { fetchEntryAndAnalysis } from "@/utils/fetcher";
import { RequestContext, EntryWithAnalysis } from "@/utils/types";
import {
  contextValidator,
  notNullValidator,
  zodSafeParseValidator,
} from "@/utils/validator";

export default async function EditorPage(context: Readonly<RequestContext>) {
  const validation = contextValidator(context);

  const { id } = zodSafeParseValidator(validation);

  const userId = await getUserIdByClerkId();

  const entry = await fetchEntryAndAnalysis(userId, id);

  notNullValidator<EntryWithAnalysis>(entry, analysisNotFound);

  return <Editor entry={{ ...entry, id }} />;
}
