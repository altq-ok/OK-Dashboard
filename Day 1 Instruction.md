Tailwind CSS v4 と daisyUI v5 (beta) を使い、Schedule-X でカレンダーを表示して、クリックで詳細（daisyUIのModal）を出すサンプルコードを作成しました。

モノレポの `apps/web` 内で作る想定です。

### 0. 準備（ライブラリのインストール）

まず、必要なパッケージをインストールします。

```bash
# Tailwind v4 と daisyUI v5 (beta)
npm install tailwindcss@next @tailwindcss/postcss@next daisyui@beta

# Schedule-X (カレンダー本体とReact用ラッパー)
npm install @schedule-x/react @schedule-x/calendar @schedule-x/theme-default
```

---

### 1. `globals.css` (Tailwind v4 設定)

v4では `tailwind.config.js` ではなく、CSSファイルに直接記述します。

```css
/* apps/web/app/globals.css */
@import "tailwindcss";

/* daisyUI v5 のプラグイン読み込み */
@plugin "daisyui";

/* Schedule-X のテーマをインポート */
@import "@schedule-x/theme-default/dist/index.css";

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 214, 219, 220;
  --background-end-rgb: 255, 255, 255;
}
```

---

### 2. カレンダーコンポーネント

カレンダーはブラウザ側で動く必要があるため、`'use client'` を指定します。

```tsx
// apps/web/components/DashboardCalendar.tsx
'use client';

import { useCalendarApp, ScheduleXCalendar } from '@schedule-x/react';
import { createViewMonthGrid } from '@schedule-x/calendar';
import { useState, useEffect } from 'react';

export default function DashboardCalendar() {
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  // カレンダーの設定
  const calendar = useCalendarApp({
    views: [createViewMonthGrid()],
    events: [
      {
        id: '1',
        title: 'チームミーティング',
        start: '2025-12-25 10:00',
        end: '2025-12-25 11:00',
        description: 'プロジェクトの進捗確認'
      },
      {
        id: '2',
        title: 'デザインレビュー',
        start: '2025-12-26 14:00',
        end: '2025-12-26 15:30',
        description: 'ダッシュボードのUI確認'
      }
    ],
    // イベントクリック時の動作
    callbacks: {
      onEventClick(calendarEvent) {
        setSelectedEvent(calendarEvent);
        // daisyUIのModalを開く（HTMLのshowModalメソッドを使用）
        (document.getElementById('event_modal') as HTMLDialogElement).showModal();
      },
    },
  });

  return (
    <div className="h-[600px] w-full border rounded-lg overflow-hidden shadow-sm bg-base-100">
      <ScheduleXCalendar calendarApp={calendar} />

      {/* daisyUI Modal: 詳細表示用 */}
      <dialog id="event_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">{selectedEvent?.title}</h3>
          <div className="py-4">
            <p className="text-sm text-gray-500">時間: {selectedEvent?.start} 〜 {selectedEvent?.end}</p>
            <p className="mt-2">{selectedEvent?.description}</p>
          </div>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn">閉じる</button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
}
```

---

### 3. ダッシュボード画面（画面分割レイアウト）

`layout.tsx` ではなく、各機能（calendar等）をコンポーネントとして配置する構成です。

```tsx
// apps/web/app/dashboard/page.tsx
import DashboardCalendar from '@/components/DashboardCalendar';

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-base-200 p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">ダッシュボード</h1>
        <p className="text-base-content/60">チームの最新状況を一目で確認</p>
      </header>

      {/* 画面分割：グリッドレイアウト */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* 左側：メインのカレンダー (2カラム分) */}
        <div className="xl:col-span-2 space-y-6">
          <section className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title mb-4">カレンダー</h2>
              <DashboardCalendar />
            </div>
          </section>
        </div>

        {/* 右側：サイド情報 (1カラム分) */}
        <div className="space-y-6">
          {/* 統計カード */}
          <div className="stats stats-vertical shadow w-full bg-base-100">
            <div className="stat">
              <div className="stat-title">今月のイベント数</div>
              <div className="stat-value">12</div>
              <div className="stat-desc">先月比 +2件</div>
            </div>
            <div className="stat">
              <div className="stat-title">完了したタスク</div>
              <div className="stat-value text-primary">85%</div>
              <div className="stat-desc text-primary">順調です</div>
            </div>
          </div>

          {/* お知らせセクション */}
          <div className="card bg-primary text-primary-content shadow-xl">
            <div className="card-body">
              <h2 className="card-title">お知らせ</h2>
              <p>Tailwind v4 への移行が完了しました！</p>
              <div className="card-actions justify-end">
                <button className="btn btn-sm">確認</button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
```

---

### このコードのポイント（学習用）

1.  **Tailwind v4 / daisyUI v5:**
    *   `className="card bg-base-100 shadow-xl"` のように、daisyUIのクラスを組み合わせてデザインしています。設定がCSSファイルに集約されているので、設定ファイルに迷うことがありません。
2.  **Schedule-X の軽量さ:**
    *   `useCalendarApp` フックで設定を作るだけなので、非常に宣言的（Reactらしい書き方）です。
    *   `onEventClick` でイベントデータを取得し、それを React の `useState` に渡す流れは、TypeScriptの学習に最適です。
3.  **Modalの仕組み:**
    *   daisyUIのModalは、ブラウザ標準の `<dialog>` タグを使っています。`showModal()` を呼ぶだけでアクセシブルなポップアップが作れます。
4.  **画面分割（Responsive Grid）:**
    *   `grid-cols-1 xl:grid-cols-3` を使うことで、「スマホでは縦一列、PC（XLサイズ）ではカレンダーを大きく、横にサイドバーを置く」というレスポンシブな分割が簡単に実現できます。

### 次のステップへのアドバイス
これをベースに、`apps/web/app/dashboard/` の下に新しいフォルダを作ったり、サイドバーに `Link` コンポーネントを追加してページ遷移を学んだりしていくのが良いと思います！
