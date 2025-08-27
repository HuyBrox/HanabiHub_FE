"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, RotateCcw, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

const flashcards = [
  {
    id: 1,
    front: "水",
    back: "みず / mizu",
    meaning: "water",
    category: "Basic Kanji",
  },
  {
    id: 2,
    front: "火",
    back: "ひ / hi",
    meaning: "fire",
    category: "Basic Kanji",
  },
  {
    id: 3,
    front: "木",
    back: "き / ki",
    meaning: "tree, wood",
    category: "Basic Kanji",
  },
  {
    id: 4,
    front: "金",
    back: "きん / kin",
    meaning: "gold, money",
    category: "Basic Kanji",
  },
  {
    id: 5,
    front: "土",
    back: "つち / tsuchi",
    meaning: "earth, soil",
    category: "Basic Kanji",
  },
  {
    id: 6,
    front: "こんにちは",
    back: "konnichiwa",
    meaning: "hello, good afternoon",
    category: "Greetings",
  },
  {
    id: 7,
    front: "ありがとう",
    back: "arigatou",
    meaning: "thank you",
    category: "Greetings",
  },
  {
    id: 8,
    front: "すみません",
    back: "sumimasen",
    meaning: "excuse me, sorry",
    category: "Greetings",
  },
  {
    id: 9,
    front: "はい",
    back: "hai",
    meaning: "yes",
    category: "Basic Words",
  },
  {
    id: 10,
    front: "いいえ",
    back: "iie",
    meaning: "no",
    category: "Basic Words",
  },
]

export default function FlashcardsPage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [studiedCards, setStudiedCards] = useState<Set<number>>(new Set())
  const [correctCards, setCorrectCards] = useState<Set<number>>(new Set())

  const currentCard = flashcards[currentIndex]
  const progress = (studiedCards.size / flashcards.length) * 100

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsFlipped(false)
    }
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
    if (!isFlipped) {
      setStudiedCards((prev) => new Set([...prev, currentCard.id]))
    }
  }

  const handleCorrect = () => {
    setCorrectCards((prev) => new Set([...prev, currentCard.id]))
    handleNext()
  }

  const handleIncorrect = () => {
    correctCards.delete(currentCard.id)
    setCorrectCards(new Set(correctCards))
    handleNext()
  }

  const resetProgress = () => {
    setCurrentIndex(0)
    setIsFlipped(false)
    setStudiedCards(new Set())
    setCorrectCards(new Set())
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Flashcards Practice</h1>
            <p className="text-muted-foreground">Master Japanese characters and vocabulary</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline">{currentCard.category}</Badge>
            <span className="text-sm text-muted-foreground">
              {currentIndex + 1} of {flashcards.length}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          {/* Flashcard */}
          <div className="relative mb-8">
            <Card
              className={cn(
                "w-full h-80 cursor-pointer transition-all duration-500 transform-gpu",
                "hover:shadow-lg",
                isFlipped && "rotate-y-180",
              )}
              onClick={handleFlip}
            >
              <CardContent className="flex items-center justify-center h-full p-8 relative">
                {!isFlipped ? (
                  // Front of card
                  <div className="text-center">
                    <div className="text-8xl font-bold text-primary mb-4">{currentCard.front}</div>
                    <p className="text-muted-foreground">Click to reveal</p>
                  </div>
                ) : (
                  // Back of card
                  <div className="text-center space-y-4">
                    <div className="text-4xl font-bold text-foreground">{currentCard.back}</div>
                    <div className="text-2xl text-muted-foreground">{currentCard.meaning}</div>
                    <p className="text-sm text-muted-foreground">Did you get it right?</p>
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <RotateCcw className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
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

            {isFlipped && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleIncorrect}
                  className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                >
                  <X className="h-4 w-4" />
                  Incorrect
                </Button>
                <Button
                  size="lg"
                  onClick={handleCorrect}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                >
                  <Check className="h-4 w-4" />
                  Correct
                </Button>
              </div>
            )}

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
              Use <kbd className="px-2 py-1 bg-muted rounded text-xs">Space</kbd> to flip •
              <kbd className="px-2 py-1 bg-muted rounded text-xs mx-1">←</kbd> Previous •
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
                {studiedCards.size} of {flashcards.length} cards studied • {correctCards.size} correct
              </p>
            </div>
            <Button variant="outline" onClick={resetProgress}>
              Reset Progress
            </Button>
          </div>
          <Progress value={progress} className="h-3" />
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>0%</span>
            <span className="font-medium text-primary">{Math.round(progress)}% Complete</span>
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
                <div className="text-2xl font-bold text-primary">{studiedCards.size}</div>
                <p className="text-sm text-muted-foreground">Cards Studied</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{correctCards.size}</div>
                <p className="text-sm text-muted-foreground">Correct Answers</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {studiedCards.size > 0 ? Math.round((correctCards.size / studiedCards.size) * 100) : 0}%
                </div>
                <p className="text-sm text-muted-foreground">Accuracy Rate</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
