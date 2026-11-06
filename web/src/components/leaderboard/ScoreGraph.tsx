"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { niceTicks, scoreAt } from "@/lib/leaderboard/standings";
import type { GraphModel, GraphSeries } from "@/lib/leaderboard/standings";
import { initialsOf } from "./TeamEmblem";
import styles from "./ScoreGraph.module.css";

interface ScoreGraphProps {
  model: GraphModel;
  /** Hides score numbers (axis, tooltip) while the leaderboard is frozen. */
  maskScores: boolean;
}

const MARGIN = { top: 20, right: 22, bottom: 34 };
const DASHED_FROM_SLOT = 8;
const SNAP_PX = 26;
const BADGE_R = 12;
const BADGE_GAP = BADGE_R * 2 + 3;

const seriesColor = (series: GraphSeries) => `var(--series-${series.slot % 8})`;
const isDashed = (series: GraphSeries) => series.slot >= DASHED_FROM_SLOT;
const dash = (series: GraphSeries) => (isDashed(series) ? "7 5" : undefined);

const timeFormat = new Intl.DateTimeFormat([], { hour: "2-digit", minute: "2-digit" });
const clockFormat = new Intl.DateTimeFormat([], {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

interface Hover {
  px: number;
  t: number;
}

/** A small dagger: blade, cross-guard, grip and pommel. Drawn around (0, 0). */
function Dagger() {
  return (
    <g aria-hidden="true" className={styles.dagger}>
      <path d="M0 6.2 L-1.7 -0.8 L1.7 -0.8 Z" />
      <path d="M-3.8 -1.4 H3.8 M0 -1.4 V-5" fill="none" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="0" cy="-6" r="1.3" />
    </g>
  );
}

/** A team's circular icon on the graph: series colour, initials, dashed halo for the dashed lines. */
function SeriesBadge({ series, r }: { series: GraphSeries; r: number }) {
  return (
    <g aria-hidden="true">
      {isDashed(series) && (
        <circle
          r={r + 3.5}
          fill="none"
          stroke={seriesColor(series)}
          strokeWidth="1.6"
          strokeDasharray="3 3"
        />
      )}
      <circle r={r} fill={seriesColor(series)} className={styles.badgeDisc} />
      <text className={styles.badgeText} fontSize={r * 0.82} textAnchor="middle" dy="0.35em">
        {initialsOf(series.name)}
      </text>
    </g>
  );
}

/**
 * Step-line multi-series chart of cumulative score over the tournament
 * timeline for the top ten teams (handbook §9.2). Hovering near a line
 * highlights it and dims the rest; First Blood jumps carry a dagger.
 * Every line ends in its team's circular icon.
 */
export function ScoreGraph({ model, maskScores }: ScoreGraphProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const clipId = useId().replace(/:/g, "");
  const [width, setWidth] = useState(960);
  const [hover, setHover] = useState<Hover | null>(null);
  const [pointerTeam, setPointerTeam] = useState<GraphSeries["teamId"] | null>(null);
  const [legendTeam, setLegendTeam] = useState<GraphSeries["teamId"] | null>(null);

  useEffect(() => {
    const node = wrapRef.current;
    if (!node) return;
    setWidth(Math.max(280, Math.floor(node.clientWidth)));
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.max(280, Math.floor(entry.contentRect.width)));
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const height = width < 560 ? 320 : 440;
  const left = maskScores ? 16 : 54;
  const plotW = Math.max(40, width - left - MARGIN.right);
  const plotH = height - MARGIN.top - MARGIN.bottom;

  const { series, start, end } = model;
  const hasScores = series.some((item) => item.points.length > 0);

  const yTicks = useMemo(
    () => niceTicks(Math.min(0, model.minScore), Math.max(100, model.maxScore * 1.06)),
    [model.minScore, model.maxScore],
  );
  const yMin = yTicks[0];
  const yMax = yTicks[yTicks.length - 1];

  const xOf = (t: number) => left + ((t - start) / (end - start)) * plotW;
  const yOf = (score: number) => MARGIN.top + plotH - ((score - yMin) / (yMax - yMin)) * plotH;

  const xTickCount = width < 560 ? 3 : 6;
  const xTicks = Array.from(
    { length: xTickCount + 1 },
    (_, index) => start + ((end - start) * index) / xTickCount,
  );

  const isolatedTeam = legendTeam ?? pointerTeam;
  const isolated = isolatedTeam !== null;

  const paths = useMemo(() => {
    const x = (t: number) => left + ((Math.min(Math.max(t, start), end) - start) / (end - start)) * plotW;
    const y = (score: number) => MARGIN.top + plotH - ((score - yMin) / (yMax - yMin)) * plotH;
    return series.map((item) => {
      let d = `M${x(start).toFixed(1)} ${y(0).toFixed(1)}`;
      for (const point of item.points) {
        d += ` H${x(point.t).toFixed(1)} V${y(point.score).toFixed(1)}`;
      }
      d += ` H${x(end).toFixed(1)}`;
      return d;
    });
  }, [series, start, end, left, plotW, plotH, yMin, yMax]);

  // End-of-line icons: pushed apart vertically so close scores do not overlap.
  const badges = (() => {
    if (!hasScores) return [];
    const top = MARGIN.top + BADGE_R;
    const bottom = MARGIN.top + plotH - BADGE_R;
    const items = series
      .map((item) => ({ item, y: Math.min(bottom, Math.max(top, yOf(scoreAt(item, end)))) }))
      .sort((a, b) => a.y - b.y);
    for (let i = 1; i < items.length; i += 1) {
      if (items[i].y - items[i - 1].y < BADGE_GAP) items[i].y = items[i - 1].y + BADGE_GAP;
    }
    const last = items[items.length - 1];
    if (last && last.y > bottom) {
      last.y = bottom;
      for (let i = items.length - 2; i >= 0; i -= 1) {
        if (items[i + 1].y - items[i].y < BADGE_GAP) items[i].y = items[i + 1].y - BADGE_GAP;
      }
    }
    return items;
  })();

  function handleMove(event: ReactPointerEvent<SVGSVGElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    const px = event.clientX - box.left;
    const py = event.clientY - box.top;
    if (px < left || px > left + plotW) {
      setHover(null);
      setPointerTeam(null);
      return;
    }
    const t = start + ((px - left) / plotW) * (end - start);
    setHover({ px, t });

    let nearest: GraphSeries | null = null;
    let nearestDistance = SNAP_PX;
    for (const item of series) {
      const distance = Math.abs(yOf(scoreAt(item, t)) - py);
      if (distance < nearestDistance) {
        nearest = item;
        nearestDistance = distance;
      }
    }
    setPointerTeam(nearest ? nearest.teamId : null);
  }

  function handleLeave() {
    setHover(null);
    setPointerTeam(null);
  }

  const readout = hover
    ? series
        .map((item) => ({ item, score: scoreAt(item, hover.t) }))
        .sort((a, b) => b.score - a.score)
    : [];
  const isolatedSeries = series.find((item) => item.teamId === isolatedTeam) ?? null;
  const tooltipLeft = hover && hover.px > width * 0.55;

  return (
    <div className={styles.wrap}>
      <div ref={wrapRef} className={styles.chartBox}>
        <svg
          className={styles.chart}
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          data-isolate={isolated}
          role="img"
          aria-label="Line chart of cumulative score over time for the top ten teams. The rankings table below lists the same standings."
          onPointerMove={handleMove}
          onPointerLeave={handleLeave}
        >
          <defs>
            {/* Lines are revealed from left to right when the chart first appears. */}
            <clipPath id={clipId}>
              <rect className={styles.reveal} x="0" y="0" width={width} height={height} />
            </clipPath>
          </defs>

          {/* Gridlines and axes */}
          {yTicks.map((tick) => (
            <g key={tick}>
              <line
                className={tick === 0 ? styles.baseline : styles.grid}
                x1={left}
                x2={left + plotW}
                y1={yOf(tick)}
                y2={yOf(tick)}
              />
              {!maskScores && (
                <text className={styles.axisText} x={left - 10} y={yOf(tick)} textAnchor="end" dy="0.34em">
                  {tick.toLocaleString()}
                </text>
              )}
            </g>
          ))}
          {xTicks.map((tick, index) => (
            <text
              key={index}
              className={styles.axisText}
              x={xOf(tick)}
              y={height - 10}
              textAnchor={index === 0 ? "start" : index === xTicks.length - 1 ? "end" : "middle"}
            >
              {timeFormat.format(tick)}
            </text>
          ))}

          {/* Lines and a dot at every score jump */}
          <g clipPath={`url(#${clipId})`}>
            {series.map((item, index) => (
              <g
                key={String(item.teamId)}
                className={styles.series}
                data-active={item.teamId === isolatedTeam}
              >
                <path
                  className={styles.line}
                  d={paths[index]}
                  stroke={seriesColor(item)}
                  strokeDasharray={dash(item)}
                />
                {item.points.map((point, pointIndex) => (
                  <circle
                    key={pointIndex}
                    className={styles.jump}
                    cx={xOf(point.t)}
                    cy={yOf(point.score)}
                    r="3"
                    fill={seriesColor(item)}
                  />
                ))}
              </g>
            ))}
          </g>

          {/* Crosshair and values at the hovered time */}
          {hover && (
            <g className={styles.crosshair} pointerEvents="none">
              <line x1={hover.px} x2={hover.px} y1={MARGIN.top} y2={MARGIN.top + plotH} />
              {!maskScores &&
                series.map((item) => (
                  <circle
                    key={String(item.teamId)}
                    cx={hover.px}
                    cy={yOf(scoreAt(item, hover.t))}
                    r={item.teamId === isolatedTeam ? 5.5 : 4}
                    fill={seriesColor(item)}
                    className={styles.dot}
                    data-active={item.teamId === isolatedTeam}
                  />
                ))}
            </g>
          )}

          {/* First Blood markers */}
          {series.flatMap((item) =>
            item.firstBloods.map((point, index) => (
              <g
                key={`${String(item.teamId)}-${index}`}
                className={styles.marker}
                data-active={item.teamId === isolatedTeam}
                transform={`translate(${xOf(point.t)} ${yOf(point.score)})`}
                onPointerEnter={() => setPointerTeam(item.teamId)}
              >
                <title>{`${item.name}: First Blood at ${clockFormat.format(point.t)}`}</title>
                <circle r="14" className={styles.markerHit} />
                <circle r="11" className={styles.markerDisc} fill={seriesColor(item)} />
                <g transform="scale(1.25)">
                  <Dagger />
                </g>
              </g>
            )),
          )}

          {/* Circular team icons at the end of each line */}
          {badges.map(({ item, y }) => (
            <g
              key={String(item.teamId)}
              className={styles.badge}
              data-active={item.teamId === isolatedTeam}
              transform={`translate(${left + plotW} ${y})`}
              onPointerEnter={() => setPointerTeam(item.teamId)}
            >
              <title>{item.name}</title>
              <SeriesBadge series={item} r={BADGE_R} />
            </g>
          ))}

          {/* Name beside the isolated line's icon */}
          {isolatedSeries && (
            <text
              className={styles.endLabel}
              x={left + plotW - BADGE_R - 10}
              y={(badges.find((b) => b.item === isolatedSeries)?.y ?? MARGIN.top) + 4}
              textAnchor="end"
            >
              {isolatedSeries.name}
            </text>
          )}
        </svg>

        {!hasScores && <p className={styles.empty}>The graph starts with the first score.</p>}

        {hover && hasScores && (
          <div
            className={styles.tooltip}
            style={{
              left: tooltipLeft ? hover.px - 16 : hover.px + 16,
              transform: tooltipLeft ? "translateX(-100%)" : undefined,
            }}
            role="status"
          >
            <p className={styles.tooltipTime}>{clockFormat.format(hover.t)}</p>
            {maskScores ? (
              <p className={styles.tooltipNote}>
                {isolatedSeries ? isolatedSeries.name : "Scores are hidden while frozen."}
              </p>
            ) : (
              <ul>
                {readout.map(({ item, score }) => (
                  <li key={String(item.teamId)} data-active={item.teamId === isolatedTeam}>
                    <i
                      className={styles.key}
                      style={{
                        background: isDashed(item) ? "transparent" : seriesColor(item),
                        borderTop: isDashed(item) ? `3px dashed ${seriesColor(item)}` : undefined,
                      }}
                    />
                    <b>{score.toLocaleString()}</b>
                    <span>{item.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <ul className={styles.legend} aria-label="Teams on the graph">
        {series.map((item) => (
          <li key={String(item.teamId)}>
            <button
              type="button"
              className={styles.legendItem}
              data-active={item.teamId === isolatedTeam}
              onPointerEnter={() => setLegendTeam(item.teamId)}
              onPointerLeave={() => setLegendTeam(null)}
              onFocus={() => setLegendTeam(item.teamId)}
              onBlur={() => setLegendTeam(null)}
            >
              <svg width="30" height="30" viewBox="-15 -15 30 30" aria-hidden="true">
                <SeriesBadge series={item} r={11} />
              </svg>
              <span className={styles.legendRank}>{item.rank}</span>
              <span className={styles.legendName}>{item.name}</span>
            </button>
          </li>
        ))}
        <li className={styles.legendNote}>
          <svg width="22" height="22" viewBox="-11 -11 22 22" aria-hidden="true">
            <circle r="10" fill="#8e98b8" />
            <Dagger />
          </svg>
          First Blood
        </li>
      </ul>
    </div>
  );
}
