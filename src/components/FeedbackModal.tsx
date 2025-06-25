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
import { Star, PartyPopper, Heart } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export function FeedbackModal() {
  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleStarClick = (starValue: number) => {
    setRating(starValue);
  };

  const createConfetti = () => {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.style.position = 'fixed';
      confetti.style.width = '10px';
      confetti.style.height = '10px';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.left = Math.random() * window.innerWidth + 'px';
      confetti.style.top = '-10px';
      confetti.style.pointerEvents = 'none';
      confetti.style.zIndex = '9999';
      confetti.style.borderRadius = '50%';
      
      document.body.appendChild(confetti);
      
      const animation = confetti.animate([
        { transform: 'translateY(0px) rotate(0deg)', opacity: 1 },
        { transform: `translateY(${window.innerHeight + 100}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
      ], {
        duration: Math.random() * 3000 + 2000,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      });
      
      animation.onfinish = () => {
        document.body.removeChild(confetti);
      };
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating, feedback }),
      });

      if (!response.ok) {
        throw new Error('Failed to send feedback');
      }

      // Show celebration popup
      setShowCelebration(true);
      
      // Trigger confetti
      createConfetti();
      
      // Show toast notification
      toast({
        title: "Feedback Submitted!",
        description: "Thank you for your feedback. We appreciate it!",
      });
      
      // Close celebration after 3 seconds
      setTimeout(() => {
        setShowCelebration(false);
        // Reset form and close modal
        setRating(0);
        setFeedback('');
        setIsOpen(false);
      }, 3000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to send feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
    <>
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
                disabled={rating === 0 || isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Sending...' : 'Submit Feedback'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Celebration Popup */}
      {showCelebration && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <PartyPopper className="h-16 w-16 text-pink-500 animate-bounce" />
                <Heart className="h-8 w-8 text-red-500 absolute -top-2 -right-2 animate-pulse" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Thank You! 🎉
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Your feedback means the world to us! We're excited to make ScoreCard+ even better.
            </p>
            <div className="flex justify-center space-x-2">
              <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 