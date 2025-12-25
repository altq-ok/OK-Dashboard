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


**はい、実は今のうちに入れてしまう方が「簡単」かつ「後が楽」です！**

理由は、後から「グリッドレイアウト（Grid）」を「パネル分割」に書き換えるよりも、**最初から「パネルという器」の中に各機能を入れていく方が、コンポーネントのサイズ設計（レスポンシブ対応など）がスムーズに決まるから**です。

今すぐ導入するための、最短のステップとコード例を紹介します。

---

### 1. ライブラリの追加

```bash
npm install react-resizable-panels
```

---

### 2. ダッシュボード画面を「分割対応」に書き換える

先ほどの `app/dashboard/page.tsx` を、パネル分割ライブラリを使った形にアップデートします。

```tsx
// apps/web/app/dashboard/page.tsx
'use client'; // パネル分割はクライアント側での動作が必要

import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import DashboardCalendar from '@/components/DashboardCalendar';

export default function DashboardPage() {
  return (
    <main className="h-screen w-full bg-base-200 flex flex-col">
      {/* ヘッダー部分は固定 */}
      <header className="p-4 bg-base-100 border-b border-base-300 flex justify-between items-center">
        <h1 className="text-xl font-bold">Team Dashboard</h1>
        <div className="badge badge-primary">Tailwind v4 + daisyUI</div>
      </header>

      {/* メインコンテンツ：ここが分割パネルになる */}
      <div className="flex-1 overflow-hidden p-2">
        <PanelGroup direction="horizontal">
          
          {/* 左側：メイン機能（カレンダー） */}
          <Panel defaultSize={70} minSize={30}>
            <div className="h-full p-2">
              <div className="card bg-base-100 shadow-xl h-full overflow-hidden">
                <div className="card-body p-4 h-full flex flex-col">
                  <h2 className="card-title text-sm mb-2">カレンダー</h2>
                  <div className="flex-1 overflow-hidden border rounded-lg">
                    <DashboardCalendar />
                  </div>
                </div>
              </div>
            </div>
          </Panel>

          {/* ドラッグできる境界線（ハンドル） */}
          <PanelResizeHandle className="w-1.5 hover:w-2 bg-transparent hover:bg-primary/30 transition-all duration-300 relative group">
            {/* 視覚的な「つまみ」の線 */}
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2px] bg-base-300 group-hover:bg-primary rounded-full my-4" />
          </PanelResizeHandle>

          {/* 右側：サブ機能（統計・お知らせなど） */}
          <Panel defaultSize={30} minSize={20}>
            <div className="h-full p-2 flex flex-col gap-4">
              
              {/* 統計カード */}
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body p-4">
                  <h2 className="card-title text-sm">統計情報</h2>
                  <div className="stats stats-vertical shadow-inner bg-base-200/50">
                    <div className="stat p-2">
                      <div className="stat-title text-xs">今月のタスク</div>
                      <div className="stat-value text-xl">12</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* お知らせ */}
              <div className="card bg-primary text-primary-content shadow-xl flex-1">
                <div className="card-body p-4 text-sm">
                  <h2 className="card-title text-sm">Update</h2>
                  <p>パネルをドラッグして広げてみてください！</p>
                </div>
              </div>

            </div>
          </Panel>

        </PanelGroup>
      </div>
    </main>
  );
}
```

---

### 3. なぜ「今」入れるのがいいのか？

1.  **「高さ」の意識がつく:**
    ダッシュボードを作っていると、「カレンダーが画面からはみ出す」といった問題によく直面します。パネル分割を入れると強制的に `h-full` や `overflow-hidden` を意識することになるので、結果として**破綻しにくい綺麗なレイアウト**になります。
2.  **チームのテンションが上がる:**
    マウスで境界線を動かせるだけで、一気に「本物のツールを作っている感」が出ます。初心者チームにとって、この「動かせる楽しさ」は学習の大きなガソリンになります。
