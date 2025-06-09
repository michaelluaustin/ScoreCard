import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Flag, Users, BarChart3, CheckSquare } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/50 p-4">
      <Card className="w-full max-w-md shadow-2xl rounded-xl overflow-hidden">
        <div className="relative h-48 w-full bg-primary">
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
            <CheckSquare className="h-16 w-16 text-primary-foreground mb-2" />
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
          
        </CardContent>
      </Card>
    </div>
  );
}
