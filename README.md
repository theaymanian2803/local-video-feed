# Local Video Feed

Build a web application that functions as a vertical video scrolling feed, similar to Tango or TikTok. This app will be used entirely locally and needs to load and play video files directly from my machine.

Core Interface & Layout:

Create a mobile-first, full-screen vertical scrolling feed.

Each video should take up the entire viewport.

Snap-scrolling should be enabled so users easily snap to the next or previous video when scrolling down or up.

Data Handling:

Include a prominent "Select Folder" or "Upload Videos" button on the initial screen using the HTML <input type="file" webkitdirectory multiple> or standard multiple file input so I can load local .mp4, .webm, or .mov files.

The app should map these local files to object URLs (URL.createObjectURL) to feed into the video player list.

Video Player Features (Overlay Controls):

Play/Pause: Tapping the center of the screen should toggle play and pause. Show a temporary fading icon for play/pause status.

Slow Motion: Add a floating button on the side or bottom right that toggles playback speed between normal (1.0x) and slow motion (0.5x or 0.25x).

Zoom In: Implement a zoom functionality. Allow users to double-tap to zoom in (e.g., 2x scale) and pan around, or provide a UI slider to control the video container's CSS transform scale.

Styling:

Use a dark mode aesthetic with minimal, transparent overlay buttons so the video remains the primary focus. Ensure all controls are clearly visible over light and dark videos.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f0f9f5ac-24de-4052-98de-3ef8bc545603).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