3.  **daisyUIとの相性が抜群:**
    コード例のように、daisyUIの `card` を `Panel` の中に入れるだけで、枠線や影が綺麗に収まります。

### 4. 成功のための小さなコツ

*   **境界線（Handle）のデザイン:** 
    上記のコードでは `bg-transparent hover:bg-primary/30` を使っています。最初は透明だけど、マウスを近づけると青く光るようなデザインです。これは最新のモダンなUIでよく使われる手法です。
*   **スマホ対応:** 
    `react-resizable-panels` は便利ですが、スマホ（狭い画面）だとドラッグが難しくなります。将来的には、画面幅が狭いときは `direction="vertical"`（縦並び）に変える、といったコードを1行足すだけで対応可能です。

これで、見た目も操作感も「超モダン」なスタックが揃いました！
**Next.js (App Router) + Tailwind v4 + daisyUI + Schedule-X + Resizable Panels**。
これだけ揃っていれば、どんな多機能ダッシュボードでも作れる最強の土台です。

そのアイデア、実は**「スロット（枠）に機能をはめ込む」**という考え方をすると、非常にスッキリと、かつ「凄そうな」UIが作れます！

「この場所にはAを表示、あっちにはBを表示」とユーザーが選べる仕組みを、初心者チームでも実装しやすい**「スロット・セレクター方式」**で考えてみましょう。

### 実装のイメージ：スロット・システム

1.  **スロットを作る**: 画面を2分割や3分割して、最初は空っぽの「スロット」を用意します。
2.  **クリックして選ぶ**: 空のスロットにある「＋」ボタンを押すと、daisyUIのドロップダウン（ポップアップ）が出てきて、A（カレンダー）、B（グラフ）、C（タスク）を選択。
3.  **はめ込む**: 選んだコンポーネントがそのスロットに表示される。

---

### サンプルコード：動的スロット・ダッシュボード

これを実現するための核となるコード例です。

```tsx
'use client';

import { useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import DashboardCalendar from '@/components/DashboardCalendar';

// 1. 利用可能な機能の定義
const FEATURES = {
  CALENDAR: { id: 'calendar', name: 'カレンダー', component: <DashboardCalendar /> },
  ANALYTICS: { id: 'analytics', name: '分析グラフ', component: <div className="p-10">📈 グラフ画面</div> },
  TASKS: { id: 'tasks', name: 'タスク一覧', component: <div className="p-10">✅ タスク一覧</div> },
};

export default function DynamicDashboard() {
  // スロットの状態管理（どのスロットに何が入っているか）
  const [slotLeft, setSlotLeft] = useState<string | null>('calendar');
  const [slotRight, setSlotRight] = useState<string | null>(null);
  const [isFocusMode, setIsFocusMode] = useState(false);

  // スロットに機能を表示する関数
  const renderFeature = (featureId: string | null, onSelect: (id: string) => void) => {
    if (!featureId) {
      // 空のスロット：選択メニュー（ポップアップ）を表示
      return (
        <div className="h-full flex items-center justify-center border-2 border-dashed border-base-300 rounded-xl">
          <div className="dropdown dropdown-center">
            <button tabIndex={0} className="btn btn-outline btn-primary">＋ 機能を選択</button>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 border border-base-200">
              {Object.values(FEATURES).map((f) => (
                <li key={f.id}><a onClick={() => onSelect(f.id)}>{f.name}</a></li>
              ))}
            </ul>
          </div>
        </div>
      );
    }
    // 機能が選択されている場合
    const feature = Object.values(FEATURES).find(f => f.id === featureId);
    return (
      <div className="h-full bg-base-100 shadow-xl rounded-xl relative overflow-hidden">
        <button 
          className="absolute top-2 right-2 btn btn-xs btn-circle btn-ghost"
          onClick={() => onSelect('')} // バツ印でリセット
        >✕</button>
        {feature?.component}
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-base-200 p-4 gap-4">
      {/* モード切替ヘッダー */}
      <header className="flex justify-between items-center bg-base-100 p-4 rounded-xl shadow">
        <h1 className="font-bold">My Custom Dashboard</h1>
        <div className="flex gap-2">
          <button 
            className={`btn btn-sm ${!isFocusMode ? 'btn-primary' : ''}`}
            onClick={() => setIsFocusMode(false)}
          >分割モード</button>
          <button 
            className={`btn btn-sm ${isFocusMode ? 'btn-primary' : ''}`}
            onClick={() => setIsFocusMode(true)}
          >集中モード</button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        {isFocusMode ? (
          // 集中モード：左スロットだけを全画面表示
          <div className="h-full">
            {renderFeature(slotLeft, setSlotLeft)}
          </div>
        ) : (
          // 分割モード：パネル分割
          <PanelGroup direction="horizontal">
            <Panel defaultSize={50}>
              <div className="h-full px-2">
                {renderFeature(slotLeft, setSlotLeft)}
              </div>
            </Panel>
            <PanelResizeHandle className="w-1 bg-base-300 mx-1 rounded-full" />
            <Panel defaultSize={50}>
              <div className="h-full px-2">
                {renderFeature(slotRight, setSlotRight)}
              </div>
            </Panel>
          </PanelGroup>
        )}
      </div>
    </div>
  );
}
```

