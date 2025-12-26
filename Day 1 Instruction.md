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

結論から言うと、**「自由自在」**です。

`react-resizable-panels` は非常に柔軟で、3つ、4つと増やすことも、上下左右を組み合わせる（入れ子にする）ことも、あるいは特定のパネルを消して1つにすることも簡単にできます。

具体的なパターンを3つ紹介します。

---

### 1. 3つ以上のパネルを並べる
単に `<Panel>` と `<PanelResizeHandle>` を交互に増やすだけです。

```tsx
<PanelGroup direction="horizontal">
  <Panel>左：メニュー</Panel>
  <PanelResizeHandle />
  
  <Panel>中：カレンダー</Panel>
  <PanelResizeHandle />
  
  <Panel>右：詳細情報</Panel>
</PanelGroup>
```

### 2. 「1つにする（消す）」ことも可能
Reactのステート（`useState`）を使って、パネルを表示・非表示にできます。
例えば「サイドバーを閉じるボタン」を作りたい場合はこうなります。

```tsx
const [showSidebar, setShowSidebar] = useState(true);

return (
  <PanelGroup direction="horizontal">
    {showSidebar && (
      <>
        <Panel defaultSize={20}>サイドバー</Panel>
        <PanelResizeHandle />
      </>
    )}
    <Panel>メインコンテンツ（ここが広がります）</Panel>
  </PanelGroup>
);
```
※ `showSidebar` が `false` になれば、自動的にメインパネルが画面いっぱいに広がります。

### 3. 上下と左右を組み合わせる（入れ子）
これがダッシュボードでは一番強力です。「全体を左右に分けて、右側だけをさらに上下に分ける」といった構成ができます。

```tsx
<PanelGroup direction="horizontal">
  {/* 左：ナビゲーション */}
  <Panel defaultSize={20}>サイドナビ</Panel>
  
  <PanelResizeHandle />

  {/* 右：メインエリア（ここを上下に分ける） */}
  <Panel>
    <PanelGroup direction="vertical">
      <Panel defaultSize={70}>上の画面：カレンダー</Panel>
      
      <PanelResizeHandle />
      
      <Panel defaultSize={30}>下の画面：ログや通知</Panel>
    </PanelGroup>
  </Panel>
</PanelGroup>
```

---

### ベストプラクティス：最初は「2つ」から始めよう

いきなり3分割や入れ子にするとコードが複雑になるので、初心者のうちは以下のステップがおすすめです。

1.  **まずは「左右2分割」で作る**（左：メイン、右：サブ）。
2.  **慣れてきたら「表示・非表示」を付ける**（ボタンで右パネルを消せるようにする）。
3.  **機能が増えたら「3分割」や「上下分割」を検討する。**

### チームへのアドバイス
このライブラリのいいところは、**「後からパネルを増やしたり減らしたりするのが、HTMLをいじる感覚で非常に簡単」**という点です。

「今は2つだけど、将来チャット機能を入れたいから右端に3つ目のパネルを追加しよう」といった拡張が、全体のレイアウトを壊さずに数行の修正で済みます。

この柔軟性があるからこそ、今のうちに入れておく価値があるんです！

ご提示いただいた詳細は、まさに**「モダンなWebデスクトップ」**のような非常に高度で使い勝手の良い設計です。

結論から申し上げますと、**これまでに提案した構成（Next.js + Tailwind v4 + daisyUI + react-resizable-panels）で、すべて実現可能**です。

ただし、ご希望の「レイアウト変更時も状態を維持する」「優先度に基づいて機能を閉じる」といった高度な動きを実現するために、**「状態管理（Zustand）」**と**「コンポーネントのレジストリ方式」**という2つの概念を組み合わせるのがベストです。

以下に、その設計図をまとめました。

---

### 1. チーム開発を支える「機能レジストリ」方式

メンバーが自由に機能を追加できるようにするために、`features` を一箇所に登録する場所を作ります。

```typescript
// apps/web/features/registry.tsx
import { CalendarFeature } from './calendar';
import { AnalyticsFeature } from './analytics';
import { TaskFeature } from './tasks';

// チームメンバーはここに自分のコンポーネントを足すだけ
export const FEATURE_REGISTRY = {
  calendar: { name: 'カレンダー', component: CalendarFeature, icon: '📅' },
  analytics: { name: '分析', component: AnalyticsFeature, icon: '📈' },
  tasks: { name: 'タスク', component: TaskFeature, icon: '✅' },
};

export type FeatureId = keyof typeof FEATURE_REGISTRY;
```

