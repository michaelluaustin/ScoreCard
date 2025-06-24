'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { useGameContext } from './AppProvider';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { Player, Course } from '@/lib/types';

interface NativeShareButtonProps {
  standingsRef: React.RefObject<HTMLDivElement>;
}

export function NativeShareButton({ standingsRef }: NativeShareButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { players, course, scores, getParForHole, getPlayerTotalScore, getPlayerScoreRelativeToPar } = useGameContext();

  const getCellClass = (score: number | undefined, par: number | undefined): string => {
    if (score === undefined || par === undefined) return '';
    if (score < par) return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
    if (score > par) return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
  };

  const generateAndShareImage = async () => {
    if (!standingsRef.current || !course || !players) return;
    const safePlayers = players as Player[];
    const safeCourse = course as Course;

    setIsGenerating(true);

    try {
      // --- Setup ---
      const width = 800;
      let yOffset = 0;
      const padding = 40;
      const rowHeight = 40;
      const tableHeaderHeight = 40;
      const playerRowHeight = 36;
      const sectionSpacing = 32;
      const tableSpacing = 24;
      const font = 'system-ui, -apple-system, sans-serif';
      const playersCount = safePlayers.length;
      const holes = safeCourse.holeCount;
      const front9 = 9;
      const back9 = holes - 9;

      // --- Helper functions ---
      function getParForRange(start: number, end: number) {
        let sum = 0;
        for (let i = start; i < end; i++) sum += getParForHole!(i) ?? 0;
        return sum;
      }
      function getPlayerTotalForRange(playerId: string, start: number, end: number) {
        let sum = 0;
        for (let i = start; i < end; i++) sum += scores[playerId]?.[i] ?? 0;
        return sum;
      }
      function getPlayerToParForRange(playerId: string, start: number, end: number) {
        return getPlayerTotalForRange(playerId, start, end) - getParForRange(start, end);
      }

      // --- Estimate height ---
      let estHeight = padding + 60 + sectionSpacing + // Title + subtitle
        tableHeaderHeight + playersCount * playerRowHeight + sectionSpacing + // Standings
        32 + // Detailed Scorecard title
        (tableHeaderHeight + playersCount * playerRowHeight) * 2 + // Two tables
        tableSpacing + sectionSpacing + 60; // Footer

      // --- Create canvas ---
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = estHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');
      // Fill background with light gray
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, width, estHeight);

      // --- Draw Title ---
      yOffset = padding;
      ctx.font = `bold 36px ${font}`;
      ctx.fillStyle = '#1f2937';
      ctx.textAlign = 'center';
      ctx.fillText('Final Standings', width / 2, yOffset);
      yOffset += 40;
      ctx.font = `20px ${font}`;
      ctx.fillStyle = '#6b7280';
      ctx.fillText(`${safeCourse.name} • ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, width / 2, yOffset);
      yOffset += sectionSpacing;

      // --- Standings Table ---
      const standingsCols = [60, 200, 120, 120];
      const standingsStartX = 60;
      ctx.textAlign = 'left';
      ctx.font = `bold 18px ${font}`;
      ctx.fillStyle = '#374151';
      // Header
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(standingsStartX, yOffset, width - standingsStartX * 2, tableHeaderHeight);
      ctx.fillStyle = '#374151';
      ctx.fillText('Rank', standingsStartX + 10, yOffset + 28);
      ctx.fillText('Player', standingsStartX + standingsCols[0] + 10, yOffset + 28);
      ctx.textAlign = 'right';
      ctx.fillText('Total (9)', standingsStartX + standingsCols[0] + standingsCols[1] + standingsCols[2] - 10, yOffset + 28);
      ctx.fillText('To Par (9)', standingsStartX + standingsCols[0] + standingsCols[1] + standingsCols[2] + standingsCols[3] - 10, yOffset + 28);
      yOffset += tableHeaderHeight;
      // Rows
      safePlayers.forEach((player, index) => {
        const totalScore = getPlayerTotalScore(player.id);
        const relativeToPar = getPlayerScoreRelativeToPar(player.id);
        const isWinner = index === 0;
        ctx.textAlign = 'left';
        ctx.fillStyle = isWinner ? '#fef3c7' : '#fff';
        ctx.fillRect(standingsStartX, yOffset, width - standingsStartX * 2, playerRowHeight);
        ctx.strokeStyle = '#e5e7eb';
        ctx.strokeRect(standingsStartX, yOffset, width - standingsStartX * 2, playerRowHeight);
        ctx.fillStyle = '#374151';
        ctx.font = `bold 16px ${font}`;
        ctx.fillText(`${index + 1}`, standingsStartX + 10, yOffset + 25);
        ctx.fillText(`${player.name}${isWinner ? ' 🏆' : ''}`, standingsStartX + standingsCols[0] + 10, yOffset + 25);
        ctx.textAlign = 'right';
        ctx.font = `bold 16px monospace`;
        ctx.fillText(`${totalScore}`, standingsStartX + standingsCols[0] + standingsCols[1] + standingsCols[2] - 10, yOffset + 25);
        ctx.fillText(`${relativeToPar}`, standingsStartX + standingsCols[0] + standingsCols[1] + standingsCols[2] + standingsCols[3] - 10, yOffset + 25);
        yOffset += playerRowHeight;
      });
      yOffset += sectionSpacing;

      // --- Detailed Scorecard Title ---
      ctx.textAlign = 'center';
      ctx.font = `bold 28px ${font}`;
      ctx.fillStyle = '#1f2937';
      ctx.fillText('Detailed Scorecard', width / 2, yOffset);
      yOffset += 32;

      // --- Front 9 Table ---
      const holeColWidth = 38;
      const playerColWidth = 120;
      const totalColWidth = 60;
      const tableStartX = 20;
      const front9TableWidth = playerColWidth + (front9 * holeColWidth) + 2 * totalColWidth;
      // Header
      ctx.textAlign = 'left';
      ctx.font = `bold 15px ${font}`;
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(tableStartX, yOffset, front9TableWidth, tableHeaderHeight);
      ctx.fillStyle = '#374151';
      ctx.fillText('Player', tableStartX + 8, yOffset + 26);
      ctx.textAlign = 'center';
      for (let i = 0; i < front9; i++) {
        ctx.fillText(`${i + 1}`, tableStartX + playerColWidth + i * holeColWidth + holeColWidth / 2, yOffset + 18);
        ctx.font = `10px ${font}`;
        ctx.fillStyle = '#6b7280';
        ctx.fillText(`Par ${getParForHole!(i)}`, tableStartX + playerColWidth + i * holeColWidth + holeColWidth / 2, yOffset + 32);
        ctx.font = `bold 15px ${font}`;
        ctx.fillStyle = '#374151';
      }
      ctx.fillText('Total', tableStartX + playerColWidth + front9 * holeColWidth + totalColWidth / 2, yOffset + 26);
      ctx.fillText('To Par', tableStartX + playerColWidth + front9 * holeColWidth + totalColWidth + totalColWidth / 2, yOffset + 26);
      yOffset += tableHeaderHeight;
      // Rows
      safePlayers.forEach((player) => {
        ctx.textAlign = 'left';
        ctx.fillStyle = '#fff';
        ctx.fillRect(tableStartX, yOffset, front9TableWidth, playerRowHeight);
        ctx.strokeStyle = '#d1d5db';
        ctx.strokeRect(tableStartX, yOffset, front9TableWidth, playerRowHeight);
        ctx.fillStyle = '#374151';
        ctx.font = `bold 13px ${font}`;
        ctx.fillText(player.name, tableStartX + 8, yOffset + 24);
        ctx.textAlign = 'center';
        ctx.font = `13px monospace`;
        for (let i = 0; i < front9; i++) {
          const score = scores[player.id]?.[i];
          const par = getParForHole!(i);
          if (score !== undefined && par !== undefined) {
            if (score < par) ctx.fillStyle = '#dcfce7';
            else if (score > par) ctx.fillStyle = '#fee2e2';
            else ctx.fillStyle = '#f3f4f6';
          } else ctx.fillStyle = '#f3f4f6';
          ctx.fillRect(tableStartX + playerColWidth + i * holeColWidth, yOffset, holeColWidth, playerRowHeight);
          ctx.strokeStyle = '#d1d5db';
          ctx.strokeRect(tableStartX + playerColWidth + i * holeColWidth, yOffset, holeColWidth, playerRowHeight);
          ctx.fillStyle = '#374151';
          ctx.fillText(score?.toString() ?? '-', tableStartX + playerColWidth + i * holeColWidth + holeColWidth / 2, yOffset + 24);
        }
        // Totals
        ctx.font = `bold 13px monospace`;
        ctx.fillText(`${getPlayerTotalForRange(player.id, 0, front9)}`, tableStartX + playerColWidth + front9 * holeColWidth + totalColWidth / 2, yOffset + 24);
        ctx.fillText(`${getPlayerToParForRange(player.id, 0, front9) >= 0 ? '+' : ''}${getPlayerToParForRange(player.id, 0, front9)}`, tableStartX + playerColWidth + front9 * holeColWidth + totalColWidth + totalColWidth / 2, yOffset + 24);
        yOffset += playerRowHeight;
      });
      yOffset += tableSpacing;

      // --- Back 9 Table ---
      const extraSpacing = 50; // Reduced from 80 to 50 for better fit
      const totalAllColWidth = 70;
      const toParAllColWidth = 70;
      const gapWidth = 20; // Add a gap between the last two columns
      const back9TableWidth = playerColWidth + (back9 * holeColWidth) + 2 * totalColWidth + totalAllColWidth + gapWidth + toParAllColWidth + 20;
      ctx.textAlign = 'left';
      ctx.font = `bold 15px ${font}`;
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(tableStartX, yOffset, back9TableWidth, tableHeaderHeight);
      ctx.fillStyle = '#374151';
      ctx.fillText('Player', tableStartX + 8, yOffset + 26);
      ctx.textAlign = 'center';
      for (let i = 0; i < back9; i++) {
        ctx.fillText(`${i + 10}`, tableStartX + playerColWidth + i * holeColWidth + holeColWidth / 2, yOffset + 18);
        ctx.font = `10px ${font}`;
        ctx.fillStyle = '#6b7280';
        ctx.fillText(`Par ${getParForHole!(i + 9)}`, tableStartX + playerColWidth + i * holeColWidth + holeColWidth / 2, yOffset + 32);
        ctx.font = `bold 15px ${font}`;
        ctx.fillStyle = '#374151';
      }
      ctx.fillText('Total', tableStartX + playerColWidth + back9 * holeColWidth + totalColWidth / 2, yOffset + 26);
      ctx.fillText('To Par', tableStartX + playerColWidth + back9 * holeColWidth + totalColWidth + totalColWidth / 2, yOffset + 26);
      ctx.fillText('Total (18)', tableStartX + playerColWidth + back9 * holeColWidth + 2 * totalColWidth + totalAllColWidth / 2, yOffset + 26);
      ctx.fillText('To Par (18)', tableStartX + playerColWidth + back9 * holeColWidth + 2 * totalColWidth + totalAllColWidth + gapWidth + toParAllColWidth / 2, yOffset + 26);
      yOffset += tableHeaderHeight;
      safePlayers.forEach((player) => {
        ctx.textAlign = 'left';
        ctx.fillStyle = '#fff';
        ctx.fillRect(tableStartX, yOffset, back9TableWidth, playerRowHeight);
        ctx.strokeStyle = '#d1d5db';
        ctx.strokeRect(tableStartX, yOffset, back9TableWidth, playerRowHeight);
        ctx.fillStyle = '#374151';
        ctx.font = `bold 13px ${font}`;
        ctx.fillText(player.name, tableStartX + 8, yOffset + 24);
        ctx.textAlign = 'center';
        ctx.font = `13px monospace`;
        for (let i = 0; i < back9; i++) {
          const score = scores[player.id]?.[i + 9];
          const par = getParForHole!(i + 9);
          if (score !== undefined && par !== undefined) {
            if (score < par) ctx.fillStyle = '#dcfce7';
            else if (score > par) ctx.fillStyle = '#fee2e2';
            else ctx.fillStyle = '#f3f4f6';
          } else ctx.fillStyle = '#f3f4f6';
          ctx.fillRect(tableStartX + playerColWidth + i * holeColWidth, yOffset, holeColWidth, playerRowHeight);
          ctx.strokeStyle = '#d1d5db';
          ctx.strokeRect(tableStartX + playerColWidth + i * holeColWidth, yOffset, holeColWidth, playerRowHeight);
          ctx.fillStyle = '#374151';
          ctx.fillText(score?.toString() ?? '-', tableStartX + playerColWidth + i * holeColWidth + holeColWidth / 2, yOffset + 24);
        }
        // Totals for back 9
        ctx.font = `bold 13px monospace`;
        ctx.fillText(`${getPlayerTotalForRange(player.id, 9, holes)}`, tableStartX + playerColWidth + back9 * holeColWidth + totalColWidth / 2, yOffset + 24);
        ctx.fillText(`${getPlayerToParForRange(player.id, 9, holes) >= 0 ? '+' : ''}${getPlayerToParForRange(player.id, 9, holes)}`, tableStartX + playerColWidth + back9 * holeColWidth + totalColWidth + totalColWidth / 2, yOffset + 24);
        // Overall totals
        ctx.fillText(`${getPlayerTotalScore(player.id)}`, tableStartX + playerColWidth + back9 * holeColWidth + 2 * totalColWidth + totalAllColWidth / 2, yOffset + 24);
        ctx.fillText(`${getPlayerScoreRelativeToPar(player.id)}`, tableStartX + playerColWidth + back9 * holeColWidth + 2 * totalColWidth + totalAllColWidth + gapWidth + toParAllColWidth / 2, yOffset + 24);
        yOffset += playerRowHeight;
      });
      yOffset += sectionSpacing;

      // --- Footer ---
      ctx.textAlign = 'center';
      ctx.font = `16px ${font}`;
      ctx.fillStyle = '#6b7280';
      ctx.fillText('Generated with ScoreCard+', width / 2, yOffset);
      ctx.font = `13px ${font}`;
      ctx.fillStyle = '#9ca3af';
      ctx.fillText(`${safePlayers.length} players • ${safeCourse.holeCount} holes`, width / 2, yOffset + 22);

      // --- Crop canvas to content ---
      const cropped = document.createElement('canvas');
      cropped.width = width;
      cropped.height = yOffset + 60;
      const croppedCtx = cropped.getContext('2d');
      if (croppedCtx) {
        croppedCtx.drawImage(canvas, 0, 0);
      }
      const dataUrl = cropped.toDataURL('image/png', 0.95);
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      // Create file from blob
      const file = new File([blob], `golf-round-${safeCourse.name}-${new Date().toISOString().split('T')[0]}.png`, {
        type: 'image/png',
      });

      // Check if Web Share API is supported
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        // Use native share sheet
        await navigator.share({
          title: `Golf Round Results - ${safeCourse.name}`,
          text: `Check out our golf round results from ${safeCourse.name}!`,
          files: [file],
        });
      } else {
        // Fallback: download the image
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `golf-round-${safeCourse.name}-${new Date().toISOString().split('T')[0]}.png`;
        link.click();
      }
    } catch (error) {
      console.error('Error generating or sharing image:', error);
      // Fallback: try to share just the URL
      if (navigator.share) {
        await navigator.share({
          title: `Golf Round Results - ${safeCourse.name}`,
          text: `Check out our golf round results from ${safeCourse.name}!`,
          url: window.location.href,
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button 
      onClick={generateAndShareImage} 
      disabled={isGenerating}
      size="lg"
      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
    >
      <Share2 className="mr-2 h-5 w-5" />
      {isGenerating ? 'Generating...' : 'Share Results'}
    </Button>
  );
} 