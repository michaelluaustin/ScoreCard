'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useGameContext } from './AppProvider';
import type { Player } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ScorecardModalProps {
  children: React.ReactNode; // Trigger element
}

export function ScorecardModal({ children }: ScorecardModalProps) {
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
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline">Scorecard</DialogTitle>
          <DialogDescription>
            Current scores for all players. Red for over par, green for under par, gray for even.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow rounded-md border">
          <Table className="min-w-full">
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead className="w-[150px] font-semibold">Player</TableHead>
                {[...Array(course.holeCount)].map((_, holeIndex) => (
                  <TableHead key={holeIndex} className="text-center min-w-[60px]">
                    Hole {holeIndex + 1}
                    <div className="text-xs text-muted-foreground">Par {getParForHole(holeIndex)}</div>
                  </TableHead>
                ))}
                <TableHead className="text-center font-semibold min-w-[80px]">Total</TableHead>
                <TableHead className="text-center font-semibold min-w-[80px]">To Par</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.map((player: Player) => (
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
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
