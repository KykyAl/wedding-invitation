import * as THREE from "three";

/**
 * @react-three/fiber 9.8 still constructs THREE.Clock internally, which three r183+
 * flags as deprecated on every load. It's upstream and harmless — silence exactly that
 * message and forward everything else untouched.
 */
const UPSTREAM_NOISE = ["THREE.Clock: This module has been deprecated"];

THREE.setConsoleFunction((type: string, message: string, ...params: unknown[]) => {
  if (UPSTREAM_NOISE.some((m) => message.startsWith(m))) return;
  const fn = (console as unknown as Record<string, (...a: unknown[]) => void>)[type] ?? console.log;
  fn(message, ...params);
});
