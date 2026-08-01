import type { GeneratedMap } from "~/games/numina/map/generate"
import mapData from "~/games/numina/map/map.json"
import { MapView } from "~/games/numina/map/MapView"
import { css } from "~/generated/styled-system/css"

const map = mapData as GeneratedMap

/**
 * The board at 1:1 on an 18x24in print-shop sheet, portrait. A half-inch margin
 * all round leaves the 17x23in live area the spec is authored against.
 *
 * The sheet's inner size comes from `map.inches`, which the build derives from
 * the spec's `unitsPerInch`. Nothing here restates the dimensions, so the paper
 * cannot drift out of step with the coordinates.
 *
 * IMPORTANT for manual Cmd-P: set Margins = None and Scale = 100%, or the
 * browser shrinks the sheet and the 1:1 sizing is lost.
 */

const sheet = css({
  boxSizing: "border-box",
  display: "grid",
  placeItems: "center",
  width: "18in",
  height: "24in",
  padding: "0.5in",
  background: "#fff",
  margin: "0 auto"
})

const page = css({
  background: "#3a3a3a",
  padding: "24px 0",
  "@media print": { background: "#fff", padding: 0 }
})

export function MapPrintPage() {
  return (
    <div className={page}>
      <style>{`@page { size: 18in 24in; margin: 0; }`}</style>
      <div className={sheet}>
        <MapView
          map={map}
          selectedId={null}
          onSelect={() => {}}
          rough
          style={{ width: `${map.inches.width}in`, height: `${map.inches.height}in` }}
        />
      </div>
    </div>
  )
}

export default MapPrintPage
