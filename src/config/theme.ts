/**
 * Design tokens shared by the WebGL world. CSS mirrors these in src/styles/index.css (@theme).
 */
export const palette = {
  ivory: "#F7F1E6",
  champagne: "#E9D9BC",
  beige: "#D8C3A0",
  gold: "#B8955A",
  goldLight: "#D9BC82",
  goldDeep: "#8C6A3A",
  brown: "#3A2A1E",
  brownDeep: "#1E1610",
  ink: "#0C0907",
  wax: "#4A1C18",
  pine: "#262B22",
} as const;

/** The two moods of the world: the dark opening void and the golden-hour pine forest. */
export const atmosphere = {
  opening: {
    fog: "#0C0907",
    fogNear: 6,
    fogFar: 20,
  },
  world: {
    fog: "#E6CFA8",
    fogNear: 4,
    fogFar: 70,
    skyTop: "#5A4034",
    skyMid: "#C89668",
    skyHorizon: "#EFD9B2",
    sun: "#FFE3B0",
  },
} as const;
