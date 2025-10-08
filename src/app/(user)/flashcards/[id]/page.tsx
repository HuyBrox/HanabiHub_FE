"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  PlayCircle,
  Loader2,
  BookOpen,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import {
  useGetFlashCardByIdQuery,
  useUpdateFlashCardMutation,
  useDeleteFlashCardMutation,
} from "@/store/services/flashcardApi";
import { IFlashCardItem } from "@/types/flashcard";
import { useToast } from "@/hooks/use-toast";
import styles from "./flashcard-detail.module.css";

export default function FlashcardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const cardId = params.id as string;

  const { data, isLoading, error } = useGetFlashCardByIdQuery(cardId);
  const [updateFlashCard, { isLoading: isUpdating }] =
    useUpdateFlashCardMutation();
  const [deleteFlashCard, { isLoading: isDeleting }] =
    useDeleteFlashCardMutation();

  const [editMode, setEditMode] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [cards, setCards] = useState<IFlashCardItem[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Initialize state when data loads
  useEffect(() => {
    if (data?.data) {
      setCards(data.data.cards);
      setName(data.data.name);
      setDescription(data.data.description);
    }
  }, [data]);

  const handleAddCard = () => {
    setCards([...cards, { vocabulary: "", meaning: "" }]);
    setEditingIndex(cards.length);
  };

  const handleEditCard = (index: number) => {
    setEditingIndex(index);
  };

  const handleSaveCard = (index: number) => {
    if (!cards[index].vocabulary || !cards[index].meaning) {
      toast({
        title: "Error",
        description: "Vocabulary and meaning cannot be empty",
        variant: "destructive",
      });
      return;
    }
    setEditingIndex(null);
  };

  const handleDeleteCard = (index: number) => {
    const newCards = cards.filter((_, i) => i !== index);
    setCards(newCards);
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  const handleUpdateCard = (
    index: number,
    field: "vocabulary" | "meaning",
    value: string
  ) => {
    const newCards = [...cards];
    newCards[index][field] = value;
    setCards(newCards);
  };

  const handleSaveAll = async () => {
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Flashcard name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    if (cards.length === 0) {
      toast({
        title: "Error",
        description: "You must have at least one card",
        variant: "destructive",
      });
      return;
    }

    const hasEmptyCard = cards.some(
      (card) => !card.vocabulary.trim() || !card.meaning.trim()
    );

    if (hasEmptyCard) {
      toast({
        title: "Error",
        description: "All cards must have both vocabulary and meaning",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateFlashCard({
        id: cardId,
        data: {
          name,
          description,
          cards,
        },
      }).unwrap();

      toast({
        title: "Success",
        description: "Flashcard updated successfully",
      });
      setEditMode(false);
      setEditingIndex(null);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.data?.message || "Failed to update flashcard",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this flashcard?")) {
      return;
    }

    try {
      await deleteFlashCard(cardId).unwrap();
      toast({
        title: "Success",
        description: "Flashcard deleted successfully",
      });
      router.push("/flashcards");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.data?.message || "Failed to delete flashcard",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    if (data?.data) {
      setCards(data.data.cards);
      setName(data.data.name);
      setDescription(data.data.description);
    }
    setEditMode(false);
    setEditingIndex(null);
  };

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

  const flashcard = data.data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header with Thumbnail */}
      <div className="relative border-b border-border/50 backdrop-blur-sm bg-background/80">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

        <div className="relative max-w-6xl mx-auto p-6">
          {/* Back Button */}
          <div className="mb-6">
            <Link href="/flashcards">
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-primary/10 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Flashcards
              </Button>
            </Link>
          </div>

          <div className="flex flex-col-reverse md:flex-row-reverse gap-10 items-center md:items-start">
            {/* Thumbnail Section */}
            <div
              className={cn(
                styles.thumbnailContainer,
                "ring-4 ring-primary/30 hover:ring-primary group"
              )}
            >
              <Image
                src={
                  flashcard.thumbnail || "/images/placeholders/placeholder.jpg"
                }
                alt={flashcard.name}
                fill
                className={cn("object-cover", styles.thumbnailImage)}
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4 flex gap-2">
                <Badge
                  variant="outline"
                  className="bg-background/80 backdrop-blur-sm"
                >
                  {flashcard.level}
                </Badge>
                <Badge
                  variant={flashcard.isPublic ? "default" : "secondary"}
                  className="bg-background/80 backdrop-blur-sm"
                >
                  {flashcard.isPublic ? "Public" : "Private"}
                </Badge>
              </div>
            </div>

            {/* Info Section */}
            <div className="flex-1">
              {editMode ? (
                <div className={cn("space-y-4", styles.fadeIn)}>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Flashcard name"
                    className="text-2xl font-bold border-2 focus:border-primary"
                  />
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description (optional)"
                    className="border-2 focus:border-primary"
                  />
                </div>
              ) : (
                <div className={cn("space-y-4", styles.fadeIn)}>
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    {flashcard.name}
                  </h1>

                  {flashcard.description && (
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {flashcard.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      <span className="font-medium">
                        {flashcard.cards.length} cards
                      </span>
                    </div>
                    {flashcard.createdAt && (
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        <span>
                          Created{" "}
                          {new Date(flashcard.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mt-6">
                {!editMode ? (
                  <>
                    <Link href={`/flashcards/practice/${cardId}`}>
                      <Button
                        size="lg"
                        className={cn(
                          "flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 shadow-md hover:shadow-xl",
                          styles.buttonScale
                        )}
                      >
                        <PlayCircle className="h-5 w-5" />
                        Start Practice
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setEditMode(true)}
                      className={cn(
                        "flex items-center gap-2 border-2 hover:bg-primary/5",
                        styles.buttonScale
                      )}
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className={cn(
                        "flex items-center gap-2 border-2 border-destructive/50 text-destructive hover:bg-destructive/10",
                        styles.buttonScale
                      )}
                    >
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      Delete
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="lg"
                      onClick={handleSaveAll}
                      disabled={isUpdating}
                      className={cn(
                        "flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600",
                        styles.buttonScale
                      )}
                    >
                      {isUpdating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Save All Changes
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleCancel}
                      disabled={isUpdating}
                      className={cn(
                        "flex items-center gap-2 border-2",
                        styles.buttonScale
                      )}
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cards List */}
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Vocabulary Cards</h2>
              <p className="text-muted-foreground">
                {cards.length} {cards.length === 1 ? "card" : "cards"} in this
                set
              </p>
            </div>
            {editMode && (
              <Button
                variant="outline"
                size="lg"
                onClick={handleAddCard}
                className="flex items-center gap-2 border-2 border-dashed border-primary hover:bg-primary/5 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Add New Card
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6">
            {cards.map((card, index) => (
              <Card
                key={index}
                className={cn(
                  "group border-2 hover:border-primary/50 overflow-hidden",
                  styles.cardHover
                )}
              >
                <CardContent className="p-6">
                  {editMode || editingIndex === index ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-primary flex items-center gap-2">
                            <span className="bg-primary/10 px-2 py-1 rounded">
                              Vocabulary
                            </span>
                          </label>
                          <Input
                            value={card.vocabulary}
                            onChange={(e) =>
                              handleUpdateCard(
                                index,
                                "vocabulary",
                                e.target.value
                              )
                            }
                            placeholder="Enter Japanese vocabulary"
                            className="text-2xl font-bold border-2 focus:border-primary h-14"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-primary flex items-center gap-2">
                            <span className="bg-primary/10 px-2 py-1 rounded">
                              Meaning
                            </span>
                          </label>
                          <Input
                            value={card.meaning}
                            onChange={(e) =>
                              handleUpdateCard(index, "meaning", e.target.value)
                            }
                            placeholder="Enter meaning/translation"
                            className="text-2xl border-2 focus:border-primary h-14"
                          />
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t">
                        <span className="text-sm text-muted-foreground">
                          Card #{index + 1}
                        </span>
                        <div className="flex gap-2">
                          {!editMode && (
                            <Button
                              size="sm"
                              onClick={() => handleSaveCard(index)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Save className="h-4 w-4 mr-2" />
                              Save
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteCard(index)}
                            className="hover:bg-destructive/90"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
                              VOCABULARY
                            </span>
                            <span className="text-xs text-muted-foreground">
                              #{index + 1}
                            </span>
                          </div>
                          <p className="text-3xl font-bold text-primary group-hover:text-primary/80 transition-colors">
                            {card.vocabulary}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-1 rounded inline-block">
                            MEANING
                          </span>
                          <p className="text-2xl font-medium text-foreground/90">
                            {card.meaning}
                          </p>
                        </div>
                      </div>
                      {!editMode && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCard(index)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {cards.length === 0 && (
              <Card className="border-2 border-dashed">
                <CardContent className="p-16 text-center">
                  <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-xl font-medium text-muted-foreground mb-2">
                    No cards yet
                  </p>
                  <p className="text-sm text-muted-foreground mb-6">
                    Click "Add New Card" to create your first vocabulary card
                  </p>
                  {editMode && (
                    <Button
                      onClick={handleAddCard}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Your First Card
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
