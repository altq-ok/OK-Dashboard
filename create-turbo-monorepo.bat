@echo off
setlocal enabledelayedexpansion

set WORKING_DIR=%CD%

:: Input project name
echo ===========================================
echo   Turborepo Replicator (Basic)
echo ===========================================
set /p "PROJ_NAME=Enter project name (e.g. my-turborepo): "

if "%PROJ_NAME%"=="" (
    echo Project name cannot be empty.
    pause
    exit /b
)

:: Create folders
if exist "%PROJ_NAME%" (
    echo Error: Folder "%PROJ_NAME%" already exists.
    pause
    exit /b
)
mkdir %PROJ_NAME%

echo.
echo [1/5] Creating directory structure...
cd %WORKING_DIR%\%PROJ_NAME%
mkdir apps
mkdir packages
mkdir packages\ui
mkdir packages\ui\src
mkdir packages\typescript-config
mkdir packages\eslint-config

echo [2/5] Creating root configuration files...
(
echo {
echo   "name": "%PROJ_NAME%",
echo   "private": true,
echo   "scripts": {
echo     "build": "turbo run build",
echo     "dev": "turbo run dev",
echo     "lint": "turbo run lint",
echo     "format": "prettier --write \"**/*.{ts,tsx,md}\"",
echo     "check-types": "turbo run check-types"
echo   },
echo   "devDependencies": {
echo     "prettier": "^3.7.4",
echo     "turbo": "^2.7.2",
echo     "typescript": "5.9.2"
echo   },
echo   "packageManager": "pnpm@10.26.2",
echo   "engines": {
echo     "node": ">=18"
echo   }
echo }
) > package.json

:: pnpm-workspace.yaml
(
echo packages:
echo   - "apps/*"
echo   - "packages/*"
) > pnpm-workspace.yaml

:: turbo.json
(
echo {
echo   "$schema": "https://turborepo.com/schema.json",
echo   "ui": "tui",
echo   "tasks": {
echo     "build": {
echo       "dependsOn": ["^build"],
echo       "inputs": ["$TURBO_DEFAULT$", ".env*"],
echo       "outputs": [".next/**", "^!.next/cache/**"]
echo     },
echo     "lint": {
echo       "dependsOn": ["^lint"]
echo     },
echo     "check-types": {
echo       "dependsOn": ["^check-types"]
echo     },
echo     "dev": {
echo       "cache": false,
echo       "persistent": true
echo     }
echo   }
echo }
) > turbo.json

:: .gitignore
(
echo # See https://help.github.com/articles/ignoring-files/ for more about ignoring files.
echo.
echo # Dependencies
echo node_modules
echo .pnp
echo .pnp.js
echo.
echo # Local env files
echo .env
echo .env.local
echo .env.development.local
echo .env.test.local
echo .env.production.local
echo.
echo # Testing
echo coverage
echo.
echo # Turbo
echo .turbo
echo.
echo # Vercel
echo .vercel
echo.
echo # Build Outputs
echo .next/
echo out/
echo build
echo dist
echo.
echo # Debug
echo npm-debug.log*
echo yarn-debug.log*
echo yarn-error.log*
echo.
echo # Misc
echo .DS_Store
echo *.pem
echo.
echo.
) > .gitignore

echo [4/6] Creating shared config packages...

:: eslint-config/package.json
(
echo {
echo   "name": "@repo/eslint-config",
echo   "version": "0.0.0",
echo   "type": "module",
echo   "private": true,
echo   "exports": {
echo     "./base": "./base.js",
echo     "./next-js": "./next.js",
echo     "./react-internal": "./react-internal.js"
echo   },
echo   "devDependencies": {
echo     "@eslint/js": "^9.39.1",
echo     "@next/eslint-plugin-next": "^15.5.0",
echo     "eslint": "^9.39.1",
echo     "eslint-config-prettier": "^10.1.1",
echo     "eslint-plugin-only-warn": "^1.1.0",
echo     "eslint-plugin-react": "^7.37.5",
echo     "eslint-plugin-react-hooks": "^5.2.0",
echo     "eslint-plugin-turbo": "^2.7.1",
echo     "globals": "^16.5.0",
echo     "typescript": "^5.9.2",
echo     "typescript-eslint": "^8.50.0"
echo   }
echo }
) > packages\eslint-config\package.json