---

### この設計の「使いやすさ」のポイント

1.  **「＋ 機能を選択」ボタン**:
    daisyUIの `dropdown` を使っています。クリックするとポップアップが出てきて、そこから機能（A, B, C）を選ぶ体験は、非常に直感的です。
2.  **集中モードの切り替え**:
    ボタン一つで、スロット1つ（全画面）と、スロット2つ（分割）を切り替えられます。内部的には `if (isFocusMode)` で出し分けているだけなので、仕組みはシンプルです。
3.  **スロットの自由度**:
    左にカレンダーを出して、右にグラフを出す。あるいは、左を空にして右だけ使う、といったことがユーザーの自由になります。
4.  **拡張性**:
    新しい機能「D」を作りたくなったら、`FEATURES` オブジェクトに一行追加するだけで、選択肢に自動で現れます。

### チームでの開発アドバイス

この「スロット方式」にすると、チームメンバーに仕事を振りやすくなります。

*   **Aさん**: 「カレンダー」のコンポーネントを磨き上げる。
*   **Bさん**: 「グラフ」のコンポーネントを作る。
*   **あなた**: この「ダッシュボードの枠組み（スロット・システム）」を完成させる。

それぞれが独立して作れるので、モノレポでの開発にも非常に向いています。
「自分で場所を選んで開く」という操作感は、ユーザーに「自分専用の道具」を使っている実感を与えられるので、ぜひ挑戦してみてください！

**Considering Panel Count**

I've been examining the capabilities of `react-resizable-panels`. My initial thoughts focused on confirming its flexibility regarding panel count. I've confirmed it can indeed accommodate scenarios with three or even a single panel, diverging from the initial two-panel assumption. I am now looking at the under-the-hood flexibility features. I am also investigating whether Tailwind CSS v4 has a role.


**Expanding Layout Options**

I've been exploring how to implement various panel arrangements. It's clear `react-resizable-panels` isn't limited by the original two-panel assumption. Adding `<Panel>` and `<PanelResizeHandle>` components allows for any number of panels. I'm focusing on demonstrating single-panel scenarios through conditional rendering and nesting `PanelGroup` components for complex horizontal and vertical splits, including three-panel layouts. I'm getting pretty good at this.


**Developing Complex Nesting**

I'm now integrating a vertical `PanelGroup` within a horizontal `Panel`, aiming for greater layout flexibility. I'm exploring the `onCollapse` prop and React state to hide panels, enhancing responsiveness. My focus is on ensuring Tailwind v4 compatibility throughout this deep nesting and complex collapsible behavior. The tone's staying encouraging, of course.


