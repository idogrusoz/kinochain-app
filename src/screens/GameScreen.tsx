import React, { useState, useEffect } from 'react';
import { View, Image, ScrollView } from 'react-native';
import { Text, Card, Title, Paragraph } from 'react-native-paper';
import { Game, Actor } from '../../types';
import { CreditsList } from '../components/CreditsList';
import { startNewGame } from '../services/gameService';

export default function GameScreen() {
  const [game, setGame] = useState<Game | null>(null);
  const [currentActor, setCurrentActor] = useState<Actor | null>(null);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const newGame = await startNewGame();
        setGame(newGame);
        setCurrentActor(newGame.startingActor);
      } catch (error) {
        console.error('Error starting new game:', error);
      }
    };

    fetchGame();
  }, []);

  if (!game || !currentActor) return <Text>Loading...</Text>;

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFDE7' }}>
      {/* Target Actor Section */}
      <View style={{ backgroundColor: 'black', padding: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#FFF176', marginBottom: 8 }}>Target Actor</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image
            source={{ uri: game.targetActor.profile_path ? `https://image.tmdb.org/t/p/w200${game.targetActor.profile_path}` : "/placeholder.svg" }}
            style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: '#FFF176' }}
          />
          <Text style={{ fontSize: 18, color: '#FFF176', marginLeft: 16 }}>{game.targetActor.name}</Text>
        </View>
      </View>

      {/* Current Selection Section */}
      <Card style={{ margin: 16, backgroundColor: '#FFF9C4' }}>
        <Card.Content>
          <Title>Current Actor</Title>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            <Image
              source={{ uri: currentActor.profile_path ? `https://image.tmdb.org/t/p/w200${currentActor.profile_path}` : "/placeholder.svg" }}
              style={{ width: 96, height: 96, borderRadius: 8 }}
            />
            <Text style={{ fontSize: 20, marginLeft: 16 }}>{currentActor.name}</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Credits List */}
      <ScrollView style={{ flex: 1 }}>
        <CreditsList credits={currentActor.combinedCredits || []} />
      </ScrollView>
    </View>
  );
}
