import { useEffect, useState } from "react";
import { useHydrated } from "@/lib/hooks";

/**
 * Access to the phone's motion sensor for the hero scene.
 *
 * Android browsers report the device's orientation to any secure page. iPhones
 * and iPads only do so after the visitor taps something and accepts a
 * permission prompt. Newer Chrome also has the iPhone-style
 * `requestPermission()`, but keeps reporting without it, so the only reliable
 * test is to listen: if readings arrive, no prompt is needed.
 */

type OrientationEventWithPermission = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

function orientationEvent(): OrientationEventWithPermission | null {
  return typeof DeviceOrientationEvent === "undefined"
    ? null
    : (DeviceOrientationEvent as OrientationEventWithPermission);
}

/**
 * Shows the system permission prompt. Must be called straight from a tap or
 * click handler, or the browser refuses. Resolves to whether tilt may be used.
 */
async function requestTilt(): Promise<boolean> {
  try {
    const answer = await orientationEvent()?.requestPermission?.();
    return answer === "granted";
  } catch {
    return false;
  }
}

/**
 * Whether the scene may follow the phone's tilt, and whether to offer a
 * "Turn on tilt" button (only where readings need permission and none have
 * arrived yet). Pass `enabled: false` on devices with a mouse.
 */
export function useTilt(enabled: boolean) {
  const hydrated = useHydrated();
  const event = hydrated ? orientationEvent() : null;
  const canAsk = typeof event?.requestPermission === "function";

  const [readings, setReadings] = useState(false);
  const [answer, setAnswer] = useState<"granted" | "denied" | null>(null);

  useEffect(() => {
    if (!enabled || !event || readings) return;
    // Devices without a sensor send one event with empty values.
    const onReading = (reading: DeviceOrientationEvent) => {
      if (reading.beta !== null && reading.gamma !== null) setReadings(true);
    };
    window.addEventListener("deviceorientation", onReading, { passive: true });
    return () => window.removeEventListener("deviceorientation", onReading);
  }, [enabled, event, readings]);

  return {
    on: enabled && (readings || answer === "granted"),
    offer: enabled && canAsk && !readings && answer === null,
    turnOn: () => {
      void requestTilt().then((granted) => setAnswer(granted ? "granted" : "denied"));
    },
  };
}
