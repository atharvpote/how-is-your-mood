import { getEntry } from "@/utils/actions";
import Editor from "@/components/client/editor";
import { ANALYSIS_NOT_FOUND } from "@/utils/error";
import { RequestContext, Analysis } from "@/utils/types";
import { validateRequestContext, validateNotNull } from "@/utils/validator";

export default async function EntryPage(context: Readonly<RequestContext>) {
  const {
    params: { id },
  } = validateRequestContext(context);
  const { content, date, analysis } = await getEntry(id);

  validateNotNull<Analysis>(analysis, ANALYSIS_NOT_FOUND);

  return <Editor entry={{ analysis, content, date, id }} />;
}