---

### 2. レイアウトと状態を管理する「脳 (Zustand)」

レイアウトを変更しても「今何を開いているか」を維持するために、グローバルな状態管理ライブラリ **Zustand**（ズスタンド）を使うのがおすすめです。非常に軽量でNext.jsと相性が良いです。

```typescript
// apps/web/store/useLayoutStore.ts
import { create } from 'zustand';

interface LayoutState {
  // 今開いている機能のIDの配列（左から順）
  openFeatures: FeatureId[]; 
  // 現在のレイアウトモード（1:全画面, 2:二分割, 3:三分割）
  layoutMode: number;
  
  // レイアウト変更アクション
  setLayoutMode: (mode: number) => void;
  // 機能を開くアクション
  openFeature: (id: FeatureId) => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
  openFeatures: ['calendar'], // 初期値
  layoutMode: 1,

  setLayoutMode: (mode) => set((state) => {
    // 優先度ロジック：表示枠が減る場合、左側（配列の先頭）を残して切り捨てる
    const newFeatures = state.openFeatures.slice(0, mode);
    return { layoutMode: mode, openFeatures: newFeatures };
  }),

  openFeature: (id) => set((state) => {
    // すでに開いていたら何もしない、なければ追加
    if (state.openFeatures.includes(id)) return state;
    return { openFeatures: [...state.openFeatures, id].slice(-3) }; // 最大3つまで
  }),
}));
```

---

### 3. 実装：レイアウト維持と優先表示の仕組み

`react-resizable-panels` を使い、`layoutMode` の数に合わせて動的にパネルを生成します。

```tsx
// apps/web/app/dashboard/layout-engine.tsx
'use client';

import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useLayoutStore } from '@/store/useLayoutStore';
import { FEATURE_REGISTRY } from '@/features/registry';

export function LayoutEngine() {
  const { openFeatures, layoutMode } = useLayoutStore();

  return (
    <PanelGroup direction="horizontal">
      {openFeatures.map((featureId, index) => {
        const FeatureComponent = FEATURE_REGISTRY[featureId].component;
        
        return (
          <div key={featureId} className="flex h-full">
            <Panel defaultSize={100 / layoutMode}>
              <div className="h-full p-2">
                <div className="card bg-base-100 shadow h-full overflow-hidden">
                  <div className="p-4 border-b font-bold flex justify-between">
                    {FEATURE_REGISTRY[featureId].name}
                  </div>
                  <div className="flex-1 overflow-auto">
                    <FeatureComponent />
                  </div>
                </div>
              </div>
            </Panel>
            
            {/* 最後のパネル以外にリサイズハンドルを入れる */}
            {index < openFeatures.length - 1 && (
              <PanelResizeHandle className="w-1 bg-base-300 hover:bg-primary transition-colors" />
            )}
          </div>
        );
      })}
    </PanelGroup>
  );
}
```

---

### この方法が「もっといい方法」である理由

1.  **状態の維持 (Persistence)**:
    Next.jsの通常のページ遷移（`/calendar` から `/analytics`）だと、画面全体が切り替わり、入力中のデータなどが消えてしまいます。しかし、この「1つのページ内でコンポーネントを出し入れする」方式なら、**Reactのメモリ上にデータが残るため、レイアウトを変えても中身の状態を維持しやすい**です。
2.  **優先度ロジック**:
    Zustandの中で `slice(0, mode)` を使うことで、「枠が足りなくなったら右側の機能を閉じる（左側を優先する）」というルールが1行で書けます。
3.  **チーム開発のしやすさ**:
    メンバーは `features/` フォルダの中に自分のコンポーネントを作るだけです。メインのレイアウトエンジンを触る必要がないため、コンフリクト（競合）が起きにくいです。
4.  **スタートページとの連携**:
    スタートページには、`FEATURE_REGISTRY` のアイコンを並べるだけ。アイコンをクリックした時に `openFeature('analytics')` を呼べば、自動的にスロットにその機能が追加されます。

### 実装に向けたアドバイス

