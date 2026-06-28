import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';
import { colors } from '../../../theme';
import { Icon } from '../ui/Icon';
import { ChainNode } from '../../../types';
import { tmdbImageUrl } from '../../services/tmdb/client';

// Show the most recent nodes; collapse older ones into a "‹ N" chip. The current
// node and the target always stay visible.
const MAX_VISIBLE = 3;

function posterSource(path?: string | null) {
  return path ? { uri: tmdbImageUrl(path) } : null;
}

function Connector({ dashed }: { dashed?: boolean }) {
  // Dotted = the remaining distance to the target. Built from dots rather than a
  // dashed border, which crashes CoreGraphics on a zero-height view.
  if (dashed) {
    return (
      <View style={styles.dotted}>
        {Array.from({ length: 24 }).map((_, i) => (
          <View key={i} style={styles.dot} />
        ))}
      </View>
    );
  }
  return <View style={[styles.connector, styles.solid]} />;
}

// Scale + fade a node in when it first mounts (i.e. when it's added to the
// chain). Stable keys mean only genuinely new nodes animate, not shifting ones.
function AnimatedNode({ node, current }: { node: ChainNode; current?: boolean }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(v, {
      toValue: 1,
      useNativeDriver: true,
      friction: 6,
      tension: 140,
    }).start();
  }, [v]);
  return (
    <Animated.View
      style={{
        opacity: v,
        transform: [
          { scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) },
        ],
      }}
    >
      <Node node={node} current={current} />
    </Animated.View>
  );
}

function Node({ node, current }: { node: ChainNode; current?: boolean }) {
  const isActor = node.kind === 'actor';
  // The active step is rendered noticeably larger than the rest of the chain.
  const size = current ? 46 : 30;
  const source = posterSource(node.poster);
  return (
    <View
      style={[
        isActor ? styles.actor : styles.film,
        {
          width: size,
          height: isActor ? size : size + 6,
          borderColor: current ? colors.goldBright : colors.borderSubtleGold,
          borderWidth: current ? 2 : 1.5,
        },
      ]}
    >
      {source ? (
        <Image source={source} style={styles.fill} resizeMode="cover" />
      ) : (
        <Icon
          name={isActor ? 'person' : 'film'}
          size={current ? 20 : 13}
          color={current ? colors.goldBright : colors.textSecondary}
        />
      )}
    </View>
  );
}

export function PathTracker({
  path,
  targetPoster,
}: {
  path: ChainNode[];
  targetPoster?: string | null;
}) {
  let leading = 0;
  let visible = path;
  if (path.length > MAX_VISIBLE) {
    leading = path.length - MAX_VISIBLE;
    visible = path.slice(-MAX_VISIBLE);
  }
  const targetSrc = posterSource(targetPoster);

  return (
    <View
      style={styles.row}
      accessible
      accessibilityRole="summary"
      accessibilityLabel={`Path: ${Math.max(0, path.length - 1)} moves`}
    >
      {leading > 0 && (
        <>
          <View style={styles.chip}>
            <Text style={styles.chipText} maxFontSizeMultiplier={1.5}>{`‹ ${leading}`}</Text>
          </View>
          <Connector />
        </>
      )}
      {visible.map((n, i) => (
        <React.Fragment key={`${n.kind}-${n.id}-${leading + i}`}>
          <AnimatedNode node={n} current={i === visible.length - 1} />
          {i < visible.length - 1 && <Connector />}
        </React.Fragment>
      ))}
      <Connector dashed />
      <View style={styles.target}>
        {targetSrc ? (
          <Image source={targetSrc} style={styles.fill} resizeMode="cover" />
        ) : (
          <Icon name="flag" size={13} color={colors.gold} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  connector: { flex: 1, marginHorizontal: 4 },
  solid: { height: 1.5, backgroundColor: '#C9A24A66' },
  dotted: {
    flex: 1,
    height: 2,
    marginHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  dot: { width: 3, height: 2, borderRadius: 1, backgroundColor: '#C9A24A99', marginRight: 3 },
  fill: { width: '100%', height: '100%' },
  chip: {
    height: 28,
    paddingHorizontal: 9,
    borderRadius: 14,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: { color: colors.textSecondary, fontSize: 11 },
  actor: {
    borderRadius: 999,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  film: {
    borderRadius: 5,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  target: {
    width: 30,
    height: 38,
    borderRadius: 5,
    backgroundColor: colors.goldTintBg,
    borderWidth: 1,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
