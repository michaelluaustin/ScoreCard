'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from 'lucide-react';

export function FeedbackModal() {
  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleStarClick = (starValue: number) => {
    setRating(starValue);
  };

  const handleSubmit = () => {
    // Here you would typically send the feedback to your backend
    console.log('Feedback submitted:', { rating, feedback });
    
    // Reset form and close modal
    setRating(0);
    setFeedback('');
    setIsOpen(false);
    
    // You could add a toast notification here
    alert('Thank you for your feedback!');
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          onClick={() => handleStarClick(i)}
          className="relative p-1 hover:scale-110 transition-transform"
          type="button"
        >
          <Star
            className={`h-8 w-8 ${
              rating >= i ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        </button>
      );
    }
    return stars;
  };

  // Don't render until mounted to prevent hydration issues
  if (!isMounted) {
    return (
      <Button variant="outline" size="lg" disabled>
        <Star className="mr-2 h-5 w-5" /> Give Feedback
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg">
          <Star className="mr-2 h-5 w-5" /> Give Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline text-center">Rate Your Experience</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">How would you rate ScoreCard+?</p>
            <div className="flex justify-center items-center gap-1">
              {renderStars()}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {rating > 0 ? `${rating}/5 stars` : 'Click to rate'}
            </p>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="feedback" className="text-sm font-medium">
              Tell us more (optional)
            </label>
            <Textarea
              id="feedback"
              placeholder="Share your thoughts, suggestions, or any issues you encountered..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={rating === 0}
              className="flex-1"
            >
              Submit Feedback
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 