# جئوپاردی فارسی (Persian Jeopardy)

A React + Vite Jeopardy game. Categories and questions are generated **on the fly by the Gemini API** each time you start a match — optionally scoped to a theme you type in.

## Setup

1. Install deps: `npm install`
2. Get a Gemini API key from https://aistudio.google.com/apikey
3. Copy `.env.example` to `.env` and set your key:
   ```
   VITE_GEMINI_API_KEY=your_api_key_here
   ```
4. Run the dev server: `npm run dev`

On the setup screen you can optionally type a theme (e.g. "تاریخ ایران") — leave it blank for a mix of topics. Pressing **شروع رقابت** calls Gemini to build 6 categories × 5 questions and starts the game.

> Note: this is a client-side app, so the key ships in the browser bundle. Use a key you're comfortable exposing (e.g. restricted/low-quota), or proxy the request through a backend for production.

---

## React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
