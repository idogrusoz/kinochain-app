import React, { useEffect, useRef } from 'react';
import { View, Image, TouchableOpacity, FlatList } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';
import { theme } from '../../theme';
import { Credit } from '../../types';
import { PlaceholderImage } from './PlaceholderImage';

interface CreditsListProps {
  credits: Credit[];
  onSelectCredit: (creditId: number) => void;
}

// Memoize the individual credit item component
const CreditItem = React.memo(
  ({
    credit,
    onSelectCredit,
  }: {
    credit: Credit;
    onSelectCredit: (id: number) => void;
  }) => (
    <TouchableOpacity onPress={() => onSelectCredit(credit.titleId)}>
      <Card style={{ marginBottom: 8, backgroundColor: theme.background }}>
        <Card.Content style={{ flexDirection: 'row', alignItems: 'center' }}>
          {credit.poster_path ? (
            <Image
              source={{
                uri: `https://image.tmdb.org/t/p/w185${credit.poster_path}`,
              }}
              style={{ width: 60, height: 80, borderRadius: 4 }}
            />
          ) : (
            <PlaceholderImage />
          )}
          <View style={{ marginLeft: 16, flex: 1 }}>
            <Title
              style={{ fontSize: 16, color: theme.text, flexWrap: 'wrap' }}
            >
              {credit.title}
            </Title>
            <Paragraph style={{ fontSize: 12, color: theme.text }}>
              {credit.name}
            </Paragraph>
            {credit.releaseDate && (
              <Paragraph style={{ fontSize: 12, color: theme.text }}>
                {credit.releaseDate.split('-')[0] || 'Unknown'}
              </Paragraph>
            )}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  )
);

export function CreditsList({ credits, onSelectCredit }: CreditsListProps) {
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, [credits]);

  // Define fixed height for better performance
  const getItemLayout = (data: any, index: number) => ({
    length: 96, // Card height (80) + marginBottom (8) + some padding
    offset: 96 * index,
    index,
  });

  return (
    <FlatList
      ref={flatListRef}
      data={credits}
      renderItem={({ item }) => (
        <CreditItem
          credit={item}
          onSelectCredit={onSelectCredit}
        />
      )}
      keyExtractor={(item) => item.titleId.toString()}
      contentContainerStyle={{ padding: 8 }}
      getItemLayout={getItemLayout}
      windowSize={5}
      maxToRenderPerBatch={5}
      initialNumToRender={10}
      removeClippedSubviews={true}
    />
  );
}
