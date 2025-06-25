'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGameContext } from '@/components/AppProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight, Table, Flag, CheckCircle } from 'lucide-react';
import type { Player } from '@/lib/types';
import { ScorecardModal } from '@/components/ScorecardModal';
import { useToast } from '@/hooks/use-toast';

export default function HoleEntryPage() {
  const params = useParams();
  const router = useRouter();
  const { 
    players, 
    course, 
    scores, 
    currentHoleIndex, 
    dispatch, 
    getParForHole 
  } = useGameContext();
  const { toast } = useToast();
  const [parInputValue, setParInputValue] = useState<string>('');

  const holeIndex = params?.holeIndex ? parseInt(params.holeIndex as string, 10) : 0;

  useEffect(() => {
    if (isNaN(holeIndex) || !course || holeIndex < 0 || holeIndex >= course.holeCount) {
      // Invalid hole index or course not set up, redirect
      if (!course) router.replace('/course-setup');
      else router.replace(`/round/0`); // Go to first hole if course is set but index is bad
      return;
    }
    if (currentHoleIndex !== holeIndex) {
      dispatch({ type: 'SET_CURRENT_HOLE_INDEX', payload: holeIndex });
    }
  }, [holeIndex, course, dispatch, router, currentHoleIndex]);

  // Sync input value with current par
  useEffect(() => {
    const currentPar = getParForHole(holeIndex);
    setParInputValue(currentPar?.toString() || '');
  }, [holeIndex, getParForHole]);

  if (!course || players.length === 0) {
    // This should ideally be caught by redirects in useEffect, but as a fallback:
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p>Loading game data or redirecting...</p>
        <Button onClick={() => router.push('/')}>Go to Home</Button>
      </div>
    );
  }

  const parForCurrentHole = getParForHole(holeIndex);

  const handleScoreChange = (playerId: string, value: string) => {
    const score = value === '' ? undefined : parseInt(value, 10);
    if (score !== undefined && (isNaN(score) || score < 0)) {
       toast({ title: "Invalid Score", description: "Score must be a positive number.", variant: "destructive"});
       return;
    }
    dispatch({ type: 'SET_SCORE', payload: { playerId, holeIndex, score } });
  };

  const handleParChange = (value: string) => {
    // Always update local state immediately for responsive editing
    setParInputValue(value);
    
    if (value === '') {
      // Allow empty value - don't update the par
      return;
    }
    const par = parseInt(value, 10);
    if (isNaN(par) || par < 1 || par > 10) {
      // Don't show toast for invalid input while typing, only when they finish
      return;
    }
    dispatch({ type: 'SET_HOLE_PAR', payload: { holeIndex, par } });
  };

  const handleNextHole = () => {
    if (holeIndex < course.holeCount - 1) {
      router.push(`/round/${holeIndex + 1}`);
    } else {
      // Last hole, navigate to standings
      router.push('/standings');
    }
  };

  const handlePreviousHole = () => {
    if (holeIndex > 0) {
      router.push(`/round/${holeIndex - 1}`);
    }
  };
  
  const currentScoresValid = players.every(player => {
    const score = scores[player.id]?.[holeIndex];
    return score !== undefined && score >= 0; // All players must have a score for current hole
  });

  return (
    <div className="flex justify-center items-start py-8">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl font-headline flex items-center gap-2">
                <Flag className="h-8 w-8 text-primary" />
                Hole {holeIndex + 1} <span className="text-2xl text-muted-foreground">of {course.holeCount}</span>
              </CardTitle>
              <CardDescription className="text-lg mt-2">
                Enter scores for each player below
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="hole-par" className="text-base font-semibold">Par:</Label>
              <Input
                id="hole-par"
                type="number"
                value={parInputValue}
                onChange={(e) => handleParChange(e.target.value)}
                placeholder="Par"
                className="w-20 text-center"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {players.map((player: Player) => (
            <div key={player.id} className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor={`score-${player.id}`} className="text-base col-span-1">
                {player.name}
              </Label>
              <Input
                id={`score-${player.id}`}
                type="number"
                min="0" // Allow 0 for missed hit etc.
                value={scores[player.id]?.[holeIndex]?.toString() ?? ''}
                onChange={(e) => handleScoreChange(player.id, e.target.value)}
                placeholder="Score"
                className="text-base col-span-2 text-center"
              />
            </div>
          ))}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-4">
          <Button
            variant="outline"
            onClick={handlePreviousHole}
            disabled={holeIndex === 0}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="mr-2 h-5 w-5" /> Previous Hole
          </Button>
          <ScorecardModal>
            <Button variant="secondary" className="w-full sm:w-auto">
              <Table className="mr-2 h-5 w-5" /> View Scorecard
            </Button>
          </ScorecardModal>
          <Button 
            onClick={handleNextHole} 
            className="w-full sm:w-auto"
            disabled={!currentScoresValid && holeIndex < course.holeCount -1} // Disable next if scores not valid, unless it's the last hole
          >
            {holeIndex === course.holeCount - 1 ? 'View Final Standings' : 'Next Hole'}
            {holeIndex === course.holeCount - 1 ? <CheckCircle className="ml-2 h-5 w-5" /> : <ArrowRight className="ml-2 h-5 w-5" /> }
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
