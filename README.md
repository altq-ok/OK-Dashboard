# OK-Dashboard

OK-Dashboard is built based on `Turborepo`.

Setting up a monorepo with `Turborepo` is as easy as running a below command:

```bash
pnpm create-turbo@latest
```

However, downloading files from GitHub might not be available in some environments and it will block an above command from running.

As an alternative approach, you can create relevant files manually and run a command for the Next.js setup under `/apps` folder. 

## Getting Started

### Run `create-turbo-monorepo.bat` and input a project name.

The batch script will create required files under a new directory with the project name you specified.

---

### Within the project directory, run:

```bash
pnpm createn next-app@latest web
```

Select the rec recommended Next.js defaults if you don't any particular preference.

---

### Once `apps/web` folder is created, update "dependencies" in `package.json` under `web`.

This is required to make the Next.js project to recognise shared packages. For example:

```json
  "dependencies": {
    "@repo/ui": "workspace:*",
```

---

### Remove automatically generated `pnpm-lock.yaml` and `pnpm-workspace.yaml` under `apps/web`.

Monorepo should have only one lock file and pnpm-workspace under root. Then, add below lines to `pnpm-workspace.yaml` under root.

```yaml
ignoredBuiltDependencies:
  - sharp
  - unrs-resolver
```

Then, run `pnpm install` in both root and `apps/web` which will create monorepo compatible `pnpm-lock.yaml` and `pnpm-workspace.yaml`.

## DIY Instructions

If you want to build a similar dashboard from scratch, you can follow below instructions and customise them to fit your own needs.

### Install shadcn/ui

Run below command in `apps/web`:

```bash
pnpm dlx shadcn@latest init

```

### Add shadcn components

#### Resizable

Refer to this **[page](https://ui.shadcn.com/docs/components/resizable)** for details.
