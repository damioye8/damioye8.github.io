# Damilare Oyewale — COS 106 portfolio

Responsive five-page portfolio and academic planner built with plain HTML, CSS and JavaScript. No installation or build step is required.

## Pages

- `index.html`: biography, portrait and project introductions.
- `about.html`: education table, skills, career goals and interests.
- `projects.html`: three clearly labelled concept projects with illustrative SVG mockups and 30-second Canva videos, with on-screen explanations, playback controls and no autoplay.
- `planner.html`: add, complete, filter and delete tasks, with browser persistence.
- `contact.html`: required-field, email and digits-only phone validation, followed by an explicit email-draft link.

## Preview

Open `index.html` in a modern browser. For reliable storage behaviour, use an HTTP server or the hosted website. If Python is available, run `python -m http.server 8000` in this folder and visit `http://localhost:8000`.

## Publish with GitHub Pages

1. Sign in to GitHub as `damioye8`.
2. Create a public repository named `damioye8.github.io` (or use another available name).
3. Upload the CONTENTS of this portfolio folder to the repository root, preserving the `assets` folder. `index.html` must be at the repository root.
4. Commit the files to the main branch.
5. Open Settings > Pages. Under Build and deployment, choose Deploy from a branch, then `main` and `/ (root)`, and save.
6. Wait for GitHub's deployment to finish. Use the URL GitHub reports, then test all five pages and assets.
7. Submit the verified live URL and repository URL. The anticipated URL for the proposed name is `https://damioye8.github.io/`. This is an expected address, not a verified deployment.

GitHub guide: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site

## Netlify alternative

Import the GitHub repository into Netlify. Leave the build command empty and publish the repository root. Alternatively, use Netlify's manual deployment with this folder. Confirm the actual deployment URL before submission.

## Limitations

- Planner data stays on the current browser and origin. It does not sync between devices. Clearing browser data removes it.
- The contact form does not send server-side mail. Visitors open the generated draft and send it from their email app.
- The concept projects do not implement actual AI, finance, farming or threat-detection services.
- The concept videos use on-screen explanations and have no audio.
- The website uses no third-party frameworks, remote fonts or analytics.

## Files to maintain

Edit page content in the HTML files, visual design in `assets/style.css`, and behaviour in `assets/app.js`. The original photograph came from Damilare. Project illustrations are original SVG interface mockups. Do not present their sample values as product performance data.

## Before submission

Check desktop and mobile layouts, keyboard navigation, task persistence, all contact error cases, video playback, and both submitted links. Review the supporting documentation and practise explaining the code in your own words.