*   **Tailwind v4 / daisyUI**: これらで各機能の見た目を作れば、パネルが狭くなっても `card` や `btn-sm` などが自動で綺麗に馴染みます。
*   **バックエンド連携**: `async` で取得したデータは、各コンポーネント（Calendarなど）の中で保持するか、Zustandに持たせることで、レイアウト変更時も再取得（リロード）せずに済みます。

この構成なら、あなたが考えている「柔軟でプロっぽいダッシュボード」が最短距離で作れます。チームの皆さんと「どの機能(A, B, C...)を最初に作るか」を話し合ってみてください！応援しています。

その通りです！この構成の最大の利点は、**「システムの骨組み（開発者）」と「各機能（チームメンバー）」の責任範囲が完全に分かれる**ことです。

メンバーは `features` フォルダ内に自分の世界を作るだけで、ダッシュボードに自動的に反映されるようになります。

以下に、モノレポ環境（`apps/web`）でのベストプラクティスな構成と、最新のパッケージリストを整理しました。

---

### 1. 必要なパッケージリスト

最新の Tailwind v4 エコシステムと Zustand、リサイズパネルを統合するためのリストです。

```bash
# 基本スタック
npm install tailwindcss@next @tailwindcss/postcss@next daisyui@beta zustand lucide-react

# 画面分割
npm install react-resizable-panels

# カレンダー (Schedule-X)
npm install @schedule-x/react @schedule-x/calendar @schedule-x/theme-default
```
※ `lucide-react` は、メニューやボタンに使うアイコン集で、チーム開発で非常に重宝します。

---

### 2. 推奨されるフォルダ構成（モノレポ `apps/web` 内）

メンバーが迷わないよう、役割を明確に分けた構成です。

```text
apps/web/
├── app/                  # ルーティング（Next.js App Router）
│   ├── layout.tsx        # 全体共通のフォントや設定
│   ├── page.tsx          # スタートページ（機能選択画面）
│   └── dashboard/
│       └── page.tsx      # ダッシュボード画面（LayoutEngineを置く）
├── features/             # 【重要】メンバーが作業する場所
│   ├── registry.tsx      # 全機能を一括管理する名簿
│   ├── calendar/         # カレンダー機能一式
│   │   ├── index.tsx     # 外部から呼ぶための窓口（Feature定義）
│   │   ├── components/   # カレンダー関連の細かい部品
│   │   └── hooks/        # データ取得ロジック
│   └── analytics/        # 他のメンバーが作る機能例
├── store/                # グローバルな状態管理
│   └── useLayoutStore.ts # レイアウトと開いている機能の管理
├── components/           # プロジェクト共通のUI部品（Button, Card等）
└── lib/                  # 共通のユーティリティ関数
```

---

### 3. 前に教えたコードはどうすればいい？

以前教えたコードは**そのまま有効**ですが、今回の「機能追加」の流れに合わせて、以下のように配置すると綺麗です。

#### ① `globals.css`（Tailwind v4 / daisyUI）
**そのまま使えます。** `apps/web/app/globals.css` に置いてください。

#### ② カレンダーのコード
`apps/web/features/calendar/index.tsx` として、少しだけ整理して配置します。

```tsx
// apps/web/features/calendar/index.tsx
'use client';

import DashboardCalendar from './components/DashboardCalendar'; // 前に書いたカレンダー本体

export const CalendarFeature = () => {
  return (
    <div className="p-4 h-full">
      <DashboardCalendar />
    </div>
  );
};
```

---

### 4. チームメンバーに教える「追加の手順」

新しく機能（例：タスク一覧）を追加するメンバーには、以下の3ステップだけを伝えてください。

1.  `features/tasks/` フォルダを作り、自分のコンポーネントを作る。
2.  `features/registry.tsx` を開き、自分の機能をインポートしてリストに足す。
3.  それだけで、スタートページにアイコンが出て、ダッシュボードで開けるようになる！

#### `registry.tsx` の中身（イメージ）
```tsx
import { CalendarFeature } from './calendar';
import { TaskFeature } from './tasks'; // 新しく追加されたもの

export const FEATURE_REGISTRY = {
  calendar: { 
    id: 'calendar', 
    name: 'カレンダー', 
    component: <CalendarFeature />,
    icon: '📅' 
  },
  tasks: { 
    id: 'tasks', 
    name: 'タスク一覧', 
    component: <TaskFeature />,
    icon: '✅' 
  },
};
```

