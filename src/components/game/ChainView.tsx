import React, { useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts } from '../../../theme';
import { Icon } from '../ui/Icon';
import { ChainNode } from '../../../types';

function posterSource(path?: string | null) {
  return path ? { uri: `https://image.tmdb.org/t/p/w185${path}` } : null;
}

// The solved chain, revealed in gold. It fills whatever vertical space the parent
// gives it; if the chain is taller than that space, it slowly auto-scrolls so the
// player can watch the journey land on the target. User touch stops the scroll.
export function ChainView({ chain }: { chain: ChainNode[] }) {
  const scrollRef = useRef<ScrollView>(null);
  const anim = useRef(new Animated.Value(0)).current;
  const stopped = useRef(false);
  const [contentH, setContentH] = useState(0);
  const [viewH, setViewH] = useState(0);

  useEffect(() => {
    if (!viewH || contentH <= viewH) return;
    const distance = contentH - viewH;
    const listenerId = anim.addListener(({ value }) => {
      if (!stopped.current) scrollRef.current?.scrollTo({ y: value, animated: false });
    });
    const duration = Math.min(12000, Math.max(3500, chain.length * 900));
    const timer = setTimeout(() => {
      Animated.timing(anim, { toValue: distance, duration, useNativeDriver: false }).start();
    }, 700);
    return () => {
      clearTimeout(timer);
      anim.removeListener(listenerId);
    };
  }, [contentH, viewH, chain.length, anim]);

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
      >
        {chain.map((n, i) => {
          const isActor = n.kind === 'actor';
          const isTarget = i === chain.length - 1;
          return (
            <View key={`${n.kind}-${n.id}-${i}`}>
              <View style={styles.nodeRow}>
                <View
                  style={[
                    isActor ? styles.actor : styles.film,
                    isTarget && styles.targetNode,
                  ]}
                >
                  {posterSource(n.poster) ? (
                    <Image
                      source={posterSource(n.poster)!}
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
                      {n.name}
                    </Text>
                    <Text style={styles.reached} maxFontSizeMultiplier={1.5}>Target reached</Text>
                  </View>
                ) : (
                  <Text
                    style={i === 0 ? styles.startName : styles.nodeName}
                    numberOfLines={1}
                    maxFontSizeMultiplier={1.5}
                  >
                    {n.name}
                  </Text>
                )}
              </View>
              {i < chain.length - 1 && <View style={styles.connector} />}
            </View>
          );
        })}
      </ScrollView>
      <LinearGradient
        colors={[colors.background, 'rgba(14,14,16,0)']}
        style={styles.topFade}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  viewport: { flex: 1 },
  scrollContent: { paddingBottom: 8 },
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
  topFade: { position: 'absolute', top: 0, left: 0, right: 0, height: 28, pointerEvents: 'none' },
});
