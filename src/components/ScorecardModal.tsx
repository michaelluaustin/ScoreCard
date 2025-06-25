'use client';

import { useState } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGameContext } from './AppProvider';
import type { Player } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Trophy, Eye, EyeOff } from 'lucide-react';

interface ScorecardModalProps {
  children: React.ReactNode; // Trigger element
}

export function ScorecardModal({ children }: ScorecardModalProps) {
  const { players, course, scores, getParForHole, getPlayerTotalScore, getPlayerScoreRelativeToPar } = useGameContext();
  const [showFullScorecard, setShowFullScorecard] = useState(false);

  if (!course) return null;

  const getCellClass = (score: number | undefined, par: number | undefined): string => {
    if (score === undefined || par === undefined) return '';
    if (score < par) return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
    if (score > par) return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
  };

  // Sort players by total score (best first)
  const sortedPlayers = [...players].sort((a, b) => {
    const scoreA = getPlayerTotalScore(a.id);
    const scoreB = getPlayerTotalScore(b.id);
    return scoreA - scoreB;
  });

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className={cn(
        "max-w-[95vw] w-full flex flex-col transition-all duration-300 max-h-[90vh]",
        showFullScorecard ? "sm:max-w-2xl" : "sm:max-w-lg"
      )}>
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl sm:text-2xl font-headline">Scorecard</DialogTitle>
          <DialogDescription>
            Current scores and totals for all players
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-grow overflow-y-auto overflow-x-hidden">
          <div className="p-1">
            {/* Quick Summary View - Always Visible */}
            <div className="mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {sortedPlayers.map((player, index) => {
                  const totalScore = getPlayerTotalScore(player.id);
                  const relativeToPar = getPlayerScoreRelativeToPar(player.id);
                  const isLeading = index === 0;
                  
                  return (
                    <Card key={player.id} className={cn(
                      "transition-all duration-200",
                      isLeading && "border-2 border-amber-400 bg-amber-50 dark:bg-amber-950/20 shadow-lg"
                    )}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                          {isLeading && <Trophy className="h-4 w-4 text-amber-500" />}
                          {player.name}
                          {isLeading && <span className="text-xs text-amber-600 dark:text-amber-400">(Leading)</span>}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-2xl sm:text-3xl font-bold font-mono">
                              {totalScore}
                            </div>
                            <div className="text-sm text-muted-foreground">Total Strokes</div>
                          </div>
                          <div className="text-right">
                            <div className={cn(
                              "text-lg sm:text-xl font-bold font-mono",
                              relativeToPar === 'E' ? "text-gray-600" :
                              relativeToPar.startsWith('+') ? "text-red-600" : "text-green-600"
                            )}>
                              {relativeToPar}
                            </div>
                            <div className="text-sm text-muted-foreground">To Par</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Toggle Button */}
            <div className="flex justify-center mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFullScorecard(!showFullScorecard)}
                className="flex items-center gap-2"
              >
                {showFullScorecard ? (
                  <>
                    <EyeOff className="h-4 w-4" />
                    Hide Full Scorecard
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    Show Full Scorecard
                  </>
                )}
              </Button>
            </div>

            {/* Full Scorecard Table - Collapsible */}
            {showFullScorecard && (
              <div className="rounded-md border overflow-x-auto">
                <div className="min-w-[600px] sm:min-w-0">
                  <Table className="min-w-full">
                    <TableHeader className="sticky top-0 bg-background z-10">
                      <TableRow>
                        <TableHead className="w-[120px] sm:w-[150px] font-semibold text-sm">Player</TableHead>
                        {[...Array(course.holeCount)].map((_, holeIndex) => (
                          <TableHead key={holeIndex} className="text-center min-w-[50px] sm:min-w-[60px]">
                            <div className="text-xs sm:text-sm">{holeIndex + 1}</div>
                            <div className="text-xs text-muted-foreground">Par {getParForHole(holeIndex)}</div>
                          </TableHead>
                        ))}
                        <TableHead className="text-center font-semibold min-w-[60px] sm:min-w-[80px] text-sm">Total</TableHead>
                        <TableHead className="text-center font-semibold min-w-[60px] sm:min-w-[80px] text-sm">To Par</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedPlayers.map((player: Player) => (
                        <TableRow key={player.id}>
                          <TableCell className="font-medium text-sm">{player.name}</TableCell>
                          {[...Array(course.holeCount)].map((_, holeIndex) => {
                            const score = scores[player.id]?.[holeIndex];
                            const par = getParForHole(holeIndex);
                            return (
                              <TableCell key={holeIndex} className={cn("text-center font-mono text-sm", getCellClass(score, par))}>
                                {score ?? '-'}
                              </TableCell>
                            );
                          })}
                          <TableCell className="text-center font-semibold font-mono text-sm">{getPlayerTotalScore(player.id)}</TableCell>
                          <TableCell className="text-center font-semibold font-mono text-sm">{getPlayerScoreRelativeToPar(player.id)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center mt-4 flex-shrink-0">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Close
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
