'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameContext } from '@/components/AppProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Flag, ArrowRight, Settings2 } from 'lucide-react';
import type { Course } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function CourseSetupPage() {
  const { players, course, dispatch } = useGameContext();
  const [holeCount, setHoleCount] = useState<'9' | '18'>(course?.holeCount === 18 ? '18' : '9');
  const [pars, setPars] = useState< (number | string)[]>([]);
  const [courseName, setCourseName] = useState(course?.name || '');
  const [parInputMode, setParInputMode] = useState<'all-at-once' | 'as-you-go'>(course?.parInputMode || 'all-at-once');
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (players.length === 0) {
      router.replace('/player-setup');
      toast({ title: "No players found", description: "Please set up players first.", variant: "destructive"});
    }
  }, [players, router, toast]);

  useEffect(() => {
    const numHoles = parseInt(holeCount);
    if (course && course.holeCount === numHoles && course.pars.length === numHoles) {
      setPars(course.pars.map(p => p.toString()));
    } else {
      setPars(Array(numHoles).fill(''));
    }
  }, [holeCount, course]);

  const handleParChange = (index: number, value: string) => {
    const newPars = [...pars];
    newPars[index] = value;
    setPars(newPars);
  };

  const handleSubmit = () => {
    const numHoles = parseInt(holeCount);
    
    // Validate pars only if using all-at-once mode
    if (parInputMode === 'all-at-once') {
      const parsedPars = pars.map(p => parseInt(p as string, 10));

      if (parsedPars.some(isNaN) || parsedPars.some(p => p < 1 || p > 10)) { // Assuming par is generally <= 10
        toast({
          title: "Invalid Par Values",
          description: "Please enter valid par values (1-10) for all holes.",
          variant: "destructive",
        });
        return;
      }
    }

    if (!courseName.trim()) {
      toast({
        title: "Course Name Required",
        description: "Please enter a name for the course.",
        variant: "destructive",
      });
      return;
    }

    const newCourse: Course = {
      holeCount: numHoles as 9 | 18,
      pars: parInputMode === 'all-at-once' ? pars.map(p => parseInt(p as string, 10)) : Array(numHoles).fill(0),
      name: courseName.trim(),
      parInputMode,
    };
    dispatch({ type: 'SET_COURSE', payload: newCourse });
    router.push('/round/0'); // Start at hole 0 (first hole)
  };

  return (
    <div className="flex justify-center items-start py-8">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-headline flex items-center gap-2">
            <Settings2 className="h-8 w-8 text-primary" />
            Course Setup
          </CardTitle>
          <CardDescription>Select the number of holes and choose how you want to input par values.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="course-name" className="text-base block mb-2">Course Name</Label>
            <Input
              id="course-name"
              placeholder="Enter course name"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              className="text-base"
            />
          </div>
          <div>
            <Label className="text-base block mb-2">Number of Holes</Label>
            <RadioGroup
              value={holeCount}
              onValueChange={(value: '9' | '18') => setHoleCount(value)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="9" id="holes-9" />
                <Label htmlFor="holes-9" className="text-base">9 Holes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="18" id="holes-18" />
                <Label htmlFor="holes-18" className="text-base">18 Holes</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label className="text-base block mb-2">Par Input Mode</Label>
            <RadioGroup
              value={parInputMode}
              onValueChange={(value: 'all-at-once' | 'as-you-go') => setParInputMode(value)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all-at-once" id="par-input-mode-all-at-once" />
                <Label htmlFor="par-input-mode-all-at-once" className="text-base">Input All Pars Now</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="as-you-go" id="par-input-mode-as-you-go" />
                <Label htmlFor="par-input-mode-as-you-go" className="text-base">Input Par As You Go</Label>
              </div>
            </RadioGroup>
            <div className="mt-2 text-sm text-muted-foreground">
              {parInputMode === 'all-at-once' 
                ? 'Enter all par values before starting the round. You can still edit them later during the round.'
                : 'Enter par values for each hole as you play. You can set or edit the par for each hole individually.'
              }
            </div>
          </div>

          {parInputMode === 'all-at-once' && (
            <div>
              <Label className="text-base block mb-2">Par for Each Hole</Label>
              <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  {pars.map((par, index) => (
                    <div key={index} className="space-y-1">
                      <Label htmlFor={`par-${index}`} className="text-sm">Hole {index + 1}</Label>
                      <Input
                        id={`par-${index}`}
                        type="number"
                        min="1"
                        max="10"
                        value={par}
                        onChange={(e) => handleParChange(index, e.target.value)}
                        placeholder="Par"
                        className="text-center"
                      />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} size="lg" className="w-full text-lg">
            Start Round <Flag className="ml-2 h-5 w-5" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
