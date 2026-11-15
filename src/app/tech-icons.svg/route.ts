import { techSprite } from "@/components/ui/tech-icons";

/**
 * Serves every technology logo as a single SVG sprite.
 *
 * `TechIcon` links to it with a content hash in the URL (`?v=...`), so the
 * response can be cached forever: the URL changes whenever the icons do.
 */
export function GET() {
  return new Response(techSprite, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
