/**
 * Cloudinary delivers whatever was uploaded unless you ask otherwise — which
 * for this site meant several 1.5MB PNGs. Injecting transformations into the
 * URL makes Cloudinary re-encode on the fly and cache the result:
 *
 *   f_auto  pick the best format the browser accepts (AVIF/WebP)
 *   q_auto  quality tuned per image rather than a fixed number
 *   w_<n>   cap the width at roughly 2x the largest rendered size
 *
 * Anything that is not a Cloudinary URL passes straight through.
 */
export function cld(url: string, width: number): string {
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;
  if (/\/upload\/[^/]*[fq]_auto/.test(url)) return url; // already transformed

  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`);
}
