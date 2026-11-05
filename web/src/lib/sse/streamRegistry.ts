/**
 * Every open stream registers here so one call can cancel them all, for
 * example when the round is paused or ended, or the team logs out
 * (handbook §5: "all active SSE streams aborted").
 */
const controllers = new Map<string, AbortController>();

export function registerStream(id: string): AbortController {
  controllers.get(id)?.abort();
  const controller = new AbortController();
  controllers.set(id, controller);
  return controller;
}

export function releaseStream(id: string, controller: AbortController): void {
  if (controllers.get(id) === controller) controllers.delete(id);
}

export function abortStream(id: string): void {
  controllers.get(id)?.abort();
  controllers.delete(id);
}

export function abortAllStreams(): void {
  controllers.forEach((controller) => controller.abort());
  controllers.clear();
}
