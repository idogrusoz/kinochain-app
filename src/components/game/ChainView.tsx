import React, { useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, fonts } from '../../../theme';
import { Icon } from '../ui/Icon';
import { ChainNode } from '../../../types';
import i18n from '../../i18n/i18n';

function posterSource(path?: string | null) {
  return path ? { uri: `https://image.tmdb.org/t/p/w185${path}` } : null;
}

const NODE_STAGGER = 180;

function ChainNodeRow({
  node,
  index,
  isTarget,
  isFirst,
  entranceDelay,
}: {
  node: ChainNode;
  index: number;
  isTarget: boolean;
  isFirst: boolean;
  entranceDelay: number;
}) {
  const isActor = node.kind === 'actor';
  const scale = useRef(new Animated.Value(entranceDelay > 0 ? 0.6 : 1)).current;
  const opacity = useRef(new Animated.Value(entranceDelay > 0 ? 0 : 1)).current;

  useEffect(() => {
    if (entranceDelay <= 0) return;
    const delay = entranceDelay + index * NODE_STAGGER;
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: isTarget ? 1.15 : 1,
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
        // For target, settle back to 1.0 after overshoot
        if (isTarget) {
          Animated.spring(scale, {
            toValue: 1,
            damping: 14,
            stiffness: 160,
            mass: 1,
            useNativeDriver: true,
          }).start();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        } else {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        }
      });
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ scale }] }}>
      <View style={styles.nodeRow}>
        <View
          style={[
            isActor ? styles.actor : styles.film,
            isTarget && styles.targetNode,
          ]}
        >
          {posterSource(node.poster) ? (
            <Image
              source={posterSource(node.poster)!}
              style={styles.fill}
              resizeMode="cover"
            />
          ) : (
            <Icon
              name={isTarget ? 'flag' : isActor ? 'person' : 'film'}
              size={15}
              color={isTarget ? colors.onGold : colors.goldBright}
            />
          )}
        </View>
        {isTarget ? (
          <View style={{ flex: 1 }}>
            <Text style={styles.targetName} numberOfLines={1} maxFontSizeMultiplier={1.5}>
              {node.name}
            </Text>
            <Text style={styles.reached} maxFontSizeMultiplier={1.5}>{i18n.t('chain.targetReached')}</Text>
          </View>
        ) : (
          <Text
            style={isFirst ? styles.startName : styles.nodeName}
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
}: {
  index: number;
  entranceDelay: number;
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
      style={[styles.connector, { transform: [{ scaleY }] }]}
    />
  );
}

// A gold dot that travels down the chain after all nodes are revealed.
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
    // Start after all nodes have appeared
    const pulseStart = entranceDelay + chainLength * NODE_STAGGER + 400;
    const nodeHeight = 34 + 13; // node + connector
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
}: {
  chain: ChainNode[];
  entranceDelay?: number;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const anim = useRef(new Animated.Value(0)).current;
  const stopped = useRef(false);
  const [contentH, setContentH] = useState(0);
  const [viewH, setViewH] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (!viewH || contentH <= viewH) return;
    const distance = contentH - viewH;
    const listenerId = anim.addListener(({ value }) => {
      if (!stopped.current) scrollRef.current?.scrollTo({ y: value, animated: false });
    });
    const duration = Math.min(12000, Math.max(3500, chain.length * 900));
    // Auto-scroll starts after entrance animations finish
    const scrollStart = entranceDelay > 0
      ? entranceDelay + chain.length * NODE_STAGGER + 1400
      : 700;
    const timer = setTimeout(() => {
      Animated.timing(anim, { toValue: distance, duration, useNativeDriver: false }).start();
    }, scrollStart);
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
        contentContainerStyle={styles.scrollContent}
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
            />
            {i < chain.length - 1 && (
              <ConnectorLine index={i} entranceDelay={entranceDelay} />
            )}
          </View>
        ))}
      </ScrollView>

      {/* Connector pulse travels down the chain */}
      <ConnectorPulse chainLength={chain.length} entranceDelay={entranceDelay} />

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
  nodeRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  fill: { width: '100%', height: '100%' },
  actor: {
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: colors.goldTintBg,
    borderWidth: 1.5,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  film: {
    width: 34,
    height: 34,
    borderRadius: 6,
    backgroundColor: colors.goldTintBg,
    borderWidth: 1.5,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  targetNode: { backgroundColor: colors.gold, borderColor: colors.goldBright },
  connector: { width: 2, height: 13, backgroundColor: colors.gold, marginLeft: 16 },
  startName: { fontFamily: fonts.display.medium, fontSize: 14, color: colors.textPrimary, flex: 1 },
  nodeName: { fontFamily: fonts.text.regular, fontSize: 14, color: colors.textSoft, flex: 1 },
  targetName: { fontFamily: fonts.display.semibold, fontSize: 14, color: colors.textPrimary },
  reached: {
    fontFamily: fonts.text.medium,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.gold,
    textTransform: 'uppercase',
    marginTop: 1,
  },
  pulse: {
    position: 'absolute',
    top: 16,
    left: 30,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.goldBright,
  },
  topFade: { position: 'absolute', top: 0, left: 0, right: 0, height: 28, pointerEvents: 'none' },
});
