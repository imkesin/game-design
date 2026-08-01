import type { MapSpec } from "./generate.ts"

/**
 * The map's authored input: an adjacency graph, grouped into states, with a
 * rough placement hint per province. There is no coastline here — the shore is
 * wherever land provinces stop meeting each other and start meeting seas, so
 * the continent's silhouette is an output.
 *
 * Provinces are the unit of adjacency. `borders` is exhaustive in both
 * directions and crosses states and water freely: two provinces not listed
 * against each other must not touch, and the build fails if the geometry says
 * otherwise. A shoreline is an ordinary border that happens to have land on one
 * side and sea on the other.
 *
 * `weight` is relative size: the seas here are wider than any single province,
 * so they are grown harder. Without it every region comes out the same size and
 * the continent swallows the canvas.
 *
 * `at` is advisory. It seeds the partition and decides roughly where a province
 * lands, but it can never make the build accept an undeclared border.
 */
export const numinaMapSpec: MapSpec = {
  // 17 x 23 inches: the live area of an 18 x 24 print-shop sheet, portrait, with
  // a half-inch margin all round. At 100 units per inch every coordinate below
  // reads directly as hundredths of an inch on the finished board — `[680, 480]`
  // is 6.8in across and 4.8in down.
  unitsPerInch: 100,
  width: 1700,
  height: 1700,
  cells: 1000,
  seed: 4,

  states: [
    // Land
    {
      id: "land-north",
      name: "North",
      provinces: [{
        id: "north",
        name: "North",
        at: [950, 700],
        weight: 3,
        borders: [
          "andhra",
          "karnataka",
          "sea-s-e",
          "sea-s-w"
        ]
      }]
    },
    {
      id: "land-south",
      name: "South",
      provinces: [
        {
          id: "ketalam",
          name: "Ket",
          at: [850, 1500],
          weight: 1,
          borders: [
            "karnataka",
            "tamilakam",
            "sea-s-s",
            "sea-s-w"
          ]
        },
        {
          id: "tamilakam",
          name: "Tam",
          at: [950, 1450],
          weight: 2,
          borders: [
            "andhra",
            "karnataka",
            "ketalam",
            "sea-s-e",
            "sea-s-s"
          ]
        },
        {
          id: "andhra",
          name: "And",
          weight: 2,
          at: [950, 1200],
          borders: [
            "north",
            "karnataka",
            "tamilakam",
            "sea-s-e"
          ]
        },
        {
          id: "karnataka",
          name: "Kar",
          weight: 2,
          at: [850, 1300],
          borders: [
            "north",
            "andhra",
            "ketalam",
            "tamilakam",
            "sea-s-w"
          ]
        }
      ]
    },
    {
      id: "land-lanka",
      name: "Lanka",
      provinces: [{
        id: "lanka",
        name: "Lan",
        at: [1100, 1600],
        borders: [
          "sea-s-e",
          "sea-s-s"
        ]
      }]
    },

    // Seas
    {
      id: "sea-s",
      name: "Southern Sea",
      kind: "sea",
      provinces: [
        {
          id: "sea-s-e",
          name: "Sea (SE)",
          at: [1250, 1600],
          weight: 2,
          borders: [
            "andhra",
            "lanka",
            "north",
            "tamilakam",
            "sea-s-s"
          ]
        },
        {
          id: "sea-s-s",
          name: "Sea (SS)",
          at: [900, 1700],
          weight: 1,
          borders: [
            "lanka",
            "ketalam",
            "tamilakam",
            "sea-s-w",
            "sea-s-e"
          ]
        },
        {
          id: "sea-s-w",
          name: "Sea (SW)",
          at: [400, 1600],
          weight: 2,
          borders: [
            "karnataka",
            "ketalam",
            "north",
            "sea-s-s"
          ]
        }
      ]
    }
  ]
}
