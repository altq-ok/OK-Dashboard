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

Within the project apps directory (`apps`), run:

```bash
pnpm create next-app@latest web
```

Select recommended Next.js defaults if you don't have any particular preference.

### Update `apps/web` to run as monorepo

Once `apps/web` folder is created, update "dependencies" in `apps/web/package.json`. It will make monorepo shared packages accessible within the Next.js application.

You need to manually update dependencies when you add more shared packages.

```json
"dependencies": {
  "@repo/ui": "workspace:*",
```

Also, you need to add below lines to `pnpm-workspace.yaml` in the root project folder.

```yaml
# This is required for Next.js application
ignoredBuiltDependencies:
  - sharp
  - unrs-resolver
```

Remove `apps/web/pnpm-lock.yaml` and `apps/web/pnpm-workspace.yaml` since they are customised to run as a standalone Next.js application.

Once removed, run below command in the project root directory.

```bash
# This command will re-generate correct pnpm-lock.yaml and pnpm-workspace.yaml
pnpm install
```

### Add `.prettierrc`

If you don't have any preference, you can copy `.prettierrc` in `my-turborepo`.

```json
{
  "trailingComma": "all",
  "semi": true,
  "tabWidth": 2,
  "singleQuote": true,
  "printWidth": 120,
  "endOfLine": "auto",
  "arrowParens": "always"
}
```

## DIY Instructions

If you want to build a similar dashboard from scratch, you can follow below instructions and customise files in `apps/web`.

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

You can find an updated version of `resizable.tsx` in this repository (`my-turborepo/apps/web/components/ui/resizable.tsx`).

Once an official fix is release, you can re-run an above command to fetch the fix.

#### Other components

Refer to this **[page](https://ui.shadcn.com/docs/components)** for available components.

This project installs:

```bash
pnpm dlx shadcn@latest add sidebar
pnpm dlx shadcn@latest add navigation-menu
pnpm dlx shadcn@latest add sonner
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add dropdown-menu
```

### Original components

Since `shadcn/ui` installs components under `apps/web/components/ui`, I saved dashboard specific components under `apps/web/components/dashboard`.

After running above commands, you can copy these components and customise for your use cases.

### State management

You would want to save states to enable layout changes and restore last-used layout etc.

To save data to URL: `nuqs`
To save data to memory: `zustand`

```bash
pnpm install nuqs zustand
```

Data for Zustand is saved with `apps/web/store/useDashboardStore.ts`.

Layout patterns etc. are saved under `apps/web/lib` (e.g. `layout-templates.ts`)

### Type definitions

This is a monorepo (i.e. both frontend and backend are in the same repository). Although the backend may not be typescript, common type definitions are mainly done in `my-turborepo/packages/types` which enables type sharing between frontend and backend.

If they are not common types, types are defined in `types` folder (e.g. `apps/web/types/dashboard.ts`).

## Backend Implementation

Backend can be anything as backend is segregated from frontend, but one example is Fast-API (Python).

If you install `fastapi` and `uvicorn`, you can run it via `turborepo`.

### Install backend packages

Run bellow command to install packages:

```bash
# Install Python packages
uv add fastapi uvicorn
```

### Run `pnpm dev`

Enabling hot reload in both Next.js and Fast API applications is a bit challenging. When `uvicorn --reload` is invoked via `turbo run dev`, the process exits on reload.

While there might be various workarounds, one simple and robust approach is to laucnh the fronend and backend in separate terminals. Run `run-pnpm-dev.bat` which will clean up 3000 and 8000 ports and launch a terminal for each application.

### Link with frontend

When you want to add a new widget, there will be 3 steps:

1. Define interface(type) in `apps/web/types`. It will enable auto-completion.
2. Create custom hook in `apps/web/hooks`. Use `useQuery` and encapculate a fetch logic.

