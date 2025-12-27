# OK-Dashboard

OK-Dashboard is built based on `Turborepo`.

Setting up a monorepo with `Turborepo` is as easy as running a below command:

```bash
pnpm create-turbo@latest
```

However, downloading files from GitHub might not be available in some environments and it will block an above command from running.

As an alternative approach, you can create relevant files manually and run a command for the Next.js setup under `/apps` folder. 

## Getting Started

### Create monorepo (Turbrepo replication)

Run `create-turbo-monorepo.bat` and input a project name.

The batch script will create required files under a new directory with the project name you specified.

### Create Next.js application within monorepo (`apps/web`)

Within the project directory, run:

```bash
pnpm createn next-app@latest web
```

Select recommended Next.js defaults if you don't have any particular preference.

### Update `apps/web` to run as monorepo

Once `apps/web` folder is created, update "dependencies" in `apps/web/package.json`. It will make monorepo shared packages accessible within the Next.js application.

You need to manually update dependencies when you add more shared packages.

```json
"dependencies": {
  "@repo/ui": "workspace:*",
```

Remove `apps/web/pnpm-lock.yaml` and `apps/web/pnpm-workspace.yaml` since they are customised to run as a standalone Next.js application.

Once removed, run below command in the project root directory and in `apps/web`.

```bash
# This command will re-generate correct pnpm-lock.yaml and pnpm-workspace.yaml
pnpm install
```

Also, you need to add below lines to `pnpm-workspace.yaml` in the root project folder.

```yaml
# This is required for Next.js application
ignoredBuiltDependencies:
  - sharp
  - unrs-resolver
```

## DIY Instructions

If you want to build a similar dashboard from scratch, you can follow below instructions and customise them to fit your own needs.

### Install shadcn/ui

Run below command in `apps/web`:

```bash
pnpm dlx shadcn@latest init
```

You can select any colour you prefer when prompted. Default is Natural.

### Add shadcn components

#### Resizable

Refer to this **[page](https://ui.shadcn.com/docs/components/resizable)** for details.

Install with:

```bash
pnpm dlx shadcn@latest add resizable
```

`react-resizable-panels` has been updated to v4, and it has some major changes. `resizable.tsx` shipped with above command is broken, and you can either manually fix it or install `react-resizable-panels@v2.1.7` for compatibility.

If you want to use v4 and fix the issues by yourself, update class names to `{ Group, Panel, Separator }` and change all `data` instances to `aria`. For `Separator`, it defines orientation of a separator, thus e.g. `data-[panel-group-direction=vertical]` changes to `aria-[orientation=horizontal]`.

You can find an updated version of `resizable.tsx` is in this repository (`my-turborepo/apps/web/components/ui/resizable.tsx`).



