# Immich Share Prompter

This project is a companion to [Immich](https://github.com/immich-app/immich). It periodically sends subscribed Immich users a notification prompting them to share a recent photo via email.

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
docker build --target dev -t immich-share-prompter:dev .
docker run --rm -p 5173:5173 -v $PWD:/app immich-share-prompter:dev
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
