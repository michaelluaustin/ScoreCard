'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGameContext } from './AppProvider';
import { Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ShareResultsModal() {
  const { players, course, scores, getParForHole, getPlayerTotalScore, getPlayerScoreRelativeToPar } = useGameContext();

  if (!course) return null;

  const getCellClass = (score: number | undefined, par: number | undefined): string => {
    if (score === undefined || par === undefined) return '';
    if (score < par) return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
    if (score > par) return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="lg">
          <Share2 className="mr-2 h-5 w-5" /> Share Results
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline text-center">Round Summary</DialogTitle>
        </DialogHeader>
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold font-headline mb-2">ScoreCard+</h2>
            <p className="text-muted-foreground">Golf Round Results</p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px] font-semibold">Player</TableHead>
                {[...Array(course.holeCount)].map((_, holeIndex) => (
                  <TableHead key={holeIndex} className="text-center min-w-[60px]">
                    {holeIndex + 1}
                    <div className="text-xs text-muted-foreground">Par {getParForHole(holeIndex)}</div>
                  </TableHead>
                ))}
                <TableHead className="text-center font-semibold min-w-[80px]">Total</TableHead>
                <TableHead className="text-center font-semibold min-w-[80px]">To Par</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.map((player) => (
                <TableRow key={player.id}>
                  <TableCell className="font-medium">{player.name}</TableCell>
                  {[...Array(course.holeCount)].map((_, holeIndex) => {
                    const score = scores[player.id]?.[holeIndex];
                    const par = getParForHole(holeIndex);
                    return (
                      <TableCell key={holeIndex} className={cn("text-center font-mono", getCellClass(score, par))}>
                        {score ?? '-'}
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-center font-semibold font-mono">{getPlayerTotalScore(player.id)}</TableCell>
                  <TableCell className="text-center font-semibold font-mono">{getPlayerScoreRelativeToPar(player.id)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Generated with ScoreCard+
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 