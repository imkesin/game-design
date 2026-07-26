export const FOCUSES = [
  "Expand",
  "Harvest",
  "Recruit",
  "Sell"
] as const
export type Focus = typeof FOCUSES[number]

export type FocusAction = {
  readonly id: string
  readonly name: string
  readonly ruleDescription: string
  /**
   * Optional cross-reference callout, rendered as a small aside under the rule.
   * Used to flag an optional add-on that lives in another section — e.g. Sell's
   * overflow into a Trade Route (see ForeignMarketDefinitions).
   */
  readonly note?: string
}

export const FOCUS_ACTION_METADATA = {
  Expand: {
    actions: [
      {
        id: "expand-expand",
        name: "Expand",
        ruleDescription:
          "Take a visible Field Card (collect its Gold) or reveal one from your hand; place it and pay its cost. Expand-zone Family Workers count toward the Worker cost.\n\nIf taken from the visible set, drop 1 coin on each remaining Field, then reveal a replacement."
      }
    ]
  },
  Harvest: {
    actions: [
      {
        id: "harvest-harvest",
        name: "Harvest",
        ruleDescription:
          "Assign Workers to Field rows to produce Fruit, working rows top to bottom. Harvest-zone Family Workers count toward the cost.\n\nA Field still holding Fruit can't be harvested — sell it first."
      }
    ]
  },
  Recruit: {
    actions: [
      {
        id: "recruit-recruit",
        name: "Recruit",
        ruleDescription:
          "Each Recruit-zone Family Worker hires the cheapest Worker free; hire more by paying their Gold cost.\n\nPoach: if you started the turn with fewer Workers than another player, take their Workers for 1 Gold over the pool's highest cost."
      }
    ]
  },
  Sell: {
    actions: [
      {
        id: "sell-sell",
        name: "Sell",
        ruleDescription:
          "Transport Fruit into Market slots for Gold. Each Sell-zone Family Worker moves any number of one Fruit type; each extra Worker adds one more type.\n\nThen induce demand: clear other Fruits from their Demand Tracks, earning 1 Gold per Crate removed.",
        note: "Overflow with no open Market slot may develop a Trade Route instead — see Trade Routes."
      }
    ]
  }
} as const satisfies Record<Focus, { readonly actions: readonly FocusAction[] }>
