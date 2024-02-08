import Editor from "@/components/client/editor";
import { getUserIdByClerkId } from "@/utils/auth";
import { ANALYSIS_NOT_FOUND } from "@/utils/error";
import { fetchEntryAndAnalysis } from "@/utils/fetcher";
import { IdParams, EntryWithAnalysis } from "@/utils/types";
import { validateUrlIdParam, validateNotNull } from "@/utils/validator";

export default async function EntryPage({
  params,
}: Readonly<{ params: IdParams }>) {
  const { id } = validateUrlIdParam(params);

  const entry = await fetchEntryAndAnalysis(await getUserIdByClerkId(), id);

  validateNotNull<EntryWithAnalysis>(entry, ANALYSIS_NOT_FOUND);

  return <Editor initialEntry={{ ...entry, id }} />;
}
