import { Lake } from "./environment/Lake";
import { Mist } from "./environment/Mist";
import { PineForest } from "./environment/PineForest";
import { Sky } from "./environment/Sky";
import { Terrain } from "./environment/Terrain";
import { FloatingRings } from "./objects/FloatingRings";
import { Lanterns } from "./objects/Lanterns";
import { WeddingArch } from "./objects/WeddingArch";

/** The golden-hour pine forest the guest travels through after the opening. */
export function World() {
  return (
    <group>
      <Sky />
      <Terrain />
      <PineForest />
      <Mist />
      <Lake />
      <WeddingArch />
      <Lanterns />
      <FloatingRings />
    </group>
  );
}