:: eslint-config/base.js
(
echo import js from "@eslint/js";
echo import eslintConfigPrettier from "eslint-config-prettier";
echo import turboPlugin from "eslint-plugin-turbo";
echo import tseslint from "typescript-eslint";
echo import onlyWarn from "eslint-plugin-only-warn";
echo.
echo /**
echo  * A shared ESLint configuration for the repository.
echo  *
echo  * @type {import("eslint"^).Linter.Config[]}
echo  * */
echo export const config = [
echo   js.configs.recommended,
echo   eslintConfigPrettier,
echo   ...tseslint.configs.recommended,
echo   {
echo     plugins: {
echo       turbo: turboPlugin,
echo     },
echo     rules: {
echo       "turbo/no-undeclared-env-vars": "warn",
echo     },
echo   },
echo   {
echo     plugins: {
echo       onlyWarn,
echo     },
echo   },
echo   {
echo     ignores: ["dist/**"],
echo   },
echo ];
) > packages\eslint-config\base.js

:: eslint-config/next.js
(
echo import js from "@eslint/js";
echo import { globalIgnores } from "eslint/config";
echo import eslintConfigPrettier from "eslint-config-prettier";
echo import tseslint from "typescript-eslint";
echo import pluginReactHooks from "eslint-plugin-react-hooks";
echo import pluginReact from "eslint-plugin-react";
echo import globals from "globals";
echo import pluginNext from "@next/eslint-plugin-next";
echo import { config as baseConfig } from "./base.js";
echo.
echo /**
echo  * A custom ESLint configuration for libraries that use Next.js.
echo  *
echo  * @type {import("eslint"^).Linter.Config[]}
echo  * */
echo export const nextJsConfig = [
echo   ...baseConfig,
echo   js.configs.recommended,
echo   eslintConfigPrettier,
echo   ...tseslint.configs.recommended,
echo   globalIgnores([
echo     // Default ignores of eslint-config-next:
echo     ".next/**",
echo     "out/**",
echo     "build/**",
echo     "next-env.d.ts",
echo   ]^),
echo   {
echo     ...pluginReact.configs.flat.recommended,
echo     languageOptions: {
echo       ...pluginReact.configs.flat.recommended.languageOptions,
echo       globals: {
echo         ...globals.serviceworker,
echo       },
echo     },
echo   },
echo   {
echo     plugins: {
echo       "@next/next": pluginNext,
echo     },
echo     rules: {
echo       ...pluginNext.configs.recommended.rules,
echo       ...pluginNext.configs["core-web-vitals"].rules,
echo     },
echo   },
echo   {
echo     plugins: {
echo       "react-hooks": pluginReactHooks,
echo     },
echo     settings: { react: { version: "detect" } },
echo     rules: {
echo       ...pluginReactHooks.configs.recommended.rules,
echo       // React scope no longer necessary with new JSX transform.
echo       "react/react-in-jsx-scope": "off",
echo     },
echo   },
echo ];
) > packages\eslint-config\next.js

:: eslint-config/react-internal.js
(
echo import js from "@eslint/js";
echo import eslintConfigPrettier from "eslint-config-prettier";
echo import tseslint from "typescript-eslint";
echo import pluginReactHooks from "eslint-plugin-react-hooks";
echo import pluginReact from "eslint-plugin-react";
echo import globals from "globals";
echo import { config as baseConfig } from "./base.js";
echo.
echo /**
echo  * A custom ESLint configuration for libraries that use React.
echo  *
echo  * @type {import("eslint"^).Linter.Config[]} */
echo export const config = [
echo   ...baseConfig,
echo   js.configs.recommended,
echo   eslintConfigPrettier,
echo   ...tseslint.configs.recommended,
echo   pluginReact.configs.flat.recommended,
echo   {
echo     languageOptions: {
echo       ...pluginReact.configs.flat.recommended.languageOptions,
echo       globals: {
echo         ...globals.serviceworker,
echo         ...globals.browser,
echo       },
echo     },
echo   },
echo   {
echo     plugins: {
echo       "react-hooks": pluginReactHooks,
echo     },
echo     settings: { react: { version: "detect" } },
echo     rules: {
echo       ...pluginReactHooks.configs.recommended.rules,
echo       // React scope no longer necessary with new JSX transform.
echo       "react/react-in-jsx-scope": "off",
echo     },
echo   },
echo ];
) > packages\eslint-config\react-internal.js

:: typescript-config/package.json
(
echo {
echo   "name": "@repo/typescript-config",
echo   "version": "0.0.0",
echo   "private": true,
echo   "publishConfig": {
echo     "access": "public"
echo   }
echo }
) > packages\typescript-config\package.json

:: typescript-config/base.json
(
echo {
echo   "$schema": "https://json.schemastore.org/tsconfig",
echo   "compilerOptions": {
echo     "declaration": true,
echo     "declarationMap": true,
echo     "esModuleInterop": true,
echo     "incremental": false,
echo     "isolatedModules": true,
echo     "lib": ["es2022", "DOM", "DOM.Iterable"],
echo     "module": "NodeNext",
echo     "moduleDetection": "force",
echo     "moduleResolution": "NodeNext",
echo     "noUncheckedIndexedAccess": true,
echo     "resolveJsonModule": true,
echo     "skipLibCheck": true,
echo     "strict": true,
echo     "target": "ES2022"
echo   }
echo }
) > packages\typescript-config\base.json


