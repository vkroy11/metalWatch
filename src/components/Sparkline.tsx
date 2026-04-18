import { memo, useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, RadialGradient, Stop } from 'react-native-svg';
import type { ChartPoint, Direction } from '../types/metals';
import { useTokens } from '../theme/ThemeProvider';

type Props = {
  data: ChartPoint[];
  direction: Direction;
  height?: number;
  width?: number;
};

const VIEW_W = 120;
const VIEW_H = 40;

function buildPath(data: ChartPoint[]): { line: string; area: string } {
  if (data.length < 2) return { line: '', area: '' };
  const xs = data.map(d => d.t);
  const vs = data.map(d => d.v);
  const minX = xs[0];
  const maxX = xs[xs.length - 1];
  const minV = Math.min(...vs);
  const maxV = Math.max(...vs);
  const rangeX = maxX - minX || 1;
  const rangeV = maxV - minV || 1;
  const pad = 2;
  const innerH = VIEW_H - pad * 2;

  const points = data.map((d) => {
    const x = ((d.t - minX) / rangeX) * VIEW_W;
    const y = pad + innerH - ((d.v - minV) / rangeV) * innerH;
    return [x, y] as const;
  });

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(' ');
  const area = `${line} L${VIEW_W},${VIEW_H} L0,${VIEW_H} Z`;
  return { line, area };
}

function SparklineBase({ data, direction, height = 40, width }: Props) {
  const tokens = useTokens();
  const { line, area } = useMemo(() => buildPath(data), [data]);

  const up = direction !== 'loss';
  const lineId = `spark-line-${up ? 'up' : 'down'}`;
  const fillId = `spark-fill-${up ? 'up' : 'down'}`;
  const topColor = up ? tokens.colors.gain : tokens.colors.loss;
  const bottomColor = up ? tokens.colors.gainDeep : tokens.colors.lossDeep;

  if (!line) return <View style={{ height }} />;

  return (
    <View style={{ height, width: width ?? '100%' }}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} preserveAspectRatio="none">
        <Defs>
          <LinearGradient id={lineId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={topColor} />
            <Stop offset="1" stopColor={bottomColor} />
          </LinearGradient>
          <RadialGradient id={fillId} cx="50%" cy="100%" rx="80%" ry="80%">
            <Stop offset="0" stopColor={bottomColor} stopOpacity={0.28} />
            <Stop offset="1" stopColor={bottomColor} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Path d={area} fill={`url(#${fillId})`} />
        <Path d={line} fill="none" stroke={`url(#${lineId})`} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </View>
  );
}

export const Sparkline = memo(SparklineBase);
