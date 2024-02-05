import Editor from "@/components/client/editor";
import { getUserIdByClerkId } from "@/utils/auth";
import { ANALYSIS_NOT_FOUND } from "@/utils/error";
import { fetchEntryAndAnalysis } from "@/utils/fetcher";
import { RequestContext, EntryWithAnalysis } from "@/utils/types";
import {
  contextValidator,
  validateNotNull,
  parseValidatedData,
} from "@/utils/validator";

export default async function EntryPage(context: Readonly<RequestContext>) {
  const { id } = parseValidatedData(contextValidator(context));

  const entry = await fetchEntryAndAnalysis(await getUserIdByClerkId(), id);

  validateNotNull<EntryWithAnalysis>(entry, ANALYSIS_NOT_FOUND);

  return <Editor initialEntry={{ ...entry, id }} />;
}
