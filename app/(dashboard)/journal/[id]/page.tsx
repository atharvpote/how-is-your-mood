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

export default async function EntryPage(context: Readonly<RequestContext>) {
  const { id } = zodSafeParseValidator(contextValidator(context));

  const entry = await fetchEntryAndAnalysis(await getUserIdByClerkId(), id);

  notNullValidator<EntryWithAnalysis>(entry, analysisNotFound);

  return <Editor entry={{ ...entry, id }} />;
}
