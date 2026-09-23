import { useEffect, useRef, useState } from 'react';

/** True when a WebGL context can be created. Releases the probe context right away. */
function hasWebGL(): boolean {
  try {
    const probe = document.createElement('canvas');
    const gl = probe.getContext('webgl2') ?? probe.getContext('webgl');
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/**
 * The live 3D motif. Renders an empty positioned box on first paint; once the
 * box is near the viewport it probes WebGL, lazy-loads three.js (separate
 * chunk) and mounts the scene. Without WebGL, or if loading fails, it shows the
 * static cyan/magenta gradient wash from the source instead.
 */
export function HeroMotif({ className = '' }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let cancelled = false;
    let dispose: (() => void) | undefined;

    const boot = async () => {
      if (!hasWebGL()) {
        setFallback(true);
        return;
      }
      try {
        const { mountScene } = await import('./scene');
        if (cancelled) return;
        dispose = mountScene(host);
      } catch (err) {
        console.warn('[motif] WebGL scene unavailable, showing the static wash', err);
        if (!cancelled) setFallback(true);
      }
    };

    if (!('IntersectionObserver' in window)) {
      void boot();
      return () => {
        cancelled = true;
        dispose?.();
      };
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          void boot();
        }
      },
      { rootMargin: '240px' },
    );
    io.observe(host);
    return () => {
      cancelled = true;
      io.disconnect();
      dispose?.();
    };
  }, []);

  return (
    <div ref={hostRef} aria-hidden="true" className={`absolute inset-0 ${className}`}>
      {fallback && (
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(52% 40% at 58% 40%, #7BC8E422, transparent 70%),' +
              ' radial-gradient(44% 34% at 74% 68%, #B82DBF1f, transparent 72%),' +
              ' radial-gradient(80% 60% at 50% 50%, #7BC8E40d, transparent 80%)',
          }}
        />
      )}
    </div>
  );
}
