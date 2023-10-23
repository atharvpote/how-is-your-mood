import Analysis from "@/components/analysis";
import DeleteEntry from "@/components/deleteEntry";
import Editor from "@/components/editor";
import EntryDate from "@/components/entryDate";
import AnalysisContextProvider from "@/contexts/analysis";
import EntryDateContextProvider from "@/contexts/entryDate";
import { getUserIdByClerkId } from "@/utils/auth";
import { analysisNotFound } from "@/utils/error";
import { fetchEntryAndAnalysis } from "@/utils/fetcher";
import { RequestContext, EntryAnalysis } from "@/utils/types";
import {
  contextValidator,
  notNullValidator,
  zodRequestValidator,
} from "@/utils/validator";

export default async function EditorPage(context: RequestContext) {
  const validation = contextValidator(context);

  const { id } = zodRequestValidator(validation);

  const userId = await getUserIdByClerkId();

  const entry = await fetchEntryAndAnalysis(userId, id);

  notNullValidator<EntryAnalysis>(entry.analysis, analysisNotFound);

  return (
    <AnalysisContextProvider
      initialAnalysis={entry.analysis}
      content={entry.content}
    >
      <EntryDateContextProvider initialDate={entry.date}>
        <div className="px-4 md:flex md:h-[calc(100svh-var(--dashboard-nav-height-sm))] lg:pl-8">
          <div className="h-[calc(100svh-11rem)] sm:h-[calc(100svh-7rem)] md:h-[calc(100%-1rem)] md:grow md:basis-full">
            <div className="flex items-center justify-between py-4">
              <EntryDate />
              <DeleteEntry />
            </div>
            <div className="h-[calc(100%-5rem)]">
              <Editor entry={entry} />
            </div>
          </div>
          <div className="divider md:divider-horizontal md:grow-0" />
          <section className="prose sm:mx-auto sm:max-w-2xl md:h-full md:grow-0 md:basis-96 md:self-start">
            <h2 className="font-bold md:mt-6">Analysis</h2>
            <div className="pb-4 md:relative md:h-[calc(100%-5.3rem)]">
              <Analysis />
            </div>
          </section>
        </div>
      </EntryDateContextProvider>
    </AnalysisContextProvider>
  );
}