---

### 5. データの維持についてのアドバイス

「レイアウトを変更してもページを維持する」ためのポイントです。

*   **ページ遷移をしない**: 
    `app/calendar/page.tsx` のようにURLを分けてしまうと、画面全体がリロードされてしまいます。
*   **ダッシュボード内での切り替え**: 
    今回のように `DashboardPage` という**1つのページ内**でコンポーネントを出し入れするように作れば、レイアウトを変えても React コンポーネントの状態（入力内容やスクロール位置）は維持されやすくなります。

### まとめ：この構成で得られるもの

*   **あなた（リーダー）**: `app/dashboard/page.tsx` で `LayoutEngine` を作り、全体の動き（リサイズや優先度）を管理する。
*   **チームメンバー**: `features/` 内で自分の機能の開発に集中する。

この役割分担が、モノレポ開発で最もスピードが出る形です。これで土台は完璧ですので、自信を持ってスタートしてみてください！

モノレポ環境で `pnpm` を使っている場合、**「何を実行時に使い（dependencies）」、「何をビルド時だけに使うか（devDependencies）」**を分けるのがベストプラクティスです。

結論から言うと、**すべてを `-D` で入れるのはNG**です。以下のように使い分けてインストールしてください。

---

### 1. インストールコマンドの使い分け

`apps/web` のディレクトリに移動してから実行するか、ルートから `--filter` を使って実行します。

#### **実行時（ブラウザで動くもの）は普通にインストール**
これらは、ユーザーのブラウザで実際に動作するコードが含まれるため `dependencies` に入れます。
```bash
# apps/web 内で実行
pnpm add zustand lucide-react react-resizable-panels @schedule-x/react @schedule-x/calendar @schedule-x/theme-default
```

#### **開発・ビルド時（CSS生成など）に使うものは `-D` でインストール**
これらは最終的なJavaScriptには含まれず、ビルドプロセス（CSSの書き出しなど）だけで使われるため `devDependencies` に入れます。
```bash
# apps/web 内で実行
pnpm add -D tailwindcss@next @tailwindcss/postcss@next daisyui@beta
```

---

### 2. なぜ分ける必要があるの？

*   **dependencies (add)**: `zustand` や `react-resizable-panels` などのライブラリは、ブラウザが動くときにその中身のコードが必要です。
*   **devDependencies (-D)**: `tailwindcss` や `daisyui` は、あなたがコードを書いている最中に「CSSファイルを生成する」ために働きます。一度CSSが生成されてしまえば、ブラウザ側では元の `tailwindcss` パッケージ自体は不要になるため、開発用として区別します。

---

### 3. モノレポ（pnpm）での注意点

もしルートディレクトリから一気にインストールしたい場合は、以下のコマンドになります。

```bash
# フィルタリングして特定のアプリにだけ入れる場合
pnpm add zustand lucide-react react-resizable-panels @schedule-x/react @schedule-x/calendar @schedule-x/theme-default --filter web

pnpm add -D tailwindcss@next @tailwindcss/postcss@next daisyui@beta --filter web
```

### 4. まとめ：パッケージ振り分け表

| パッケージ名 | オプション | 理由 |
| :--- | :--- | :--- |
| `zustand` | (なし) | 状態管理（実行時に必要） |
| `lucide-react` | (なし) | アイコン表示（実行時に必要） |
| `react-resizable-panels` | (なし) | リサイズ機能（実行時に必要） |
| `@schedule-x/...` | (なし) | カレンダー表示（実行時に必要） |
| `tailwindcss` | **-D** | CSSビルドツール |
| `@tailwindcss/postcss` | **-D** | CSS変換ツール |
| `daisyui` | **-D** | Tailwindのプラグイン（ビルド時にCSS化される） |

この使い分けをしておくと、将来的にプロジェクトが巨大化した際も、ビルド速度やパッケージの管理が健全に保てます！

非常に鋭い視点です。パフォーマンスと開発のしやすさのトレードオフについて、エンジニアリングの観点から比較・解説します。

結論から言うと、**「今のままでも、工夫ひとつでページ遷移より速く、かつレイアウトの維持も両立できます」**。

