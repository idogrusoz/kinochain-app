import React, { useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { hapticLight, hapticSuccess } from '../../services/settings';
import { colors, fonts } from '../../../theme';
import { Icon } from '../ui/Icon';
import { ChainNode } from '../../../types';
import i18n from '../../i18n/i18n';

function posterSource(path?: string | null) {
  return path ? { uri: `https://image.tmdb.org/t/p/w185${path}` } : null;
}

const NODE_STAGGER = 180;
const NODE_SM = 42;
const NODE_LG = 52;
const CONNECTOR_SM = 14;
const CONNECTOR_LG = 16;

function ChainNodeRow({
  node,
  index,
  isTarget,
  isFirst,
  entranceDelay,
  large,
}: {
  node: ChainNode;
  index: number;
  isTarget: boolean;
  isFirst: boolean;
  entranceDelay: number;
  large: boolean;
}) {
  const isActor = node.kind === 'actor';
  const scale = useRef(new Animated.Value(entranceDelay > 0 ? 0.6 : 1)).current;
  const opacity = useRef(new Animated.Value(entranceDelay > 0 ? 0 : 1)).current;
  const sz = large ? NODE_LG : NODE_SM;

  useEffect(() => {
    if (entranceDelay <= 0) return;
    const delay = entranceDelay + index * NODE_STAGGER;
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: isTarget ? 1.08 : 1,
          damping: isTarget ? 8 : 14,
          stiffness: isTarget ? 120 : 160,
          mass: 1,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (isTarget) {
          Animated.spring(scale, {
            toValue: 1,
            damping: 14,
            stiffness: 160,
            mass: 1,
            useNativeDriver: true,
          }).start();
          hapticSuccess();
        } else {
          hapticLight();
        }
      });
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  const nodeStyle = isActor
    ? [styles.actor, { width: sz, height: sz }]
    : [styles.film, { width: sz, height: sz }];

  return (
    <Animated.View style={{ opacity, transform: [{ scale }] }}>
      <View style={[styles.nodeRow, large && styles.nodeRowLarge]}>
        <View style={[...nodeStyle, isTarget && styles.targetNode]}>
          {posterSource(node.poster) ? (
            <Image
              source={posterSource(node.poster)!}
              style={styles.fill}
              resizeMode="cover"
            />
          ) : (
            <Icon
              name={isTarget ? 'flag' : isActor ? 'person' : 'film'}
              size={large ? 24 : 20}
              color={isTarget ? colors.onGold : colors.goldBright}
            />
          )}
        </View>
        {isTarget ? (
          <View style={{ flex: 1 }}>
            <Text style={[styles.targetName, large && styles.targetNameLg]} numberOfLines={1} maxFontSizeMultiplier={1.5}>
              {node.name}
            </Text>
            <Text style={[styles.reached, large && styles.reachedLg]} maxFontSizeMultiplier={1.5}>{i18n.t('chain.targetReached')}</Text>
          </View>
        ) : (
          <Text
            style={[isFirst ? styles.startName : styles.nodeName, large && styles.nodeNameLg]}
            numberOfLines={1}
            maxFontSizeMultiplier={1.5}
          >
            {node.name}
          </Text>
        )}
      </View>
    </Animated.View>
  );
}

function ConnectorLine({
  index,
  entranceDelay,
  large,
}: {
  index: number;
  entranceDelay: number;
  large: boolean;
}) {
  const scaleY = useRef(new Animated.Value(entranceDelay > 0 ? 0 : 1)).current;

  useEffect(() => {
    if (entranceDelay <= 0) return;
    const delay = entranceDelay + index * NODE_STAGGER + 100;
    const timer = setTimeout(() => {
      Animated.timing(scaleY, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View
      style={[
        styles.connector,
        large && styles.connectorLarge,
        { transform: [{ scaleY }] },
      ]}
    />
  );
}

function ConnectorPulse({
  chainLength,
  entranceDelay,
}: {
  chainLength: number;
  entranceDelay: number;
}) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (entranceDelay <= 0) return;
    const pulseStart = entranceDelay + chainLength * NODE_STAGGER + 400;
    const nodeHeight = NODE_SM + CONNECTOR_SM;
    const totalDistance = (chainLength - 1) * nodeHeight;

    const timer = setTimeout(() => {
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 100, useNativeDriver: true }),
        Animated.timing(translateY, {
          toValue: totalDistance,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    }, pulseStart);
    return () => clearTimeout(timer);
  }, []);

  if (entranceDelay <= 0) return null;

  return (
    <Animated.View
      style={[
        styles.pulse,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
      pointerEvents="none"
    />
  );
}

export function ChainView({
  chain,
  entranceDelay = 0,
  centered = false,
  large = false,
}: {
  chain: ChainNode[];
  entranceDelay?: number;
  centered?: boolean;
  large?: boolean;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const anim = useRef(new Animated.Value(0)).current;
  const stopped = useRef(false);
  const [contentH, setContentH] = useState(0);
  const [viewH, setViewH] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  const mountTime = useRef(Date.now());
  const scrollStarted = useRef(false);

  useEffect(() => {
    if (!viewH || contentH <= viewH || stopped.current || scrollStarted.current) return;
    scrollStarted.current = true;
    const distance = contentH - viewH;
    const listenerId = anim.addListener(({ value }) => {
      if (!stopped.current) scrollRef.current?.scrollTo({ y: value, animated: false });
    });
    const duration = Math.min(12000, Math.max(3500, chain.length * 900));
    const scrollAfterNode = Math.min(8, chain.length);
    const allNodesRevealed = entranceDelay > 0
      ? entranceDelay + scrollAfterNode * NODE_STAGGER + 400
      : 700;
    const elapsed = Date.now() - mountTime.current;
    const delay = Math.max(300, allNodesRevealed - elapsed);
    const timer = setTimeout(() => {
      Animated.timing(anim, { toValue: distance, duration, useNativeDriver: false }).start();
    }, delay);
    return () => {
      clearTimeout(timer);
      anim.removeListener(listenerId);
    };
  }, [contentH, viewH, chain.length, anim, entranceDelay]);

  return (
    <View
      style={styles.viewport}
      onLayout={(e) => setViewH(e.nativeEvent.layout.height)}
    >
      <ScrollView
        ref={scrollRef}
        onContentSizeChange={(_w, h) => setContentH(h)}
        contentContainerStyle={[styles.scrollContent, centered && styles.scrollContentCentered]}
        onScrollBeginDrag={() => {
          stopped.current = true;
          anim.stopAnimation();
        }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={(e) => setScrollY(e.nativeEvent.contentOffset.y)}
      >
        {chain.map((n, i) => (
          <View key={`${n.kind}-${n.id}-${i}`}>
            <ChainNodeRow
              node={n}
              index={i}
              isTarget={i === chain.length - 1}
              isFirst={i === 0}
              entranceDelay={entranceDelay}
              large={large}
            />
            {i < chain.length - 1 && (
              <ConnectorLine index={i} entranceDelay={entranceDelay} large={large} />
            )}
          </View>
        ))}
      </ScrollView>

      {!centered && <ConnectorPulse chainLength={chain.length} entranceDelay={entranceDelay} />}

      {scrollY > 4 && (
        <LinearGradient
          colors={[colors.background, 'rgba(14,14,16,0)']}
          style={styles.topFade}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  viewport: { flex: 1 },
  scrollContent: { paddingBottom: 8, paddingHorizontal: 16 },
  scrollContentCentered: { alignItems: 'center' },
  nodeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  nodeRowLarge: { gap: 14 },
  fill: { width: '100%', height: '100%' },
  actor: {
    width: NODE_SM,
    height: NODE_SM,
    borderRadius: 999,
    backgroundColor: colors.goldTintBg,
    borderWidth: 1.5,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  film: {
    width: NODE_SM,
    height: NODE_SM,
    borderRadius: 6,
    backgroundColor: colors.goldTintBg,
    borderWidth: 1.5,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  targetNode: { backgroundColor: colors.gold, borderColor: colors.goldBright },
  connector: { width: 2, height: CONNECTOR_SM, backgroundColor: colors.gold, marginLeft: 20 },
  connectorLarge: { height: CONNECTOR_LG, marginLeft: 25 },
  startName: { fontFamily: fonts.display.medium, fontSize: 15, color: colors.textPrimary, flex: 1 },
  nodeName: { fontFamily: fonts.text.regular, fontSize: 15, color: colors.textSoft, flex: 1 },
  nodeNameLg: { fontSize: 16 },
  targetName: { fontFamily: fonts.display.semibold, fontSize: 15, color: colors.textPrimary },
  targetNameLg: { fontSize: 17 },
  reached: {
    fontFamily: fonts.text.medium,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.gold,
    textTransform: 'uppercase',
    marginTop: 1,
  },
  reachedLg: { fontSize: 11 },
  pulse: {
    position: 'absolute',
    top: 16,
    left: 34,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.goldBright,
  },
  topFade: { position: 'absolute', top: 0, left: 0, right: 0, height: 28, pointerEvents: 'none' },
});
