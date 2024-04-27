# Lightsheet
A lightweight spreadsheet implementation with minimal dependencies written in TypeScript. Lightsheet implements a standalone core for efficient spreadsheet data management, as well as a simple UI component for displaying data. Lightsheet supports displaying multiple sheets at once with cross-referenced data. 

The API has been designed with extensibility in mind, implementing features such as custom function definitions and an open event system. API methods are described in `main.ts`, and core functionality is documented in the project wiki.

## Installation
- Run `npm install lightsheet`

## Developer guide
### How to run for developement

- Install node on your computer, version 20+
- Run `npm install`
- Run `npm run dev`

### How to build for production

- Install node on your computer, version 20+
- Run `npm install`
- Run `npm run build`
- Use the content of `dist`, check the folder `pure_js_runner_sample` for an example

### Starting work on a new feature
0. Make sure the feature has an issue. If not, create one.
1. Go to the issue. Click "Create a branch" under "Development".
2. Name the branch something meaningful. Use `kebab-case`. Leave out the issue number.

### Finishing work on a feature
1. Preferably, don't squash your commits. Definitely don't squash the commits if you're not the only one who worked on the feature.
2. Lint your code with `npm run lint`.
3. Make a pull request from the feature branch to `main`.
4. Assign someone to review the PR.
