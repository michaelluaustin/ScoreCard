
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Flag, Users, BarChart3 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/50 p-4">
      <Card className="w-full max-w-md shadow-2xl rounded-xl overflow-hidden">
        <div className="relative h-48 w-full">
          <Image
            src="https://images.unsplash.com/photo-1587691592099-24045742c593?auto=format&fit=crop&w=1200&q=80"
            alt="Scenic golf course with a flag"
            fill
            style={{ objectFit: 'cover' }}
            priority
            data-ai-hint="golf course"
          />
          <div className="absolute inset-0 bg-primary/30 flex flex-col items-center justify-center p-6">
            <Flag className="h-16 w-16 text-primary-foreground mb-2" />
            <h1 className="text-5xl font-bold text-primary-foreground font-headline tracking-tight">Par Score</h1>
            <p className="text-lg text-primary-foreground/90 mt-1">Your Modern Golf Scorecard</p>
          </div>
        </div>
        <CardHeader className="text-center pt-6">
          <CardTitle className="text-2xl font-headline">Ready to Play?</CardTitle>
          <CardDescription className="text-base">
            Track your scores, view detailed stats, and share your triumphs.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 p-6">
          <Link href="/player-setup" passHref>
            <Button size="lg" className="w-full text-lg py-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <Users className="mr-2 h-5 w-5" /> Start New Round
            </Button>
          </Link>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
              <Users className="h-8 w-8 text-primary mb-1" />
              <span className="text-sm font-medium">Easy Player Setup</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
              <BarChart3 className="h-8 w-8 text-primary mb-1" />
              <span className="text-sm font-medium">Detailed Scorecards</span>
            </div>
          </div>
        </CardContent>
      </Card>
       <p className="mt-8 text-sm text-muted-foreground">
        Built with Next.js & ShadCN UI
      </p>
    </div>
  );
}
