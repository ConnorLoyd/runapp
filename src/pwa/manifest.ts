export function getManifest(): string {
  return JSON.stringify({
    name: "Turf — Territory Running Game",
    short_name: "Turf",
    description: "A social running game where you and your people fight for the places you actually run.",
    start_url: "/",
    display: "standalone",
    background_color: "#08080c",
    theme_color: "#ff6a00",
    orientation: "portrait",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  });
}
