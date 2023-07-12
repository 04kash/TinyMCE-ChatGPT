import { createLLMService } from "usellm";
 
export const runtime = "edge";
 
const llmService = createLLMService({
  openaiApiKey: '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',
  actions: ["chat"],
});
 
export async function POST(request: Request) {
  const body = await request.json();
 
  // add authentication and rate limiting here
 
  try {
    const { result } = await llmService.handle({ body, request });
    return new Response(result, { status: 200 });
  } catch (error: any) {
    return new Response(error.message, { status: error?.status || 400 });
  }
}