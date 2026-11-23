import { apiData } from '@/shared/api/client';

export type Agreement = { termsType: string; version: string; agreed: boolean };

type Term = {
  termsType: string;
  version: string;
  title: string;
  signupConsent: 'REQUIRED' | 'OPTIONAL' | 'NONE';
  url: string | null;
};

export async function getTerms(signal?: AbortSignal) {
  const data = await apiData<{ content: Term[] }>(
    { method: 'GET', url: '/v1/terms', signal },
    { auth: false },
  );
  if (!Array.isArray(data?.content)) throw new Error('약관 목록을 불러오지 못했어요.');
  return data.content;
}
