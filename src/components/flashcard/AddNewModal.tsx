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

interface AddNewModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddNewModal({ open, onClose }: AddNewModalProps) {
  const [activeTab, setActiveTab] = useState<"flashlist" | "flashcard">(
    "flashlist"
  );
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(true);

  // search flashcard
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // thêm card
  const [cards, setCards] = useState<{ front: string; back: string }[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  // fake dữ liệu flashcard
  const results = Array.from({ length: 15 }, (_, i) => ({
    id: i + 1,
    vocabulary: `Từ vựng ${i + 1}`,
    meaning: `Nghĩa ${i + 1}`,
  }));
  const perPage = 5;
  const paginated = results.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(results.length / perPage);

  if (!open) return null;

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailPreview(URL.createObjectURL(file));
    }
    e.target.value = "";
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

  // reset khi đóng modal
  const handleClose = () => {
    setActiveTab("flashlist");
    setThumbnailPreview(null);
    setIsPublic(true);
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
              <Input placeholder="Tiêu đề FlashList..." required />
              <textarea
                placeholder="Mô tả..."
                className="w-full border rounded px-3 py-2 text-sm min-h-[80px]"
              />

              {/* Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Left */}
                <div className="space-y-4">
                  <Select>
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
                      {paginated.map((fc) => (
                        <div
                          key={fc.id}
                          className="flex items-center justify-between border rounded px-2 py-1"
                        >
                          <div>
                            <p className="text-sm font-medium">
                              {fc.vocabulary}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {fc.meaning}
                            </p>
                          </div>
                          <Button size="sm" variant="outline">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
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
                        onClick={() => setThumbnailPreview(null)}
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

              <Button className="w-full">Lưu FlashList</Button>
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
              <Input placeholder="Tên bộ FlashCard..." required />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Left */}
                <div className="space-y-4">
                  <textarea
                    placeholder="Mô tả..."
                    className="w-full border rounded px-3 py-2 text-sm min-h-[80px]"
                  />

                  <Select>
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
                          onClick={() => setThumbnailPreview(null)}
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

              <Button className="w-full">Lưu FlashCard</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
