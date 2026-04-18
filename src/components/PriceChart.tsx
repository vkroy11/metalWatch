import { memo, useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Path,
  RadialGradient,
  Stop,
  Line as SvgLine,
  Circle,
  Text as SvgText,
} from 'react-native-svg';
import { format } from 'date-fns';
import type { ChartPoint, Direction, Range } from '../types/metals';
import { useTokens } from '../theme/ThemeProvider';

type Props = {
  data: ChartPoint[];
  direction: Direction;
  range: Range;
  height?: number;
};

const PAD_L = 46;
const PAD_R = 10;
const PAD_T = 12;
const PAD_B = 28;

function formatY(value: number): string {
  if (value >= 1_00_000) return `₹${(value / 1000).toFixed(0)}k`;
  if (value >= 1000) return `₹${value.toFixed(0)}`;
  return `₹${value.toFixed(2)}`;
}

function formatYBadge(value: number): string {
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

function formatX(ts: number, range: Range): string {
  const d = new Date(ts);
  if (range === '1Y') return format(d, 'MMM yy');
  return format(d, 'dd MMM');
}

function formatXBadge(ts: number, range: Range): string {
  const d = new Date(ts);
  if (range === '1Y') return format(d, 'MMM yyyy');
  return format(d, 'dd MMM yyyy');
}

function buildSmoothLinePath(points: Array<{ x: number; y: number }>): string {
  if (points.length < 2) return '';
  let d = `M${points[0].x.toFixed(2)},${points[0].y.toFixed(2)}`;
  for (let i = 1; i < points.length; i++) {
    const [px, py] = [points[i - 1].x, points[i - 1].y];
    const [x, y] = [points[i].x, points[i].y];
    const midX = (px + x) / 2;
    d += ` C${midX.toFixed(2)},${py.toFixed(2)} ${midX.toFixed(2)},${y.toFixed(2)} ${x.toFixed(2)},${y.toFixed(2)}`;
  }
  return d;
}

function PriceChartBase({ data, direction, range, height = 260 }: Props) {
  const tokens = useTokens();
  const [containerW, setContainerW] = useState(0);
  const [scrubIdx, setScrubIdx] = useState<number | null>(null);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0 && w !== containerW) setContainerW(w);
  }, [containerW]);

  const model = useMemo(() => {
    if (data.length < 2 || containerW === 0) return null;

    const plotW = containerW - PAD_L - PAD_R;
    const plotH = height - PAD_T - PAD_B;

    const ts = data.map(d => d.t);
    const vs = data.map(d => d.v);
    const tmin = ts[0];
    const tmax = ts[ts.length - 1];
    let vmin = Math.min(...vs);
    let vmax = Math.max(...vs);
    // 5% headroom so line/fill don't kiss the edges.
    const pad = Math.max((vmax - vmin) * 0.05, Math.abs(vmax) * 0.001, 1);
    vmin -= pad;
    vmax += pad;

    const rangeT = Math.max(tmax - tmin, 1);
    const rangeV = Math.max(vmax - vmin, 1);

    const pts = data.map(d => ({
      t: d.t,
      v: d.v,
      x: PAD_L + ((d.t - tmin) / rangeT) * plotW,
      y: PAD_T + plotH - ((d.v - vmin) / rangeV) * plotH,
    }));

    const yTicks = [0, 1 / 3, 2 / 3, 1].map(f => ({
      v: vmin + f * rangeV,
      y: PAD_T + plotH - f * plotH,
    }));

    const xTicks = [0, 1 / 3, 2 / 3, 1].map(f => ({
      t: tmin + f * rangeT,
      x: PAD_L + f * plotW,
    }));

    const linePath = buildSmoothLinePath(pts);
    const areaPath = `${linePath} L${pts[pts.length - 1].x.toFixed(2)},${(PAD_T + plotH).toFixed(2)} L${pts[0].x.toFixed(2)},${(PAD_T + plotH).toFixed(2)} Z`;

    return { pts, yTicks, xTicks, linePath, areaPath, plotW, plotH };
  }, [data, containerW, height]);

  const pickNearestIdx = useCallback((touchX: number) => {
    if (!model) return null;
    const pts = model.pts;
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < pts.length; i++) {
      const d = Math.abs(pts[i].x - touchX);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    return bestIdx;
  }, [model]);

  const handleScrub = useCallback((touchX: number) => {
    const idx = pickNearestIdx(touchX);
    setScrubIdx(idx);
  }, [pickNearestIdx]);

  const handleRelease = useCallback(() => setScrubIdx(null), []);

  const pan = useMemo(() =>
    Gesture.Pan()
      .minDistance(0)
      .activeOffsetX([-5, 5])
      .onBegin((e) => {
        runOnJS(handleScrub)(e.x);
      })
      .onUpdate((e) => {
        runOnJS(handleScrub)(e.x);
      })
      .onFinalize(() => {
        runOnJS(handleRelease)();
      }),
    [handleScrub, handleRelease],
  );

  const up = direction !== 'loss';
  const topColor = up ? tokens.colors.goldBright : tokens.colors.loss;
  const bottomColor = up ? tokens.colors.gold : tokens.colors.lossDeep;

  if (data.length < 2) {
    return (
      <View style={[styles.empty, { height, borderColor: tokens.colors.stroke }]}>
        <Text style={{ color: tokens.colors.muted, fontFamily: 'Inter-Medium' }}>
          Not enough data for this range
        </Text>
      </View>
    );
  }

  const scrubPoint = scrubIdx != null && model ? model.pts[scrubIdx] : null;

  return (
    <GestureDetector gesture={pan}>
      <View onLayout={onLayout} style={{ height, width: '100%' }}>
        {model ? (
          <>
            <Svg width="100%" height={height}>
              <Defs>
                <SvgLinearGradient id="chart-line" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={topColor} />
                  <Stop offset="1" stopColor={bottomColor} />
                </SvgLinearGradient>
                <RadialGradient id="chart-fill" cx="50%" cy="100%" rx="80%" ry="80%">
                  <Stop offset="0" stopColor={bottomColor} stopOpacity={0.30} />
                  <Stop offset="1" stopColor={bottomColor} stopOpacity={0} />
                </RadialGradient>
              </Defs>

              {/* Y gridlines + labels */}
              {model.yTicks.map((t, i) => (
                <SvgLine
                  key={`yg-${i}`}
                  x1={PAD_L}
                  x2={PAD_L + model.plotW}
                  y1={t.y}
                  y2={t.y}
                  stroke="rgba(255,255,255,0.06)"
                  strokeDasharray="3 4"
                  strokeWidth={1}
                />
              ))}
              {model.yTicks.map((t, i) => (
                <SvgText
                  key={`yt-${i}`}
                  x={PAD_L - 6}
                  y={t.y + 3}
                  textAnchor="end"
                  fontSize={9}
                  fontFamily="IBMPlexMono"
                  fill={tokens.colors.muted}
                >
                  {formatY(t.v)}
                </SvgText>
              ))}

              {/* X tick labels (no vertical gridlines to keep it calm) */}
              {model.xTicks.map((t, i) => (
                <SvgText
                  key={`xt-${i}`}
                  x={t.x}
                  y={height - PAD_B + 14}
                  textAnchor={i === 0 ? 'start' : i === model.xTicks.length - 1 ? 'end' : 'middle'}
                  fontSize={9}
                  fontFamily="IBMPlexMono"
                  fill={tokens.colors.muted}
                >
                  {formatX(t.t, range)}
                </SvgText>
              ))}

              {/* Area + Line */}
              <Path d={model.areaPath} fill="url(#chart-fill)" />
              <Path
                d={model.linePath}
                fill="none"
                stroke="url(#chart-line)"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Last-point marker (hidden while scrubbing for clarity) */}
              {!scrubPoint && (
                <>
                  <Circle
                    cx={model.pts[model.pts.length - 1].x}
                    cy={model.pts[model.pts.length - 1].y}
                    r={4}
                    fill={topColor}
                    stroke={tokens.colors.bg}
                    strokeWidth={2}
                  />
                  <Circle
                    cx={model.pts[model.pts.length - 1].x}
                    cy={model.pts[model.pts.length - 1].y}
                    r={8}
                    fill={topColor}
                    fillOpacity={0.2}
                  />
                </>
              )}

              {/* Scrub overlay */}
              {scrubPoint && (
                <>
                  {/* vertical dotted guide parallel to Y-axis */}
                  <SvgLine
                    x1={scrubPoint.x}
                    x2={scrubPoint.x}
                    y1={PAD_T}
                    y2={PAD_T + model.plotH}
                    stroke="rgba(255,255,255,0.45)"
                    strokeDasharray="3 3"
                    strokeWidth={1}
                  />
                  {/* horizontal dotted guide from point → Y axis */}
                  <SvgLine
                    x1={PAD_L}
                    x2={scrubPoint.x}
                    y1={scrubPoint.y}
                    y2={scrubPoint.y}
                    stroke="rgba(255,255,255,0.45)"
                    strokeDasharray="3 3"
                    strokeWidth={1}
                  />
                  {/* point marker */}
                  <Circle
                    cx={scrubPoint.x}
                    cy={scrubPoint.y}
                    r={5}
                    fill={topColor}
                    stroke={tokens.colors.bg}
                    strokeWidth={2}
                  />
                </>
              )}
            </Svg>

            {/* Scrub labels (rendered as RN text overlay for font fidelity) */}
            {scrubPoint ? (
              <>
                <View
                  pointerEvents="none"
                  style={[
                    styles.yBadge,
                    {
                      top: Math.max(PAD_T - 8, Math.min(scrubPoint.y - 9, height - PAD_B - 10)),
                      backgroundColor: topColor,
                    },
                  ]}
                >
                  <Text style={[styles.yBadgeText, { color: tokens.colors.bg }]}>
                    {formatYBadge(scrubPoint.v)}
                  </Text>
                </View>
                <View
                  pointerEvents="none"
                  style={[
                    styles.xBadge,
                    {
                      left: Math.max(PAD_L - 36, Math.min(scrubPoint.x - 44, containerW - PAD_R - 52)),
                      top: height - PAD_B + 2,
                      backgroundColor: topColor,
                    },
                  ]}
                >
                  <Text style={[styles.xBadgeText, { color: tokens.colors.bg }]}>
                    {formatXBadge(scrubPoint.t, range)}
                  </Text>
                </View>
              </>
            ) : null}
          </>
        ) : null}
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  empty: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yBadge: {
    position: 'absolute',
    left: 2,
    minWidth: PAD_L - 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    alignItems: 'flex-end',
  },
  yBadgeText: { fontFamily: 'IBMPlexMono-SemiBold', fontSize: 9, letterSpacing: -0.1 },
  xBadge: {
    position: 'absolute',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignItems: 'center',
    minWidth: 88,
  },
  xBadgeText: { fontFamily: 'IBMPlexMono-SemiBold', fontSize: 9, letterSpacing: 0.2 },
});

export const PriceChart = memo(PriceChartBase);
