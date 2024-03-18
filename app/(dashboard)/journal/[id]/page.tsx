import { getJournalEntry } from "@/utils/actions";
import Editor from "@/components/client/editor";
import { RequestContext } from "@/utils/types";
import { validateRequestContext } from "@/utils/validator";

export default async function EntryPage(context: Readonly<RequestContext>) {
  const {
    params: { id },
  } = validateRequestContext(context);

  const entry = await getJournalEntry(id);

  return <Editor entry={{ ...entry, id }} />;
}
