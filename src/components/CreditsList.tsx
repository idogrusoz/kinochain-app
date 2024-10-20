import React, { useEffect, useRef } from 'react';
import { View, Image, TouchableOpacity, FlatList } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';
import { theme } from '../../theme';
import { Credit } from '../../types';

interface CreditsListProps {
  credits: Credit[];
  onSelectCredit: (creditId: number) => void;
}

export function CreditsList({ credits, onSelectCredit }: CreditsListProps) {
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, [credits]);

  const renderItem = ({ item: credit }: { item: Credit }) => (
    <TouchableOpacity
      onPress={() => onSelectCredit(credit.titleId)}
    >
      <Card
        style={{
          marginBottom: 8,
          backgroundColor: theme.background,
        }}
      >
        <Card.Content
          style={{ flexDirection: 'row', alignItems: 'center' }}
        >
          <Image
            source={{
              uri: credit.poster_path
                ? `https://image.tmdb.org/t/p/w185${credit.poster_path}`
                : '/placeholder.svg',
            }}
            style={{ width: 60, height: 80, borderRadius: 4 }}
          />
          <View style={{ marginLeft: 16, flex: 1 }}>
            <Title
              style={{
                fontSize: 16,
                color: theme.text,
                flexWrap: 'wrap',
              }}
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
  );

  return (
    <FlatList
      ref={flatListRef}
      data={credits}
      renderItem={renderItem}
      keyExtractor={(item) => item.titleId.toString()}
      contentContainerStyle={{ padding: 8 }}
    />
  );
}
