import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';
import { theme } from '../../theme';
import { Credit } from '../../types';


interface CreditsListProps {
  credits: Credit[];
  onSelectCredit: (creditId: number) => void;
}

export function CreditsList({ credits, onSelectCredit }: CreditsListProps) {
  return (
    <View style={{ padding: 8 }}>
      {credits.map((credit) => (
        <TouchableOpacity key={credit.titleId} onPress={() => onSelectCredit(credit.titleId)}>
          <Card style={{ marginBottom: 0, padding: 0, backgroundColor: theme.background }}>
            <Card.Content style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image
                source={{
                  uri: credit.poster_path
                    ? `https://image.tmdb.org/t/p/w185${credit.poster_path}`
                    : '/placeholder.svg',
                }}
                style={{ width: 60, height: 80, borderRadius: 4 }}
              />
              <View style={{ marginLeft: 16 }}>
                <Title style={{ fontSize: 16, color: theme.text, width: 300, flexWrap: 'wrap' }}>
                  {credit.title || credit.name}
                </Title>
                <Paragraph style={{ fontSize: 12, color: theme.text }}>
                  {credit.releaseDate?.split('-')[0] || 'Unknown'}
                </Paragraph>
              </View>
            </Card.Content>
          </Card>
        </TouchableOpacity>
      ))}
    </View>
  );
}
