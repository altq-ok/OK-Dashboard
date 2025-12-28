import { LayoutNode } from '@/types/dashboard';

export const DASHBOARD_TEMPLATES: Record<string, LayoutNode> = {
  // 1. Single
  // [ 0 ]
  single: {
    id: 's-root',
    type: 'widget',
    slotIndex: 0,
  },

  // 2. Horizontal
  // [ 0 | 1 ]
  'split-h': {
    id: 'sh-root',
    type: 'group',
    direction: 'horizontal',
    widgets: [
      { id: 'h1', type: 'widget', slotIndex: 0, defaultSize: 50 },
      { id: 'h2', type: 'widget', slotIndex: 1, defaultSize: 50 },
    ],
  },

  // 3. Vertical
  // [ 0 ]
  // [ 1 ]
  'split-v': {
    id: 'sv-root',
    type: 'group',
    direction: 'vertical',
    widgets: [
      { id: 'v1', type: 'widget', slotIndex: 0, defaultSize: 50 },
      { id: 'v2', type: 'widget', slotIndex: 1, defaultSize: 50 },
    ],
  },

  // 4. Top 1, Bottom 2
  // [   0   ]
  // [ 1 | 2 ]
  't-shape': {
    id: 't-root',
    type: 'group',
    direction: 'vertical',
    widgets: [
      { id: 't-top', type: 'widget', slotIndex: 0, defaultSize: 50 },
      {
        id: 't-bottom-group',
        type: 'group',
        direction: 'horizontal',
        defaultSize: 50,
        widgets: [
          { id: 't-b1', type: 'widget', slotIndex: 1, defaultSize: 50 },
          { id: 't-b2', type: 'widget', slotIndex: 2, defaultSize: 50 },
        ],
      },
    ],
  },

  // 5. Top 2, Bottom 1
  // [ 0 | 1 ]
  // [   2   ]
  'inv-t-shape': {
    id: 'it-root',
    type: 'group',
    direction: 'vertical',
    widgets: [
      {
        id: 'it-top-group',
        type: 'group',
        direction: 'horizontal',
        defaultSize: 50,
        widgets: [
          { id: 'it-t1', type: 'widget', slotIndex: 0, defaultSize: 50 },
          { id: 'it-t2', type: 'widget', slotIndex: 1, defaultSize: 50 },
        ],
      },
      { id: 'it-bottom', type: 'widget', slotIndex: 2, defaultSize: 50 },
    ],
  },

  // 6. Left 2, Right 1
  // [ 0 ] |
  // [---] | 2
  // [ 1 ] |
  'left-split': {
    id: 'ls-root',
    type: 'group',
    direction: 'horizontal',
    widgets: [
      {
        id: 'ls-left-group',
        type: 'group',
        direction: 'vertical',
        defaultSize: 50,
        widgets: [
          { id: 'ls-l1', type: 'widget', slotIndex: 0, defaultSize: 50 },
          { id: 'ls-l2', type: 'widget', slotIndex: 1, defaultSize: 50 },
        ],
      },
      { id: 'ls-right', type: 'widget', slotIndex: 2, defaultSize: 50 },
    ],
  },

  // 7. Left 1, Right 2
  //     | [ 1 ]
  //  0  | [---]
  //     | [ 2 ]
  'right-split': {
    id: 'rs-root',
    type: 'group',
    direction: 'horizontal',
    widgets: [
      { id: 'rs-left', type: 'widget', slotIndex: 0, defaultSize: 50 },
      {
        id: 'rs-right-group',
        type: 'group',
        direction: 'vertical',
        defaultSize: 50,
        widgets: [
          { id: 'rs-r1', type: 'widget', slotIndex: 1, defaultSize: 50 },
          { id: 'rs-r2', type: 'widget', slotIndex: 2, defaultSize: 50 },
        ],
      },
    ],
  },

  // 8. 25% each at corners
  // [ 0 | 2 ]
  // [ 1 | 3 ]
  'grid-4': {
    id: 'g4-root',
    type: 'group',
    direction: 'horizontal',
    widgets: [
      {
        id: 'g4-left-group',
        type: 'group',
        direction: 'vertical',
        defaultSize: 50,
        widgets: [
          { id: 'g4-0', type: 'widget', slotIndex: 0, defaultSize: 50 },
          { id: 'g4-1', type: 'widget', slotIndex: 1, defaultSize: 50 },
        ],
      },
      {
        id: 'g4-right-group',
        type: 'group',
        direction: 'vertical',
        defaultSize: 50,
        widgets: [
          { id: 'g4-2', type: 'widget', slotIndex: 2, defaultSize: 50 },
          { id: 'g4-3', type: 'widget', slotIndex: 3, defaultSize: 50 },
        ],
      },
    ],
  },
};