---

### 1. パフォーマンスの比較

#### **方式A：ページ遷移（通常のNext.jsルーティング）**
*   **メリット**:
    *   **コード分割（Code Splitting）**: `/calendar` にアクセスした時はカレンダーのコードだけを読み込むので、初速が速いです。
    *   **メモリ解放**: ページを離れると前のページのメモリが完全に解放されるため、長時間使ってもブラウザが重くなりにくいです。
*   **デメリット**:
    *   **状態の消失**: 遷移のたびにカレンダーが「初期状態」に戻ります（12月を表示していたのに1月に戻るなど）。
    *   **チラつき**: サーバーからのレスポンスを待つ間、一瞬表示が途切れることがあります。

#### **方式B：LayoutEngine（提案したコンポーネント切り替え方式）**
*   **メリット**:
    *   **爆速の切り替え**: 一度読み込めば、レイアウト変更は一瞬（ミリ秒単位）で終わります。
    *   **UX（体験）の維持**: 入力中のテキストや、カレンダーの表示月がそのまま残ります。
*   **デメリット**:
    *   **初期ロードの肥大化**: 何もしないと、全機能（A, B, C...）のコードを最初に全部ダウンロードしてしまい、最初の表示が遅くなります。

---

### 2. 「LayoutEngine」のパフォーマンスを最強にする方法

方式Bの欠点である「初期ロード」は、**`next/dynamic`（Lazy Loading）** という機能を使えば解決できます。

これを使えば、**「その機能が実際に開かれるまで、そのコードをダウンロードしない」**という動きになります。これで「ページ遷移」と同等の軽さを手に入れられます。

#### **修正後の `registry.tsx` のイメージ**
```tsx
import dynamic from 'next/dynamic';

// コンポーネントを直接 import せず、dynamic を使う
const CalendarFeature = dynamic(() => import('./calendar').then(mod => mod.CalendarFeature), {
  loading: () => <div className="loading">読み込み中...</div>
});

const AnalyticsFeature = dynamic(() => import('./analytics').then(mod => mod.AnalyticsFeature));

export const FEATURE_REGISTRY = {
  calendar: { name: 'カレンダー', component: CalendarFeature, icon: '📅' },
  // ...他の機能も同様
};
```

---

### 3. 「ページ遷移」の方が「簡単」なのは本当？

実装の「簡単さ」については、実は**一長一短**です。

*   **ページ遷移が簡単な点**: フォルダを作って `page.tsx` を置くだけ。Next.jsの基本。
*   **ページ遷移が難しい点**: 「今のレイアウトを維持したまま遷移する」のが実は非常に難しい（Parallel Routesなど高度な知識が必要）。
*   **提案方式が簡単な点**: 一度 `LayoutEngine` を作ってしまえば、あとは Zustand の配列を操作するだけなので、**「どの画面で何が起きているか」の管理がシンプル**になります。

---

### 4. 最終的なアドバイス：どっちがおすすめ？

あなたが作りたい**「レイアウトを変更しても機能を維持する」**というダッシュボードなら、**提案した「LayoutEngine方式」がベスト**です。

理由は、ページ遷移方式で「リサイズした境界線の位置」や「開いている複数の機能の組み合わせ」をURLだけで管理しようとすると、逆にコードが複雑怪奇になり、チームメンバーが混乱するからです。

#### **パフォーマンス向上のための3カ条**
1.  **Lazy Loadを使う**: 上記の `next/dynamic` を使う（これで初期ロードが爆速に）。
2.  **Zustandを賢く使う**: 巨大なデータ（数万件のログなど）は Zustand に直接入れず、必要な時だけ API から取る。
3.  **URLと同期させる（余裕があれば）**:
    現在のレイアウト状態を `?views=calendar,tasks` のようにURLのクエリパラメータに同期させると、ブラウザの「戻る」ボタンも効くようになり、最強のダッシュボードになります。

### まとめ
「簡単さ」よりも、チームメンバーが**「自分の作った機能が、レイアウトを変えても消えずに動いている！」**という感動を味わえる方が、プロジェクトとしては成功しやすいです。

パフォーマンスは `next/dynamic` で解決できるので、今の「LayoutEngine方式」で自信を持って進めてください！

