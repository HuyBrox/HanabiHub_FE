"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Check,
  X,
  ArrowLeft,
  Loader2,
  CheckCircle,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import styles from "./page.module.css";
import { useParams, useRouter } from "next/navigation";
import {
  useGetFlashCardByIdQuery,
  useTrackFlashcardSessionMutation,
  useTrackCardLearningMutation,
} from "@/store/services/flashcardApi";
import { IFlashCardItem, DifficultyLevel } from "@/types/flashcard";
import { useJapaneseTTS } from "@/hooks/useJapaneseTTS";

// Extended type for practice with id
interface PracticeCard extends IFlashCardItem {
  id: number; // Local sequential ID for UI
  // _id is inherited from IFlashCardItem (MongoDB ObjectId)
}

interface CardTracking {
  cardId: string;
  isCorrect: boolean;
  responseTime: number;
  reviewCount: number;
  startTime: number;
}

export default function FlashcardPracticePage() {
  const params = useParams();
  const router = useRouter();
  const cardId = params.id as string;

  // Fetch flashcard data from API
  const { data, isLoading, error } = useGetFlashCardByIdQuery(cardId);
  const [trackSession] = useTrackFlashcardSessionMutation();
  const [trackCard] = useTrackCardLearningMutation(); // Re-enabled with proper _id support

  // TTS hook
  const { speak, isSpeaking, currentVoiceName, setVoiceName, voices } =
    useJapaneseTTS();

  const [flashcards, setFlashcards] = useState<PracticeCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [autoRead, setAutoRead] = useState<"off" | "front" | "back">("off");
  const [studiedCards, setStudiedCards] = useState<Set<number>>(new Set());
  const [correctCards, setCorrectCards] = useState<Set<number>>(new Set());

  // Tracking state
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());
  const [cardStartTime, setCardStartTime] = useState<number>(Date.now());
  const [cardTracking, setCardTracking] = useState<Map<string, CardTracking>>(
    new Map()
  );
  const hasTrackedSession = useRef(false);
  const lastReadRef = useRef<{
    cardIndex: number;
    isFlipped: boolean;
    autoReadMode: "off" | "front" | "back";
  } | null>(null);

  // Initialize flashcards when data loads
  useEffect(() => {
    if (data?.data?.cards) {
      const cardsWithId = data.data.cards.map((card, index) => ({
        ...card,
        id: index + 1, // Local sequential ID for UI purposes
        // _id from backend is already included via spread operator
      }));
      setFlashcards(cardsWithId);
      setSessionStartTime(Date.now());
      setCardStartTime(Date.now());
      lastReadRef.current = null; // Reset when new data loads
    }
  }, [data, cardId]);

  // Auto read when card index, flip state, or autoRead mode changes
  useEffect(() => {
    // Skip if no cards loaded yet
    if (flashcards.length === 0) {
      return;
    }

    // Skip if autoRead is off
    if (autoRead === "off") {
      lastReadRef.current = null; // Reset when turned off
      return;
    }

    // Skip if card doesn't exist
    if (!flashcards[currentIndex]) {
      return;
    }

    const card = flashcards[currentIndex];
    const currentState = {
      cardIndex: currentIndex,
      isFlipped: isFlipped,
      autoReadMode: autoRead
    };

    // Check if we already read for this exact state combination
    // Also check if autoRead mode changed (to allow re-reading when mode changes)
    const wasAlreadyRead =
      lastReadRef.current &&
      lastReadRef.current.cardIndex === currentState.cardIndex &&
      lastReadRef.current.isFlipped === currentState.isFlipped &&
      lastReadRef.current.autoReadMode === currentState.autoReadMode;

    if (wasAlreadyRead) {
      return; // Already read this exact state, skip to prevent duplicate reads
    }

    // Determine what to read based on autoRead mode and current flip state
    let shouldRead = false;
    let textToSpeak: string | null = null;

    if (autoRead === "front" && !isFlipped) {
      // Read front side: only when card is on front (not flipped)
      shouldRead = true;
      textToSpeak = card.vocabulary;
    } else if (autoRead === "back" && isFlipped) {
      // Read back side: only when card is on back (flipped)
      shouldRead = true;
      textToSpeak = card.meaning;
    }

    // Update ref to mark this state as processed (even if not reading)
    lastReadRef.current = currentState;

    // Only read if we should read and have text
    if (shouldRead && textToSpeak) {
      // Use a delay to ensure state is stable and prevent rapid re-reads
      const timer = setTimeout(() => {
        speak(textToSpeak!);
      }, 300);

      return () => {
        clearTimeout(timer);
      };
    }
    // Only depend on the actual state values that should trigger a read
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRead, currentIndex, isFlipped]);

  // Track session when component unmounts or user leaves
  useEffect(() => {
    const trackSessionData = async () => {
      if (hasTrackedSession.current || studiedCards.size === 0) return;

      const sessionDuration = Math.floor(
        (Date.now() - sessionStartTime) / 1000
      );

      try {
        await trackSession({
          flashcardId: cardId,
          cardsStudied: studiedCards.size,
          correctAnswers: correctCards.size,
          sessionDuration,
          difficulty: calculateSessionDifficulty(),
          studiedAt: new Date(sessionStartTime).toISOString(),
        });
        hasTrackedSession.current = true;
      } catch (error) {
        console.error("Failed to track session:", error);
      }
    };

    // Track on unmount
    return () => {
      trackSessionData();
    };
  }, [
    cardId,
    studiedCards.size,
    correctCards.size,
    sessionStartTime,
    trackSession,
  ]);

  // Track session before leaving page
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (studiedCards.size > 0 && !hasTrackedSession.current) {
        const sessionDuration = Math.floor(
          (Date.now() - sessionStartTime) / 1000
        );

        // Use sendBeacon for reliable tracking on page unload
        const data = {
          flashcardId: cardId,
          cardsStudied: studiedCards.size,
          correctAnswers: correctCards.size,
          sessionDuration,
          difficulty: calculateSessionDifficulty(),
          studiedAt: new Date(sessionStartTime).toISOString(),
        };

        navigator.sendBeacon(
          `${process.env.NEXT_PUBLIC_API_URL}/flashcards/track-flashcard-session`,
          JSON.stringify(data)
        );
        hasTrackedSession.current = true;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [cardId, studiedCards.size, correctCards.size, sessionStartTime]);

  // Calculate session difficulty based on accuracy
  const calculateSessionDifficulty = (): DifficultyLevel => {
    if (studiedCards.size === 0) return "good";
    const accuracy = correctCards.size / studiedCards.size;
    if (accuracy >= 0.9) return "easy";
    if (accuracy >= 0.7) return "good";
    if (accuracy >= 0.5) return "hard";
    return "again";
  };

  // Track individual card learning
  const trackCardLearningData = async (
    card: PracticeCard,
    isCorrect: boolean
  ) => {
    if (!card._id) {
      console.warn("Card missing _id, skipping tracking");
      return;
    }

    const responseTime = Date.now() - cardStartTime;
    const existing = cardTracking.get(card._id);
    const reviewCount = existing ? existing.reviewCount + 1 : 1;

    // Determine difficulty based on response time and correctness
    let difficulty: DifficultyLevel = "good";
    if (!isCorrect) {
      difficulty = "again";
    } else if (responseTime < 3000) {
      difficulty = "easy";
    } else if (responseTime < 8000) {
      difficulty = "good";
    } else {
      difficulty = "hard";
    }

    try {
      await trackCard({
        cardId: card._id, // Now using real MongoDB ObjectId
        flashcardId: cardId,
        isCorrect,
        responseTime,
        difficulty,
        reviewCount,
        studiedAt: new Date().toISOString(),
      });

      // Update local tracking state for statistics
      setCardTracking((prev) =>
        new Map(prev).set(card._id!, {
          cardId: card._id!,
          isCorrect,
          responseTime,
          reviewCount,
          startTime: Date.now(),
        })
      );
    } catch (error) {
      console.error("Failed to track card learning:", error);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        handleFlip();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, isFlipped, flashcards.length]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-4">Failed to load flashcard</p>
            <Link href="/flashcards">
              <Button variant="outline">Back to Flashcards</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">
              This flashcard has no cards to practice
            </p>
            <Link href="/flashcards">
              <Button variant="outline">Back to Flashcards</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const flashcard = data.data;
  const currentCard = flashcards[currentIndex];
  const progress = (studiedCards.size / flashcards.length) * 100;

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
      setCardStartTime(Date.now()); // Reset timer for new card
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
      setCardStartTime(Date.now()); // Reset timer for new card
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    // Don't add to studiedCards here - will be added when user answers
    // Auto read is handled by useEffect when isFlipped changes
  };

  const handleSpeak = (card: PracticeCard) => async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card flip when clicking speaker button
    // Read vocabulary if front side, meaning if back side
    const textToSpeak = isFlipped ? card.meaning : card.vocabulary;
    if (textToSpeak) {
      await speak(textToSpeak);
    }
  };

  const handleCorrect = async () => {
    // Mark as studied when user answers (whether flipped or not)
    setStudiedCards((prev) => new Set([...prev, currentCard.id]));
    setCorrectCards((prev) => new Set([...prev, currentCard.id]));
    await trackCardLearningData(currentCard, true);
    handleNext();
  };

  const handleIncorrect = async () => {
    // Mark as studied when user answers (whether flipped or not)
    setStudiedCards((prev) => new Set([...prev, currentCard.id]));
    correctCards.delete(currentCard.id);
    setCorrectCards(new Set(correctCards));
    await trackCardLearningData(currentCard, false);
    handleNext();
  };

  const resetProgress = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setStudiedCards(new Set());
    setCorrectCards(new Set());
    setCardTracking(new Map());
    setSessionStartTime(Date.now());
    setCardStartTime(Date.now());
    hasTrackedSession.current = false;
  };

  const handleFinishSession = async () => {
    if (studiedCards.size === 0) {
      router.push("/flashcards");
      return;
    }

    const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 1000);

    try {
      await trackSession({
        flashcardId: cardId,
        cardsStudied: studiedCards.size,
        correctAnswers: correctCards.size,
        sessionDuration,
        difficulty: calculateSessionDifficulty(),
        studiedAt: new Date(sessionStartTime).toISOString(),
      });
      hasTrackedSession.current = true;
      router.push("/flashcards");
    } catch (error) {
      console.error("Failed to track session:", error);
      router.push("/flashcards");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/flashcards">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sets
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">{flashcard.name}</h1>
              <p className="text-muted-foreground">
                {flashcard.description || "Master Japanese vocabulary"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Voice:</label>
              <Select value={currentVoiceName} onValueChange={setVoiceName}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {voices.map((voice) => (
                    <SelectItem key={voice.name} value={voice.name}>
                      {voice.name} {voice.lang && `(${voice.lang})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              {autoRead !== "off" ? (
                <Volume2 className="h-4 w-4 text-primary" />
              ) : (
                <VolumeX className="h-4 w-4 text-muted-foreground" />
              )}
              <Label className="text-sm text-muted-foreground">
                Auto Read:
              </Label>
              <Select value={autoRead} onValueChange={(value: "off" | "front" | "back") => setAutoRead(value)}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="off">Tắt</SelectItem>
                  <SelectItem value="front">Mặt trước</SelectItem>
                  <SelectItem value="back">Mặt sau</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Badge variant="outline">{flashcard.level}</Badge>
            <span className="text-sm text-muted-foreground">
              {currentIndex + 1} of {flashcards.length}
            </span>
            {studiedCards.size > 0 && (
              <Button
                variant="default"
                size="sm"
                onClick={handleFinishSession}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4" />
                Finish
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          {/* Flashcard */}
          <div className="relative mb-8">
            <div className={styles.cardContainer}>
              <div
                className={styles.cardSlider}
                style={{
                  transform: `translateX(-${currentIndex * 100}%)`
                }}
              >
                {flashcards.map((card, index) => (
                  <div key={card._id} className={styles.cardSlide}>
                    <div
                      className={cn(
                        "w-full h-80 cursor-pointer",
                        styles.flipCard
                      )}
                      onClick={handleFlip}
                    >
                      <div className={cn(styles.flipCardInner, isFlipped && styles.flipped)}>
                        {/* Front of card */}
                        <Card className={cn("w-full h-full", styles.flipCardFront)}>
                          <CardContent className="flex items-center justify-center h-full p-8 relative">
                            <div className="text-center">
                              <div className="text-8xl font-bold text-primary mb-4">
                                {card.vocabulary}
                              </div>
                              <p className="text-muted-foreground">Click to reveal</p>
                            </div>
                          </CardContent>
                          <div className="absolute top-4 right-4 flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={handleSpeak(card)}
                              disabled={isSpeaking}
                              title="Pronounce vocabulary"
                            >
                              <Volume2
                                className={cn(
                                  "h-5 w-5",
                                  isSpeaking && "animate-pulse text-primary"
                                )}
                              />
                            </Button>
                            <RotateCcw className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </Card>

                        {/* Back of card */}
                        <Card className={cn("w-full h-full", styles.flipCardBack)}>
                          <CardContent className="flex items-center justify-center h-full p-8 relative">
                            <div className="text-center">
                              <div className="text-6xl font-bold text-foreground mb-4">
                                {card.meaning}
                              </div>
                              <p className="text-muted-foreground">
                                Did you get it right?
                              </p>
                            </div>
                          </CardContent>
                          <div className="absolute top-4 right-4 flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={handleSpeak(card)}
                              disabled={isSpeaking}
                              title="Pronounce meaning"
                            >
                              <Volume2
                                className={cn(
                                  "h-5 w-5",
                                  isSpeaking && "animate-pulse text-primary"
                                )}
                              />
                            </Button>
                            <RotateCcw className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </Card>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <Button
              variant="outline"
              size="lg"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="flex items-center gap-2 bg-transparent"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="lg"
                onClick={handleIncorrect}
                className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
              >
                <X className="h-4 w-4" />
                Không thuộc
              </Button>
              <Button
                size="lg"
                onClick={handleCorrect}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
              >
                <Check className="h-4 w-4" />
                Thuộc
              </Button>
            </div>

            <Button
              variant="outline"
              size="lg"
              onClick={handleNext}
              disabled={currentIndex === flashcards.length - 1}
              className="flex items-center gap-2 bg-transparent"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="text-center text-sm text-muted-foreground mb-8">
            <p>
              Use{" "}
              <kbd className="px-2 py-1 bg-muted rounded text-xs">Space</kbd> to
              flip •
              <kbd className="px-2 py-1 bg-muted rounded text-xs mx-1">←</kbd>{" "}
              Previous •
              <kbd className="px-2 py-1 bg-muted rounded text-xs">→</kbd> Next
            </p>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="p-6 border-t border-border bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Learning Progress</h3>
              <p className="text-sm text-muted-foreground">
                {studiedCards.size} of {flashcards.length} cards studied •{" "}
                {correctCards.size} correct
              </p>
            </div>
            <Button variant="outline" onClick={resetProgress}>
              Reset Progress
            </Button>
          </div>
          <Progress value={progress} className="h-3" />
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>0%</span>
            <span className="font-medium text-primary">
              {Math.round(progress)}% Complete
            </span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Study Statistics */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  {studiedCards.size}
                </div>
                <p className="text-sm text-muted-foreground">Cards Studied</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {correctCards.size}
                </div>
                <p className="text-sm text-muted-foreground">Correct Answers</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {studiedCards.size > 0
                    ? Math.round((correctCards.size / studiedCards.size) * 100)
                    : 0}
                  %
                </div>
                <p className="text-sm text-muted-foreground">Accuracy Rate</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
