/**
 * Split a content title into the brand's headline form: the first sentence
 * solid, the rest in the gradient. A single-sentence title stays solid.
 */
export function splitTitle(title: string): { lead: string; gradient?: string } {
  const m = /^(.+?[.!?])\s+(.+)$/.exec(title);
  return m ? { lead: m[1], gradient: m[2] } : { lead: title };
}
