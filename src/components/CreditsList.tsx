import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';

interface Credit {
titleId: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
}

interface CreditsListProps {
  credits: Credit[];
}

export function CreditsList({ credits }: CreditsListProps) {
    console.log(credits[0])
  return (
    <View style={{ padding: 16 }}>
      {credits.map((credit) => (
        <TouchableOpacity key={credit.titleId}>
          <Card style={{ marginBottom: 16, backgroundColor: '#FFF59D' }}>
            <Card.Content style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image
                source={{ uri: credit.poster_path ? `https://image.tmdb.org/t/p/w200${credit.poster_path}` : "/placeholder.svg" }}
                style={{ width: 60, height: 80, borderRadius: 4 }}
              />
              <View style={{ marginLeft: 16 }}>
                <Title>{credit.title || credit.name}</Title>
                <Paragraph>Release Date: {credit.release_date || credit.first_air_date || 'Unknown'}</Paragraph>
              </View>
            </Card.Content>
          </Card>
        </TouchableOpacity>
      ))}
    </View>
  );
}
