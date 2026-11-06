import React, { memo, useEffect, useRef } from "react";
import "./ProfileCard.css";

const THEMES = {
  dark: {
    "--pc-frame": "rgba(38, 35, 46, 0.66)",
    "--pc-frame-edge": "rgba(255, 255, 255, 0.08)",
    "--pc-frame-highlight": "rgba(255, 255, 255, 0.12)",
    "--pc-frame-shadow": "0 28px 56px -20px rgba(0, 0, 0, 0.8), 0 8px 20px -8px rgba(0, 0, 0, 0.5)",
    "--pc-tile": "linear-gradient(180deg, #3a3644 0%, #27242f 100%)",
    "--pc-tile-edge": "rgba(255, 255, 255, 0.08)",
    "--pc-tile-highlight": "rgba(255, 255, 255, 0.15)",
    "--pc-tile-shadow": "0 6px 14px -4px rgba(0, 0, 0, 0.7)",
    "--pc-ink": "#f4f4f5",
    "--pc-muted": "rgba(244, 244, 245, 0.6)",
    "--pc-hover": "brightness(1.12)",
    "--pc-press": "brightness(0.8)",
    "--pc-shade": "rgba(0, 0, 0, 0.4)",
  },
  light: {
    "--pc-frame": "rgba(255, 255, 255, 0.85)",
    "--pc-frame-edge": "rgba(226, 232, 240, 0.8)",
    "--pc-frame-highlight": "rgba(255, 255, 255, 0.98)",
    "--pc-frame-shadow": "0 28px 60px -20px rgba(15, 23, 42, 0.12), 0 8px 24px -8px rgba(16, 185, 129, 0.08)",
    "--pc-tile": "linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(248, 250, 252, 0.90) 100%)",
    "--pc-tile-edge": "rgba(226, 232, 240, 0.85)",
    "--pc-tile-highlight": "rgba(255, 255, 255, 1)",
    "--pc-tile-shadow": "0 6px 16px -6px rgba(15, 23, 42, 0.08)",
    "--pc-ink": "#0f172a",
    "--pc-muted": "rgba(100, 116, 139, 0.8)",
    "--pc-hover": "brightness(0.98)",
    "--pc-press": "brightness(0.94)",
    "--pc-shade": "rgba(15, 23, 42, 0.08)",
  },
};

const FOILS = {
  dark: {
    "--pc-blend": "color-dodge",
    "--pc-holo-filter": "hue-rotate(0deg)",
    "--pc-sheen": "rgba(255, 255, 255, 0.2)",
  },
  light: {
    "--pc-blend": "multiply",
    "--pc-holo-filter": "invert(1) hue-rotate(180deg)",
    "--pc-sheen": "rgba(255, 255, 255, 0.4)",
  },
};

