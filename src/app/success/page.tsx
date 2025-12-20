import SuccessClient from "./SuccessClient";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function SuccessPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const resolved = await searchParams;
  const rawSessionId = resolved.session_id;
  const sessionId = Array.isArray(rawSessionId) ? rawSessionId[0] : rawSessionId;

  return <SuccessClient sessionId={sessionId} />;
}
