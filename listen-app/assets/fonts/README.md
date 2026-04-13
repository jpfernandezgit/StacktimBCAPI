# Bundled fonts

Drop the two font files referenced from `app/_layout.tsx` here:

- `SpaceMono-Regular.ttf` — https://fonts.google.com/specimen/Space+Mono (Apache 2.0)
- `DMSans-Regular.ttf` — https://fonts.google.com/specimen/DM+Sans (OFL)

Both are free to redistribute with the app. They are not committed to git to
keep the repo small; the CI pipeline can fetch them as a build step, or a
developer can drop them manually before running `npx expo start`.
