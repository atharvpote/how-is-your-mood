import Editor from "@/components/client/editor";
import { getCurrentUserId } from "@/utils/auth";
import { ANALYSIS_NOT_FOUND } from "@/utils/error";
import { getEntryAndAnalysis } from "@/utils/fetchers";
import { RequestContext, Analysis } from "@/utils/types";
import { validateRequestContext, validateNotNull } from "@/utils/validator";

export default async function EntryPage(context: Readonly<RequestContext>) {
  const {
    params: { id },
  } = validateRequestContext(context);
  const { content, date, analysis } = await getEntryAndAnalysis({
    userId: await getCurrentUserId(),
    id,
  });

  validateNotNull<Analysis>(analysis, ANALYSIS_NOT_FOUND);

  return <Editor initialEntry={{ analysis, content, date, id }} />;
}