:: typescript-config/nextjs.json
(
echo {
echo   "$schema": "https://json.schemastore.org/tsconfig",
echo   "extends": "./base.json",
echo   "compilerOptions": {
echo     "plugins": [{ "name": "next" }],
echo     "module": "ESNext",
echo     "moduleResolution": "Bundler",
echo     "allowJs": true,
echo     "jsx": "preserve",
echo     "noEmit": true
echo   }
echo }
) > packages\typescript-config\nextjs.json

:: typescript-config/react-library.json
(
echo {
echo   "$schema": "https://json.schemastore.org/tsconfig",
echo   "extends": "./base.json",
echo   "compilerOptions": {
echo     "jsx": "react-jsx"
echo   }
echo }
) > packages\typescript-config\react-library.json

echo [5/6] Creating shared UI package...

:: packages/ui/package.json
(
echo {
echo   "name": "@repo/ui",
echo   "version": "0.0.0",
echo   "private": true,
echo   "exports": {
echo     "./*": "./src/*.tsx"
echo   },
echo   "scripts": {
echo     "lint": "eslint . --max-warnings 0",
echo     "generate:component": "turbo gen react-component",
echo     "check-types": "tsc --noEmit"
echo   },
echo   "devDependencies": {
echo     "@repo/eslint-config": "workspace:*",
echo     "@repo/typescript-config": "workspace:*",
echo     "@types/node": "^22.15.3",
echo     "@types/react": "19.2.2",
echo     "@types/react-dom": "19.2.2",
echo     "eslint": "^9.39.1",
echo     "typescript": "5.9.2"
echo   },
echo   "dependencies": {
echo     "react": "^19.2.0",
echo     "react-dom": "^19.2.0"
echo   }
echo }
) > packages\ui\package.json

:: packages/ui/tsconfig.json
(
echo {
echo   "extends": "@repo/typescript-config/react-library.json",
echo   "compilerOptions": {
echo     "outDir": "dist"
echo   },
echo   "include": ["src"],
echo   "exclude": ["node_modules", "dist"]
echo }
) > packages\ui\tsconfig.json

:: packages/ui/eslint.config.mjs
(
echo import { config } from "@repo/eslint-config/react-internal";
echo.
echo /** @type {import("eslint"^).Linter.Config} */
echo export default config;
) > packages\ui\eslint.config.mjs

:: packages/ui/src/button.tsx
(
echo "use client";
echo.
echo import { ReactNode } from "react";
echo.
echo interface ButtonProps {
echo   children: ReactNode;
echo   className?: string;
echo   appName: string;
echo }
echo.
echo export const Button = ({ children, className, appName }: ButtonProps^) =^> {
echo   return (
echo     ^<button
echo       className={className}
echo       onClick={(^) =^> alert(`Hello from your ${appName} app!`^)}
echo     ^>
echo       {children}
echo     ^</button^>
echo   ^);
echo };
) > packages\ui\src\button.tsx

:: packages/ui/src/card.tsx
(
echo import { type JSX } from "react";
echo.
echo export function Card({
echo   className,
echo   title,
echo   children,
echo   href,
echo }: {
echo   className?: string;
echo   title: string;
echo   children: React.ReactNode;
echo   href: string;
echo }^): JSX.Element {
echo   return (
echo     ^<a
echo       className={className}
echo       href={`${href}?utm_source=create-turbo^&utm_medium=basic^&utm_campaign=create-turbo"`}
echo       rel="noopener noreferrer"
echo       target="_blank"
echo     ^>
echo       ^<h2^>
echo         {title} ^<span^>-^&gt;^</span^>
echo       ^</h2^>
echo       ^<p^>{children}^</p^>
echo     ^</a^>
echo   ^);
echo }
) > packages\ui\src\card.tsx

:: packages/ui/src/code.tsx
(
echo import { type JSX } from "react";
echo.
echo export function Code({
echo   children,
echo   className,
echo }: {
echo   children: React.ReactNode;
echo   className?: string;
echo }^): JSX.Element {
echo   return ^<code className={className}^>{children}^</code^>;
echo }
) > packages\ui\src\code.tsx

echo [6/6] Finalizing...
echo.
echo ===========================================
echo   Setup complete for: %PROJ_NAME%
echo ===========================================
echo.
echo Next steps:
echo   1. cd %PROJ_NAME%
echo   2. pnpm install
echo   3. cd apps
echo   4. pnpm create next-app@latest web
echo.
pause