const GRAIN = `url("data:image/svg+xml,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='500' height='500'><filter id='g' x='0' y='0' width='100%' height='100%' color-interpolation-filters='sRGB'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0.55 0 0 0 -0.24 0.55 0 0 0 -0.24 0.55 0 0 0 -0.24 0 0 0 0 1'/></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>"
)}")`;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export interface ProfileCardProps {
  children?: React.ReactNode;
  avatarUrl?: string;
  iconUrl?: string;
  miniAvatarUrl?: string;
  name?: string;
  title?: string;
  handle?: string;
  status?: string;
  statusColor?: string;
  contactText?: string;
  showUserInfo?: boolean;
  onContactClick?: () => void;
  theme?: "dark" | "light";
  backdropColor?: string;
  radius?: number;
  holo?: number;
  glare?: number;
  enableTilt?: boolean;
  tiltStrength?: number;
  parallax?: number;
  enableMobileTilt?: boolean;
  mobileTiltSensitivity?: number;
  intro?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  children,
  avatarUrl = "",
  iconUrl,
  miniAvatarUrl,
  name = "",
  title = "",
  handle = "",
  status = "",
  statusColor = "#10b981",
  contactText = "",
  showUserInfo = false,
  onContactClick,
  theme = "light",
  backdropColor,
  radius = 24,
  holo = 0.6,
  glare = 0.45,
  enableTilt = true,
  tiltStrength = 10,
  parallax = 6,
  enableMobileTilt = false,
  mobileTiltSensitivity = 4,
  intro = true,
  className = "",
  style = {},
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<any>(null);
  const settings = { enableTilt, tiltStrength, parallax, mobileTiltSensitivity, intro };
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const size = { width: root.offsetWidth, height: root.offsetHeight };
    const x = { p: 0, v: 0, target: 0 };
    const y = { p: 0, v: 0, target: 0 };
    const light = { p: 0, target: 0 };
    let raf = 0;
    let last = 0;
    let slowUntil = 0;
    let touchId: number | null = null;

    const write = () => {
      const { enableTilt: tiltOn, tiltStrength: strength, parallax: depth } = settingsRef.current;
      const angle = tiltOn && !reduced ? strength : 0;
      const tilt = Math.min(1, Math.hypot(x.p, y.p));
      const s = root.style;
      s.setProperty("--pc-light-x", `${((x.p + 1) * 0.5 * size.width).toFixed(1)}px`);
      s.setProperty("--pc-light-y", `${((y.p + 1) * 0.5 * size.height).toFixed(1)}px`);
      s.setProperty("--pc-pointer-x", `${((x.p + 1) * 50).toFixed(2)}%`);
      s.setProperty("--pc-pointer-y", `${((y.p + 1) * 50).toFixed(2)}%`);
      s.setProperty("--pc-band-x", `${(50 + x.p * 15).toFixed(2)}%`);
      s.setProperty("--pc-band-y", `${(50 + y.p * 15).toFixed(2)}%`);
      s.setProperty("--pc-rotate-x", `${(y.p * angle).toFixed(3)}deg`);
      s.setProperty("--pc-rotate-y", `${(-x.p * angle).toFixed(3)}deg`);
      s.setProperty("--pc-shift-x", `${(x.p * (reduced ? 0 : depth)).toFixed(2)}px`);
      s.setProperty("--pc-shift-y", `${(y.p * (reduced ? 0 : depth)).toFixed(2)}px`);
      s.setProperty("--pc-reach", tilt.toFixed(4));
      s.setProperty("--pc-tilt", (tilt * light.p).toFixed(4));
      s.setProperty("--pc-active", light.p.toFixed(4));
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000 || 0);
      last = now;
      const slow = now < slowUntil;
      const stiffness = slow ? 24 : 120;
      const damping = slow ? 9 : 16;
      const steps = Math.max(1, Math.ceil(dt / (1 / 120)));
      const h = dt / steps;
      for (let i = 0; i < steps; i++) {
        for (const axis of [x, y]) {
          axis.v += (stiffness * (axis.target - axis.p) - damping * axis.v) * h;
          axis.p += axis.v * h;
        }
      }
      const tau = light.target > light.p ? 0.18 : slow ? 0.9 : 0.45;
      light.p += (light.target - light.p) * (1 - Math.exp(-dt / tau));
      write();
      const moving =
        Math.abs(x.target - x.p) > 0.0005 ||
        Math.abs(y.target - y.p) > 0.0005 ||
        Math.abs(x.v) > 0.0005 ||
        Math.abs(y.v) > 0.0005 ||
        Math.abs(light.target - light.p) > 0.002;
      if (moving) {
        raf = requestAnimationFrame(frame);
      } else {
        x.p = x.target;
        y.p = y.target;
        light.p = light.target;
        write();
        raf = 0;
      }
    };

    const wake = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const aim = (nx: number, ny: number, on = true) => {
      x.target = clamp(nx, -1, 1);
      y.target = clamp(ny, -1, 1);
      light.target = on ? 1 : 0;
      slowUntil = 0;
      wake();
    };

    const aimAt = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      aim(((event.clientX - rect.left) / rect.width) * 2 - 1, ((event.clientY - rect.top) / rect.height) * 2 - 1);
    };

    const release = () => aim(0, 0, false);

    const onEnter = (e: PointerEvent) => {
      if (e.pointerType === "mouse") aimAt(e);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "mouse" || e.pointerId === touchId) aimAt(e);
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType === "mouse") release();
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      touchId = e.pointerId;
      aimAt(e);
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== touchId) return;
      touchId = null;
      release();
    };

    root.addEventListener("pointerenter", onEnter);
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    root.addEventListener("pointerdown", onDown);
    root.addEventListener("pointerup", onUp);
    root.addEventListener("pointercancel", onUp);

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(() => {
        size.width = root.offsetWidth;
        size.height = root.offsetHeight;
        write();
      });
      observer.observe(root);
    }

    engineRef.current = { aim, release, write };

    if (settingsRef.current.intro && !reduced) {
      x.p = 0.45;
      y.p = -0.35;
      light.p = 1;
      slowUntil = performance.now() + 1200;
      write();
      wake();
    } else {
      write();
    }

    return () => {
      cancelAnimationFrame(raf);
      observer?.disconnect();
      root.removeEventListener("pointerenter", onEnter);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("pointerdown", onDown);
      root.removeEventListener("pointerup", onUp);
      root.removeEventListener("pointercancel", onUp);
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    engineRef.current?.write();
  }, [enableTilt, tiltStrength, parallax]);

  const palette = theme === "dark" ? "dark" : "light";
  const foil = backdropColor ? "light" : palette;
  const backdrop = backdropColor
    ? `linear-gradient(180deg, color-mix(in srgb, ${backdropColor}, #ffffff 16%) 0%, color-mix(in srgb, ${backdropColor}, #000000 12%) 100%)`
    : "var(--pc-tile)";

  return (
    <div
      ref={rootRef}
      className={`profile-card ${className}`.trim()}
      style={{
        ...THEMES[palette],
        ...FOILS[foil],
        "--pc-radius": `${Math.max(0, radius)}px`,
        "--pc-backdrop": backdrop,
        "--pc-holo": clamp(holo, 0, 1),
        "--pc-glare": clamp(glare, 0, 1),
        "--pc-parallax": `${Math.max(0, parallax)}px`,
        "--pc-status": statusColor,
        "--pc-grain": GRAIN,
        "--pc-pattern": iconUrl ? `url("${iconUrl}")` : "linear-gradient(#000, #000)",
        "--pc-pattern-size": iconUrl ? "180% auto" : "100% 100%",
        "--pc-holo-gain": iconUrl ? 1.25 : 0.75,
        "--pc-holo-detail": iconUrl && foil === "dark" ? 1 : 0,
        ...style,
      } as React.CSSProperties}
    >
      <div className="profile-card__body">
        <div className="profile-card__tile">
          <span className="profile-card__sheen" aria-hidden="true" />
          <span className="profile-card__holo" aria-hidden="true">
            <span className="profile-card__holo-glow" />
            <span className="profile-card__holo-shift" />
          </span>

          {avatarUrl && (
            <img className="profile-card__photo" src={avatarUrl} alt={name || ""} loading="lazy" draggable={false} />
          )}

          {(name || title) && (
            <>
              <span className="profile-card__scrim" />
              <div className="profile-card__info">
                {name && <h3 className="profile-card__name">{name}</h3>}
                {title && <p className="profile-card__title">{title}</p>}
              </div>
            </>
          )}

          {/* Custom Children Container (e.g. Interactive Simulation Console) */}
          {children && <div className="profile-card__content">{children}</div>}

          <span className="profile-card__tile-rim" aria-hidden="true" />
        </div>

        {showUserInfo && (
          <div className="profile-card__footer">
            {miniAvatarUrl && (
              <span className="profile-card__avatar">
                <img src={miniAvatarUrl} alt="" loading="lazy" draggable={false} />
              </span>
            )}
            <div className="profile-card__meta">
              {handle && <span className="profile-card__handle">@{handle}</span>}
              {status && <span className="profile-card__status">{status}</span>}
            </div>
            {contactText && (
              <button
                type="button"
                className="profile-card__contact"
                onClick={onContactClick}
                aria-label={name ? `${contactText} ${name}` : contactText}
              >
                {contactText}
              </button>
            )}
          </div>
        )}

        <span className="profile-card__glare" aria-hidden="true" />
        <span className="profile-card__shade" aria-hidden="true" />
        <span className="profile-card__rim" aria-hidden="true" />
      </div>
    </div>
  );
};

export default memo(ProfileCard);
