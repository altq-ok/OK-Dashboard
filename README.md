# OK-Dashboard

OK-Dashboard is built based on `Turborepo`.

Setting up a monorepo with `Turborepo` is as easy as running a below command:

```bash
pnpm create-turbo@latest
```

However, downloading files from GitHub might not be available in some environments and it will block an above command from running.

As an alternative approach, you can create relevant files manually and run a command for the Next.js setup under `/apps` folder. 

## Getting Started

1. Run `create-turbo-monorepo.bat` and input a project name.

The batch script will create required files under a new directory with the project name you specified.
2. Within the project directory, run:

```bash
pnpm createn next-app@latest web
```

Select the rec recommended Next.js defaults if you don't any particular preference.
