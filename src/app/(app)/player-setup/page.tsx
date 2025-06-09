'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameContext } from '@/components/AppProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { UserPlus, Trash2, ArrowRight, Users } from 'lucide-react';
import type { Player } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function PlayerSetupPage() {
  const { players, dispatch } = useGameContext();
  const [playerNames, setPlayerNames] = useState<string[]>(['']);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Initialize playerNames from context if players exist (e.g., navigating back)
    if (players.length > 0) {
      setPlayerNames(players.map(p => p.name));
    } else {
      // If context is empty, reset game state to ensure clean slate
      dispatch({ type: 'RESET_GAME' });
      setPlayerNames(['']); 
    }
  }, []); // Run once on mount, not on players change from context


  const handleAddPlayer = () => {
    if (playerNames.length < 6) {
      setPlayerNames([...playerNames, '']);
    } else {
      toast({
        title: "Max Players Reached",
        description: "You can add up to 6 players.",
        variant: "destructive",
      });
    }
  };

  const handleRemovePlayer = (index: number) => {
    if (playerNames.length > 1) {
      const newPlayerNames = playerNames.filter((_, i) => i !== index);
      setPlayerNames(newPlayerNames);
    } else {
       toast({
        title: "Cannot Remove Player",
        description: "At least one player is required.",
        variant: "destructive",
      });
    }
  };

  const handlePlayerNameChange = (index: number, name: string) => {
    const newPlayerNames = [...playerNames];
    newPlayerNames[index] = name;
    setPlayerNames(newPlayerNames);
  };

  const handleSubmit = () => {
    const validPlayerNames = playerNames.map(name => name.trim()).filter(name => name !== '');
    if (validPlayerNames.length === 0) {
      toast({
        title: "No Players Entered",
        description: "Please enter at least one player name.",
        variant: "destructive",
      });
      return;
    }

    // Clear existing players before adding new ones
    dispatch({ type: 'RESET_GAME' });

    const newPlayers: Player[] = validPlayerNames.map((name, index) => ({
      id: `player-${Date.now()}-${index}`, // Simple unique ID
      name,
    }));
    
    newPlayers.forEach(player => {
      dispatch({ type: 'ADD_PLAYER', payload: player });
    });

    router.push('/course-setup');
  };

  return (
    <div className="flex justify-center items-start py-8">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-headline flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Player Setup
          </CardTitle>
          <CardDescription>Enter the names of the players for this round (up to 6).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {playerNames.map((name, index) => (
            <div key={index} className="space-y-2">
              <Label htmlFor={`player-${index}`} className="text-base">
                Player {index + 1}
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id={`player-${index}`}
                  type="text"
                  value={name}
                  onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                  placeholder={`Enter Player ${index + 1}'s Name`}
                  className="text-base"
                />
                {playerNames.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemovePlayer(index)}
                    aria-label="Remove player"
                  >
                    <Trash2 className="h-5 w-5 text-destructive" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          {playerNames.length < 6 && (
            <Button variant="outline" onClick={handleAddPlayer} className="w-full">
              <UserPlus className="mr-2 h-5 w-5" /> Add Player
            </Button>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} size="lg" className="w-full text-lg">
            Continue to Course Setup <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
