"use client";

import { useState } from "react";
import { X, Image as ImageIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { AnimatePresence, motion } from "framer-motion";
import { useCreateFlashListMutation, useGetAllFlashCardsQuery, useCreateFlashCardMutation } from "@/store/services/flashcardApi";
import { useDebounce } from "@/hooks/useDebounce";
import { useNotification } from "@/components/notification";

interface AddNewModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddNewModal({ open, onClose }: AddNewModalProps) {
  const [activeTab, setActiveTab] = useState<"flashlist" | "flashcard">(
    "flashlist"
  );
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [isPublic, setIsPublic] = useState(true);

  // FlashList form data
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState<"N5" | "N4" | "N3" | "N2" | "N1">("N5");
  const [selectedFlashcards, setSelectedFlashcards] = useState<string[]>([]);

  // search flashcard
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  // thêm card
  const [cards, setCards] = useState<{ front: string; back: string }[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  // API hooks
  const [createFlashList, { isLoading: isCreatingFlashList }] = useCreateFlashListMutation();
  const [createFlashCard, { isLoading: isCreatingFlashCard }] = useCreateFlashCardMutation();
  const { success, error: showError } = useNotification();

  // Fetch user's flashcards for selection
  const { data: flashCardsData, isLoading: isLoadingCards } = useGetAllFlashCardsQuery(
    { page: 1, limit: 50 }, // Get more cards for selection
    { skip: !open } // Only fetch when modal is open
  );

  // Filter flashcards based on search
  const filteredFlashCards = flashCardsData?.data?.flashCards?.filter((card) =>
    card.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    card.description.toLowerCase().includes(debouncedSearch.toLowerCase())
  ) || [];

  const perPage = 5;
  const paginated = filteredFlashCards.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filteredFlashCards.length / perPage);

  if (!open) return null;

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
    e.target.value = "";
  };

  // Handle flashcard selection
  const handleAddFlashcard = (cardId: string) => {
    if (!selectedFlashcards.includes(cardId)) {
      setSelectedFlashcards([...selectedFlashcards, cardId]);
    }
  };

  const handleRemoveFlashcard = (cardId: string) => {
    setSelectedFlashcards(selectedFlashcards.filter(id => id !== cardId));
  };

  // Handle create FlashList
  const handleCreateFlashList = async () => {
    if (!title.trim()) {
      showError("Vui lòng nhập tiêu đề FlashList", {
        title: "Thiếu thông tin",
        duration: 4000,
      });
      return;
    }

    try {
      // Tạo data object với file
      const createData = {
        title,
        description,
        level,
        isPublic,
        flashcards: selectedFlashcards,
        thumbnail: thumbnailFile || undefined, // Sử dụng file từ state
      };

      console.log("Creating FlashList with data:", createData); // Debug log

      await createFlashList(createData).unwrap();

      // Hiển thị thông báo thành công
      success(`"${title}" đã được tạo và lưu vào thư viện của bạn`, {
        title: "🎉 Tạo FlashList thành công!",
        duration: 4000,
      });

      // Đợi ít nhất 2s để user thấy loading
      await new Promise(resolve => setTimeout(resolve, 2000));

      handleClose();
    } catch (error: any) {
      console.error("Create FlashList error:", error); // Debug log
      showError(error?.data?.message || "Vui lòng thử lại sau", {
        title: "❌ Có lỗi xảy ra khi tạo FlashList",
        duration: 5000,
      });
    }
  };

  // xử lý nhập liệu thẻ học tập
  const handleCardsInput = (value: string) => {
    const lines = value.split("\n");
    const parsed: { front: string; back: string }[] = [];
    const errorLines: number[] = [];

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      const parts = trimmed.split("-").map((s) => s.trim());

      if (parts.length === 2 && parts[0] && parts[1]) {
        parsed.push({ front: parts[0], back: parts[1] });
      } else {
        errorLines.push(idx + 1);
      }
    });

    setCards(parsed);
    if (errorLines.length > 0) {
      setErrors([`Dòng ${errorLines.join(", ")} không hợp lệ`]);
    } else {
      setErrors([]);
    }
  };

  // Handle create FlashCard
  const handleCreateFlashCard = async () => {
    if (!title.trim()) {
      showError("Vui lòng nhập tên FlashCard", {
        title: "Thiếu thông tin",
        duration: 4000,
      });
      return;
    }

    if (cards.length === 0) {
      showError("Vui lòng thêm ít nhất một thẻ học tập", {
        title: "Thiếu thông tin",
        duration: 4000,
      });
      return;
    }

    try {
      // Transform cards to API format
      const transformedCards = cards.map(card => ({
        vocabulary: card.front,
        meaning: card.back
      }));

      const createData = {
        name: title,
        cards: transformedCards,
        isPublic,
        description,
        level,
        thumbnail: thumbnailFile || undefined,
      };

      console.log("Creating FlashCard with data:", createData); // Debug log

      await createFlashCard(createData).unwrap();

      // Hiển thị thông báo thành công
      success(`"${title}" đã được tạo và lưu vào thư viện của bạn`, {
        title: "🎉 Tạo FlashCard thành công!",
        duration: 4000,
      });

      // Đợi ít nhất 2s để user thấy loading
      await new Promise(resolve => setTimeout(resolve, 2000));

      handleClose();
    } catch (error: any) {
      console.error("Create FlashCard error:", error); // Debug log
      showError(error?.data?.message || "Vui lòng thử lại sau", {
        title: "❌ Có lỗi xảy ra khi tạo FlashCard",
        duration: 5000,
      });
    }
  };

  // reset khi đóng modal
  const handleClose = () => {
    setActiveTab("flashlist");
    setThumbnailPreview(null);
    setThumbnailFile(null);
    setIsPublic(true);
    setTitle("");
    setDescription("");
    setLevel("N5");
    setSelectedFlashcards([]);
    setSearch("");
    setPage(1);
    setCards([]);
    setErrors([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      {/* Modal box */}
      <div
        className="
          relative z-10 bg-white dark:bg-neutral-900 shadow-lg
          w-full max-w-5xl p-6 space-y-6
          max-h-[90vh] overflow-y-auto
          rounded-none sm:rounded-lg
        "
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Tabs */}
        <div className="flex gap-2 justify-center mb-4">
          <Button
            variant={activeTab === "flashlist" ? "default" : "outline"}
            onClick={() => setActiveTab("flashlist")}
          >
            Flash List
          </Button>
          <Button
            variant={activeTab === "flashcard" ? "default" : "outline"}
            onClick={() => setActiveTab("flashcard")}
          >
            Flash Card
          </Button>
        </div>

        {/* Animate Presence cho swap tab */}
        <AnimatePresence mode="wait">
          {activeTab === "flashlist" && (
            <motion.div
              key="flashlist"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <Input
                placeholder="Tiêu đề FlashList..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <textarea
                placeholder="Mô tả..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm min-h-[80px]"
              />

              {/* Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Left */}
                <div className="space-y-4">
                  <Select value={level} onValueChange={(value: any) => setLevel(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Cấp độ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="N5">N5</SelectItem>
                      <SelectItem value="N4">N4</SelectItem>
                      <SelectItem value="N3">N3</SelectItem>
                      <SelectItem value="N2">N2</SelectItem>
                      <SelectItem value="N1">N1</SelectItem>
                    </SelectContent>
                  </Select>

                  <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => setIsPublic(!isPublic)}
                  >
                    <p className="text-sm">Công khai</p>
                    <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                  </div>

                  {/* Search + list */}
                  <div className="space-y-2">
                    <Input
                      placeholder="Tìm flashcard để thêm..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />

                    <div className="border rounded p-2 max-h-80 md:max-h-96 overflow-y-auto space-y-2">
                      {isLoadingCards ? (
                        <div className="text-center py-4 text-sm text-muted-foreground">
                          Đang tải flashcards...
                        </div>
                      ) : paginated.length === 0 ? (
                        <div className="text-center py-4 text-sm text-muted-foreground">
                          {search ? "Không tìm thấy flashcard nào" : "Chưa có flashcard nào"}
                        </div>
                      ) : (
                        paginated.map((fc) => (
                          <div
                            key={fc._id}
                            className="flex items-center justify-between border rounded px-2 py-1"
                          >
                            <div>
                              <p className="text-sm font-medium">
                                {fc.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {fc.description || "Chưa có mô tả"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {fc.cards.length} thẻ • {fc.level}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant={selectedFlashcards.includes(fc._id) ? "default" : "outline"}
                              onClick={() => {
                                if (selectedFlashcards.includes(fc._id)) {
                                  handleRemoveFlashcard(fc._id);
                                } else {
                                  handleAddFlashcard(fc._id);
                                }
                              }}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Pagination */}
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (page > 1) setPage(page - 1);
                            }}
                          />
                        </PaginationItem>

                        {Array.from({ length: totalPages }).map((_, i) => (
                          <PaginationItem key={i}>
                            <PaginationLink
                              href="#"
                              isActive={page === i + 1}
                              onClick={(e) => {
                                e.preventDefault();
                                setPage(i + 1);
                              }}
                            >
                              {i + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}

                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (page < totalPages) setPage(page + 1);
                            }}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>

                    {/* Selected flashcards */}
                    {selectedFlashcards.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Flashcards đã chọn ({selectedFlashcards.length})</p>
                        <div className="border rounded p-2 max-h-32 overflow-y-auto space-y-1">
                          {selectedFlashcards.map((cardId) => {
                            const card = flashCardsData?.data?.flashCards?.find(c => c._id === cardId);
                            return card ? (
                              <div key={cardId} className="flex items-center justify-between bg-primary/5 rounded px-2 py-1">
                                <div>
                                  <p className="text-xs font-medium">{card.name}</p>
                                  <p className="text-xs text-muted-foreground">{card.cards.length} thẻ</p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleRemoveFlashcard(cardId)}
                                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Thumbnail */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Ảnh Thumbnail
                  </label>

                  {!thumbnailPreview ? (
                    <label
                      htmlFor="thumbnail-upload"
                      className="flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition"
                    >
                      <ImageIcon className="h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500">Chọn ảnh</p>
                    </label>
                  ) : (
                    <div className="relative w-full aspect-square">
                      <img
                        src={thumbnailPreview}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setThumbnailPreview(null);
                          setThumbnailFile(null);
                        }}
                        className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  <input
                    id="thumbnail-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="hidden"
                  />
                </div>
              </div>

              <Button
                className="w-full"
                onClick={handleCreateFlashList}
                disabled={isCreatingFlashList || !title.trim()}
              >
                {isCreatingFlashList ? "Đang tạo..." : "Lưu FlashList"}
              </Button>
            </motion.div>
          )}

          {activeTab === "flashcard" && (
            <motion.div
              key="flashcard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <Input
                placeholder="Tên bộ FlashCard..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Left */}
                <div className="space-y-4">
                  <textarea
                    placeholder="Mô tả..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm min-h-[80px]"
                  />

                  <Select value={level} onValueChange={(value: any) => setLevel(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Cấp độ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="N5">N5</SelectItem>
                      <SelectItem value="N4">N4</SelectItem>
                      <SelectItem value="N3">N3</SelectItem>
                      <SelectItem value="N2">N2</SelectItem>
                      <SelectItem value="N1">N1</SelectItem>
                    </SelectContent>
                  </Select>

                  <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => setIsPublic(!isPublic)}
                  >
                    <p className="text-sm">Công khai</p>
                    <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                  </div>
                </div>

                {/* Right Thumbnail + Hướng dẫn */}
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Ảnh Thumbnail
                    </label>

                    {!thumbnailPreview ? (
                      <label
                        htmlFor="thumbnail-upload"
                        className="flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition"
                      >
                        <ImageIcon className="h-10 w-10 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">Chọn ảnh</p>
                      </label>
                    ) : (
                      <div className="relative w-40 h-40">
                        <img
                          src={thumbnailPreview}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setThumbnailPreview(null);
                            setThumbnailFile(null);
                          }}
                          className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    <input
                      id="thumbnail-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="hidden"
                    />
                  </div>

                  {/* Hướng dẫn */}
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground bg-gray-50 dark:bg-neutral-800 p-3 rounded mt-6">
                      <p className="font-medium mb-1">Hướng dẫn nhập liệu:</p>
                      <p>Mỗi dòng là một thẻ học tập</p>
                      <p>Dùng dấu "-" để phân tách từ vựng và nghĩa</p>
                      <strong>Ví dụ:</strong>
                      <ul className="list-disc list-inside">
                        <li>hello - xin chào</li>
                        <li>goodbye - tạm biệt</li>
                        <li>thanks - cảm ơn</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Nhập thẻ */}
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Nội dung thẻ (mỗi dòng một thẻ)
                </p>
                <textarea
                  placeholder="mặt trước - mặt sau"
                  className="w-full border rounded px-3 py-2 text-sm min-h-[100px]"
                  onChange={(e) => handleCardsInput(e.target.value)}
                />
              </div>

              {/* Preview thẻ hợp lệ */}
              <div className="space-y-2 mt-3">
                {cards.map((c, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between border rounded px-3 py-2"
                  >
                    <p className="text-sm">
                      <span className="font-medium">{c.front}</span> - {c.back}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        setCards(cards.filter((_, i) => i !== idx))
                      }
                      className="text-red-500 hover:underline text-sm"
                    >
                      Xóa
                    </button>
                  </div>
                ))}
                {cards.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {cards.length} thẻ
                  </p>
                )}
              </div>

              {/* Lỗi nhập */}
              {errors.length > 0 && (
                <div className="mt-3 text-red-500 text-sm flex items-center gap-2">
                  ⚠️ <span>{errors[0]}</span>
                </div>
              )}

              <Button
                className="w-full"
                onClick={handleCreateFlashCard}
                disabled={isCreatingFlashCard || !title.trim() || cards.length === 0}
              >
                {isCreatingFlashCard ? "Đang tạo..." : "Lưu FlashCard"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
