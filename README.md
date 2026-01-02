# OK-Dashboard

OK-Dashboard is built based on `Turborepo`.

Setting up a monorepo with `Turborepo` is as easy as running a below command:

```bash
pnpm create-turbo@latest
```

However, downloading files from GitHub might not be available in some environments and it will block an above command from running.

As an alternative approach, you can create relevant files manually and run a command for the Next.js setup under `/apps` folder. 

## Technical Stack
- **Frontend**: Next.js 16 (React 19), shadcn/ui, Zustand (with persist), nuqs (URL-state sync).
- **Backend**: FastAPI, Uvicorn, uv (Package Management), multiprocessing (Worker management).
- **Data/Sync**: Parquet (Data), JSON (Status/Heartbeat), Portalocker (Windows file locking).

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

This will install all dependencies together, so you don't need to run individual package installation commands below.

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

### Run `pnpm dev`

Enabling hot reload in both Next.js and FastAPI applications is a bit challenging. When `uvicorn --reload` is invoked via `turbo run dev`, the process exits on reload.

While there might be various workarounds, one simple and robust approach is to laucnh the fronend and backend in separate terminals. Run `run-pnpm-dev.bat` which will clean up 3000 and 8000 ports and launch a terminal for each application.

## TL; DR

While core components are relatively complex to provide a robust framework, adding a new widget in frontend and a new data type in backend is pretty simple.

1. Add an engine in Python which saves either dataframe or JSON in a shared drive.
2. Syncer will automatically copy it to your local to minimize network latency.
3. Frontend automatically picks up any changes in the local and send it to a widget.
4. Add a widget to display the communicated data.

## Frontend Implementation

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

```text
pnpm dlx shadcn@latest add sidebar
pnpm dlx shadcn@latest add navigation-menu
pnpm dlx shadcn@latest add sonner
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add dropdown-menu
pnpm dlx shadcn@latest add badge
pnpm dlx shadcn@latest add popover
pnpm dlx shadcn@latest add card
pnpm dlx shadcn@latest add scroll-area
pnpm dlx shadcn@latest add dialog
pnpm dlx shadcn@latest add label
pnpm dlx shadcn@latest add textarea
pnpm dlx shadcn@latest add select
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

### Calendar widget

Install `Schedule-X` with below command:

```bash
pnpm install @schedule-x/react @schedule-x/calendar @schedule-x/theme-default @schedule-x/theme-shadcn @schedule-x/event-modal @schedule-x/events-service temporal-polyfill
```

### Type definitions

This is a monorepo (i.e. both frontend and backend are in the same repository). Although the backend may not be typescript, common type definitions are mainly done in `my-turborepo/packages/types` which enables type sharing between frontend and backend.

If they are not common types, types are defined in `types` folder (e.g. `apps/web/types/dashboard.ts`).

### Link with backend

Since this is a polyglot enviroment (i.e. frontend and backend use different programming languages), the frontend-backend communication is done with JSON.

By defining the data types for communication (i.e. sturcture of the JSON) in both Python (Pydantic models) and Typescript (Interfaces), IDE's auto-completion and linters can help find bugs without actually running the codes. This will make development experience much smoother.

The same structures need to be defined in below folders to enable auto-completion etc.

- **Pydantic models**: `apps/py-api/schemas/*`
- **Typescript interfaces**: `apps/web/types/*`

### Widget registry pattern

To add new widgets, you don't need to touch the core logics.

Add a new widget under `apps/web/components/dashboard/widgets/*-widget.tsx` and register it to `apps/web/types/dashboard.ts` and `apps/web/lib/widget-registry.ts`.

Data flow is structured as below:

- **Widget** => widget can require single / multiple data types and can hold one primary task to monitor.
- **Task** => task can generate single / multiple data types (Parquet files)
- **Data** => various data types (Parquet files)

## Backend Implementation

Backend can be anything as backend is segregated from frontend, but one example is FastAPI (Python). Uvicorn is a light-weight web server required to run FastAPI.

### Install backend packages

Run bellow command to install dependencies:

```bash
# Install Python packages
uv add fastapi uvicorn portalocker pandas pyarrow
```

### How backend handles requests

- **Worker with warm-up**: A separate Python process remains active to pre-load heavy libraries, eliminating import latency for each request. FastAPI communicates with the local Worker process via a Queue-based Producer-Consumer model.

- **Shared state via storage**: Instead of running a server to share state, the application uses a shared network folder as a message bus. UI displays "User X is currently running..." by reading the shared Status JSON.
    - **Status (JSON)**: Tracks real-time progress and "Heartbeats" to monitor worker health.
    - **Snapshots (Parquet)**: Stores high-dimensional calculation results with history management (last 20 versions).

- **Local Mirroring**: To mitigate network latency of the shared drive, files are mirrored to local storage for instant UI responsiveness.

- **Resilient UI**: TanStack Query polls the local FastAPI (which reads the shared folder) to provide seamless toast notifications and data updates. Snapshots are used to share calculation results generated by each user.

### Request execution flow

For separation of concerns, infrastructure logic and business logic are separated:

- `apps/py-api/app/core/`: Infrastructure logic (process management, file locking, status updates etc.).
- `apps/py-api/app/services/`: Business logic (data fetch, data processing etc.).

`core/worker.py` parses a request (JSON) from frontend, and calls a relevant engine from `services/*`.

- `main.py` (FastAPI process) holds both `DataManager` and `StatusManager` with local directory, which mirros a shared directory, to get updates.
- `worker.py` holds `StatusManager` to update stauts in the shared directory. Any engine will publish parquet to the shared directory (calculation results etc.).
- `syncer.py` will copy status and parquet(data) from the shared directory to the local directory to minimize network latency when accessing data from UI.

### Link with frontend

As per the above structure, there are 2 endpoints for the backend API.

1. **status**: frontend does pollilng every 2 seconds to get the current status.
2. **data(parquet)**: frontend gets data once status changed to 'done'.


