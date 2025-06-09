'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameContext } from '@/components/AppProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, RotateCcw, Users, BarChart3, Flag } from 'lucide-react';
import type { Player } from '@/lib/types';
import { ShareResultsModal } from '@/components/ShareResultsModal';

interface Standing extends Player {
  totalScore: number;
  relativeToPar: string;
}

export default function StandingsPage() {
  const { players, course, scores, getTotalPar, getPlayerTotalScore, getPlayerScoreRelativeToPar, dispatch } = useGameContext();
  const router = useRouter();
  const [standings, setStandings] = useState<Standing[]>([]);

  useEffect(() => {
    if (!course || players.length === 0 ) {
      router.replace('/'); // Go home if no game data
      return;
    }

    const calculatedStandings: Standing[] = players
      .map(player => ({
        ...player,
        totalScore: getPlayerTotalScore(player.id),
        relativeToPar: getPlayerScoreRelativeToPar(player.id),
      }))
      .sort((a, b) => a.totalScore - b.totalScore); // Sort by lowest score
    
    setStandings(calculatedStandings);

  }, [players, course, scores, getPlayerTotalScore, getPlayerScoreRelativeToPar, router]);

  const handlePlayAgain = () => {
    dispatch({ type: 'RESET_GAME' });
    router.push('/player-setup');
  };

  if (!course || players.length === 0) {
    return <div className="text-center p-8">Loading standings or no game data...</div>;
  }
  
  const winner = standings.length > 0 ? standings[0] : null;

  return (
    <div className="flex flex-col items-center py-8 gap-8">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Trophy className="h-16 w-16 text-amber-400" />
          </div>
          <CardTitle className="text-4xl font-headline">Final Standings</CardTitle>
          <CardDescription className="text-lg">
            {winner ? `Congratulations ${winner.name}!` : "Here's how everyone performed."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Rank</TableHead>
                <TableHead>Player</TableHead>
                <TableHead className="text-right">Total Strokes</TableHead>
                <TableHead className="text-right">Relative to Par</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {standings.map((player, index) => (
                <TableRow key={player.id} className={index === 0 ? "bg-primary/10" : ""}>
                  <TableCell className="font-medium text-lg">{index + 1}</TableCell>
                  <TableCell className="font-semibold text-lg">{player.name}</TableCell>
                  <TableCell className="text-right text-lg font-mono">{player.totalScore}</TableCell>
                  <TableCell className="text-right text-lg font-mono">{player.relativeToPar}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <ShareResultsModal />
          <Button onClick={handlePlayAgain} variant="outline" size="lg">
            <RotateCcw className="mr-2 h-5 w-5" /> Play Again
          </Button>
        </CardFooter>
      </Card>

      <div className="mt-4 w-full max-w-2xl grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Players</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{players.length}</div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Holes Played</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{course.holeCount}</div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Course Par</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalPar()}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
