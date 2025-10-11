"use client";

import { useState, ChangeEvent, FormEvent, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Save,
  FileText,
  Video,
  Upload,
  Plus,
  X,
  Sparkles,
  ListChecks,
  PenLine,
  Volume2,
  Shuffle,
  Mic,
  BookOpen,
  AlertCircle
} from "lucide-react";
import { useGetLessonByIdQuery, useUpdateLessonMutation } from "@/store/services/courseApi";
import { useNotification } from "@/components/notification/NotificationProvider";
import styles from "./edit-lesson.module.css";

// Types
type LessonType = "video" | "task";
type TaskType = "multiple_choice" | "fill_blank" | "listening" | "matching" | "speaking" | "reading";

interface MultipleChoiceQuestion {
  id: string;
  question: string;
  options: { key: string; text: string }[];
  answer: string;
  explanation: string;
}

interface FillBlankItem {
  id: string;
  sentence: string;
  answer: string;
  hints: string[];
}

interface MatchingItem {
  left: string;
  right: string;
}

interface ListeningQuestion {
  id: string;
  question: string;
  options: { key: string; text: string }[];
  answer: string;
}

export default function EditLessonPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const lessonId = params.lessonId as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    data: lessonData,
    isLoading,
    error: queryError,
  } = useGetLessonByIdQuery(lessonId);

  const [updateLesson, { isLoading: isSubmitting }] = useUpdateLessonMutation();
  const { success, error: showError } = useNotification();

  // Basic form data
  const [lessonType, setLessonType] = useState<LessonType>("video");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // Video fields
  const [videoUrl, setVideoUrl] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoType, setVideoType] = useState<"youtube" | "upload">("youtube");

  // Task fields
  const [taskType, setTaskType] = useState<TaskType>("multiple_choice");
  const [taskInstructions, setTaskInstructions] = useState("");

  // Multiple choice
  const [mcQuestions, setMcQuestions] = useState<MultipleChoiceQuestion[]>([]);

  // Fill blank
  const [fbItems, setFbItems] = useState<FillBlankItem[]>([]);

  // Matching
  const [matchingItems, setMatchingItems] = useState<MatchingItem[]>([]);

  // Listening
  const [audioUrl, setAudioUrl] = useState("");
  const [listeningQuestions, setListeningQuestions] = useState<ListeningQuestion[]>([]);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Multi-add mode
  const [isMultiAddMode, setIsMultiAddMode] = useState(false);
  const [multiAddText, setMultiAddText] = useState("");

  // Populate form when lesson data loads
  useEffect(() => {
    if (lessonData?.success && lessonData.data) {
      const lesson = lessonData.data;

      // Set basic info
      setTitle(lesson.title || "");
      setContent(lesson.content || "");
      setLessonType(lesson.type || "video");

      // Set video info
      if (lesson.type === "video") {
        setVideoUrl(lesson.videoUrl || "");
        setVideoType(lesson.videoType || "youtube");
      }

      // Set task info
      if (lesson.type === "task" && lesson.jsonTask) {
        const jsonTask = lesson.jsonTask;
        setTaskType(jsonTask.type || "multiple_choice");
        setTaskInstructions(jsonTask.instructions || "");

        if (jsonTask.type === "multiple_choice" && jsonTask.items) {
          setMcQuestions(jsonTask.items);
        } else if (jsonTask.type === "fill_blank" && jsonTask.items) {
          setFbItems(jsonTask.items);
        } else if (jsonTask.type === "matching" && jsonTask.items) {
          setMatchingItems(jsonTask.items);
        } else if (jsonTask.type === "listening") {
          setAudioUrl(jsonTask.audioUrl || "");
          if (jsonTask.items) {
            setListeningQuestions(jsonTask.items);
          }
        }
      }
    }
  }, [lessonData]);

  // Handle query error
  useEffect(() => {
    if (queryError) {
      setErrors({ fetch: "Không thể tải thông tin bài học" });
    }
  }, [queryError]);

  // Multiple Choice Handlers
  const addMcQuestion = () => {
    setMcQuestions([...mcQuestions, {
      id: `q${mcQuestions.length + 1}`,
      question: "",
      options: [
        { key: "A", text: "" },
        { key: "B", text: "" }
      ],
      answer: "",
      explanation: ""
    }]);
  };

  const removeMcQuestion = (index: number) => {
    setMcQuestions(mcQuestions.filter((_, i) => i !== index));
  };

  const updateMcQuestion = (index: number, field: string, value: any) => {
    const updated = [...mcQuestions];
    updated[index] = { ...updated[index], [field]: value };
    setMcQuestions(updated);
  };

  const addMcOption = (qIndex: number) => {
    const updated = [...mcQuestions];
    const nextKey = String.fromCharCode(65 + updated[qIndex].options.length);
    updated[qIndex].options.push({ key: nextKey, text: "" });
    setMcQuestions(updated);
  };

  const removeMcOption = (qIndex: number, optIndex: number) => {
    const updated = [...mcQuestions];
    updated[qIndex].options = updated[qIndex].options.filter((_, i) => i !== optIndex);
    setMcQuestions(updated);
  };

  const updateMcOption = (qIndex: number, optIndex: number, text: string) => {
    const updated = [...mcQuestions];
    updated[qIndex].options[optIndex].text = text;
    setMcQuestions(updated);
  };

  // Fill Blank Handlers
  const addFbItem = () => {
    setFbItems([...fbItems, {
      id: `q${fbItems.length + 1}`,
      sentence: "",
      answer: "",
      hints: []
    }]);
  };

  const removeFbItem = (index: number) => {
    setFbItems(fbItems.filter((_, i) => i !== index));
  };

  const updateFbItem = (index: number, field: string, value: any) => {
    const updated = [...fbItems];
    updated[index] = { ...updated[index], [field]: value };
    setFbItems(updated);
  };

  const addFbHint = (index: number) => {
    const updated = [...fbItems];
    updated[index].hints.push("");
    setFbItems(updated);
  };

  const removeFbHint = (itemIndex: number, hintIndex: number) => {
    const updated = [...fbItems];
    updated[itemIndex].hints = updated[itemIndex].hints.filter((_, i) => i !== hintIndex);
    setFbItems(updated);
  };

  const updateFbHint = (itemIndex: number, hintIndex: number, value: string) => {
    const updated = [...fbItems];
    updated[itemIndex].hints[hintIndex] = value;
    setFbItems(updated);
  };

  // Matching Handlers
  const addMatchingItem = () => {
    setMatchingItems([...matchingItems, { left: "", right: "" }]);
  };

  const removeMatchingItem = (index: number) => {
    setMatchingItems(matchingItems.filter((_, i) => i !== index));
  };

  const updateMatchingItem = (index: number, field: "left" | "right", value: string) => {
    const updated = [...matchingItems];
    updated[index][field] = value;
    setMatchingItems(updated);
  };

  // Listening Handlers
  const addListeningQuestion = () => {
    setListeningQuestions([...listeningQuestions, {
      id: `q${listeningQuestions.length + 1}`,
      question: "",
      options: [
        { key: "A", text: "" },
        { key: "B", text: "" }
      ],
      answer: ""
    }]);
  };

  const removeListeningQuestion = (index: number) => {
    setListeningQuestions(listeningQuestions.filter((_, i) => i !== index));
  };

  const updateListeningQuestion = (index: number, field: string, value: any) => {
    const updated = [...listeningQuestions];
    updated[index] = { ...updated[index], [field]: value };
    setListeningQuestions(updated);
  };

  const addListeningOption = (qIndex: number) => {
    const updated = [...listeningQuestions];
    const nextKey = String.fromCharCode(65 + updated[qIndex].options.length);
    updated[qIndex].options.push({ key: nextKey, text: "" });
    setListeningQuestions(updated);
  };

  const removeListeningOption = (qIndex: number, optIndex: number) => {
    const updated = [...listeningQuestions];
    updated[qIndex].options = updated[qIndex].options.filter((_, i) => i !== optIndex);
    setListeningQuestions(updated);
  };

  const updateListeningOption = (qIndex: number, optIndex: number, text: string) => {
    const updated = [...listeningQuestions];
    updated[qIndex].options[optIndex].text = text;
    setListeningQuestions(updated);
  };

  // Parse Multi-add text
  const parseMultipleChoice = (text: string) => {
    const questions: MultipleChoiceQuestion[] = [];
    const blocks = text.split(/\n\s*\n/).filter(b => b.trim());

    blocks.forEach((block, idx) => {
      const lines = block.split('\n').map(l => l.trim()).filter(l => l);
      const questionLine = lines.find(l => l.startsWith('Q:') || l.startsWith('q:'));
      const answerLine = lines.find(l => l.toLowerCase().startsWith('answer:'));
      const explanationLine = lines.find(l => l.toLowerCase().startsWith('explanation:'));
      const optionLines = lines.filter(l => /^[A-Za-z]\)/.test(l));

      if (questionLine && optionLines.length > 0) {
        const question = questionLine.replace(/^[Qq]:\s*/, '');
        const options = optionLines.map(opt => {
          const match = opt.match(/^([A-Za-z])\)\s*(.+)$/);
          return match ? { key: match[1].toUpperCase(), text: match[2] } : null;
        }).filter(Boolean) as { key: string; text: string }[];

        const answer = answerLine ? answerLine.replace(/^answer:\s*/i, '').trim().toUpperCase() : '';
        const explanation = explanationLine ? explanationLine.replace(/^explanation:\s*/i, '').trim() : '';

        questions.push({
          id: `q${mcQuestions.length + idx + 1}`,
          question,
          options,
          answer,
          explanation
        });
      }
    });

    return questions;
  };

  const parseFillBlank = (text: string) => {
    const items: FillBlankItem[] = [];
    const blocks = text.split(/\n\s*\n/).filter(b => b.trim());

    blocks.forEach((block, idx) => {
      const lines = block.split('\n').map(l => l.trim()).filter(l => l);
      const sentenceLine = lines[0];
      const hintLines = lines.filter(l => l.toLowerCase().startsWith('hint:'));

      const match = sentenceLine.match(/（(.+?)）/);
      if (match) {
        const answer = match[1];
        const sentence = sentenceLine;
        const hints = hintLines.map(h => h.replace(/^hint:\s*/i, ''));

        items.push({
          id: `q${fbItems.length + idx + 1}`,
          sentence,
          answer,
          hints
        });
      }
    });

    return items;
  };

  const parseMatching = (text: string) => {
    const items: MatchingItem[] = [];
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);

    lines.forEach(line => {
      const match = line.match(/^(.+?)\s*[-=]>\s*(.+)$/);
      if (match) {
        items.push({
          left: match[1].trim(),
          right: match[2].trim()
        });
      }
    });

    return items;
  };

  const parseListening = (text: string) => {
    const questions: ListeningQuestion[] = [];
    const blocks = text.split(/\n\s*\n/).filter(b => b.trim());

    blocks.forEach((block, idx) => {
      const lines = block.split('\n').map(l => l.trim()).filter(l => l);
      const questionLine = lines.find(l => l.startsWith('Q:') || l.startsWith('q:'));
      const answerLine = lines.find(l => l.toLowerCase().startsWith('answer:'));
      const optionLines = lines.filter(l => /^[A-Za-z]\)/.test(l));

      if (questionLine && optionLines.length > 0) {
        const question = questionLine.replace(/^[Qq]:\s*/, '');
        const options = optionLines.map(opt => {
          const match = opt.match(/^([A-Za-z])\)\s*(.+)$/);
          return match ? { key: match[1].toUpperCase(), text: match[2] } : null;
        }).filter(Boolean) as { key: string; text: string }[];

        const answer = answerLine ? answerLine.replace(/^answer:\s*/i, '').trim().toUpperCase() : '';

        questions.push({
          id: `q${listeningQuestions.length + idx + 1}`,
          question,
          options,
          answer
        });
      }
    });

    return questions;
  };

  const handleMultiAdd = () => {
    if (!multiAddText.trim()) {
      setErrors({ multiAdd: "Vui lòng nhập nội dung" });
      return;
    }

    try {
      if (taskType === "multiple_choice") {
        const parsed = parseMultipleChoice(multiAddText);
        if (parsed.length > 0) {
          setMcQuestions([...mcQuestions, ...parsed]);
          setMultiAddText("");
          setIsMultiAddMode(false);
        } else {
          setErrors({ multiAdd: "Không thể parse. Vui lòng kiểm tra định dạng" });
        }
      } else if (taskType === "fill_blank") {
        const parsed = parseFillBlank(multiAddText);
        if (parsed.length > 0) {
          setFbItems([...fbItems, ...parsed]);
          setMultiAddText("");
          setIsMultiAddMode(false);
        } else {
          setErrors({ multiAdd: "Không thể parse. Vui lòng kiểm tra định dạng" });
        }
      } else if (taskType === "matching") {
        const parsed = parseMatching(multiAddText);
        if (parsed.length > 0) {
          setMatchingItems([...matchingItems, ...parsed]);
          setMultiAddText("");
          setIsMultiAddMode(false);
        } else {
          setErrors({ multiAdd: "Không thể parse. Vui lòng kiểm tra định dạng" });
        }
      } else if (taskType === "listening") {
        const parsed = parseListening(multiAddText);
        if (parsed.length > 0) {
          setListeningQuestions([...listeningQuestions, ...parsed]);
          setMultiAddText("");
          setIsMultiAddMode(false);
        } else {
          setErrors({ multiAdd: "Không thể parse. Vui lòng kiểm tra định dạng" });
        }
      }
    } catch (error) {
      setErrors({ multiAdd: "Lỗi khi parse dữ liệu" });
    }
  };

  const getMultiAddFormat = () => {
    if (taskType === "multiple_choice") {
      return `Q: Chọn nghĩa đúng của từ 「行きます」
A) Ăn
B) Đi
C) Uống
D) Nghe
Answer: B
Explanation: 「行きます」 nghĩa là đi

Q: Chọn cách đọc đúng của từ 「見ます」
A) みます
B) きます
C) よみます
Answer: A
Explanation: 「見ます」 đọc là みます`;
    } else if (taskType === "fill_blank") {
      return `まどを（あけて）ください。
Hint: Động từ: mở
Hint: Từ gốc: あけます

ここに名前を（かいて）ください。
Hint: Động từ: viết
Hint: Từ gốc: かきます`;
    } else if (taskType === "matching") {
      return `いぬ -> Con chó
ねこ -> Con mèo
とり -> Con chim
さかな -> Con cá`;
    } else if (taskType === "listening") {
      return `Q: Người nói sẽ đi đâu?
A) Siêu thị
B) Thư viện
C) Trường học
Answer: B

Q: Người nói muốn làm gì?
A) Đọc sách
B) Mua đồ
C) Ăn cơm
Answer: A`;
    }
    return "";
  };

  // Video file handler
  const handleVideoFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file);
      setVideoType("upload");
      setErrors(prev => ({ ...prev, video: "" }));
    } else {
      setErrors(prev => ({ ...prev, video: "File không hợp lệ" }));
    }
  };

  // Validation
  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) {
      newErrors.title = "Tên bài học không được để trống";
    }

    if (!content.trim()) {
      newErrors.content = "Nội dung không được để trống";
    }

    if (lessonType === "video") {
      if (videoType === "youtube" && !videoUrl.trim()) {
        newErrors.video = "Vui lòng nhập URL YouTube hoặc upload video";
      }
      if (videoType === "upload" && !videoFile && !videoUrl) {
        newErrors.video = "Vui lòng chọn file video hoặc giữ nguyên video cũ";
      }
    }

    if (lessonType === "task") {
      if (!taskInstructions.trim()) {
        newErrors.taskInstructions = "Hướng dẫn không được để trống";
      }

      if (taskType === "multiple_choice" && mcQuestions.length === 0) {
        newErrors.task = "Vui lòng thêm ít nhất 1 câu hỏi";
      }

      if (taskType === "fill_blank" && fbItems.length === 0) {
        newErrors.task = "Vui lòng thêm ít nhất 1 câu";
      }

      if (taskType === "matching" && matchingItems.length === 0) {
        newErrors.task = "Vui lòng thêm ít nhất 1 cặp";
      }

      if (taskType === "listening") {
        if (!audioUrl.trim()) {
          newErrors.audio = "Vui lòng nhập URL audio";
        }
        if (listeningQuestions.length === 0) {
          newErrors.task = "Vui lòng thêm ít nhất 1 câu hỏi";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("type", lessonType);

      if (lessonType === "video") {
        if (videoType === "youtube") {
          formData.append("videoUrl", videoUrl);
          formData.append("videoType", "youtube");
        } else if (videoFile) {
          formData.append("video", videoFile);
          formData.append("videoType", "upload");
        }
      } else if (lessonType === "task") {
        const jsonTask: any = {
          type: taskType,
          title: title,
          instructions: taskInstructions
        };

        if (taskType === "multiple_choice") {
          jsonTask.items = mcQuestions;
        } else if (taskType === "fill_blank") {
          jsonTask.items = fbItems;
        } else if (taskType === "matching") {
          jsonTask.items = matchingItems;
        } else if (taskType === "listening") {
          jsonTask.audioUrl = audioUrl;
          jsonTask.items = listeningQuestions;
        } else if (taskType === "speaking" || taskType === "reading") {
          jsonTask.items = [];
        }

        formData.append("jsonTask", JSON.stringify(jsonTask));
      }

      await updateLesson({ id: lessonId, formData }).unwrap();
      success("Cập nhật bài học thành công!");
      router.push(`/admin/courses/${courseId}/lessons/${lessonId}`);
    } catch (error: any) {
      console.error("Error updating lesson:", error);
      const errorMessage = error?.data?.message || "Đã có lỗi xảy ra khi cập nhật bài học";
      setErrors({
        submit: errorMessage,
      });
      showError(errorMessage);
    }
  };

  const getTaskIcon = (type: TaskType) => {
    switch (type) {
      case "multiple_choice": return <ListChecks size={18} />;
      case "fill_blank": return <PenLine size={18} />;
      case "listening": return <Volume2 size={18} />;
      case "matching": return <Shuffle size={18} />;
      case "speaking": return <Mic size={18} />;
      case "reading": return <BookOpen size={18} />;
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.spinner} size={48} />
        <p>Đang tải...</p>
      </div>
    );
  }

  if (errors.fetch) {
    return (
      <div className={styles.errorContainer}>
        <AlertCircle size={48} />
        <p>{errors.fetch}</p>
        <button
          onClick={() => router.push(`/admin/courses/${courseId}/lessons/${lessonId}`)}
          className={styles.backBtn}
        >
          <ArrowLeft size={18} />
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button
          onClick={() => router.push(`/admin/courses/${courseId}/lessons/${lessonId}`)}
          className={styles.backBtn}
          disabled={isSubmitting}
        >
          <ArrowLeft size={18} />
          Quay lại
        </button>
        <h1 className={styles.title}>Chỉnh Sửa Bài Học</h1>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Lesson Type Switcher */}
        <div className={styles.typeSwitcher}>
          <button
            type="button"
            className={`${styles.typeBtn} ${lessonType === "video" ? styles.typeActive : ""}`}
            onClick={() => setLessonType("video")}
            disabled={isSubmitting}
          >
            <Video size={20} />
            <span>Bài Học Video</span>
          </button>
          <button
            type="button"
            className={`${styles.typeBtn} ${lessonType === "task" ? styles.typeActive : ""}`}
            onClick={() => setLessonType("task")}
            disabled={isSubmitting}
          >
            <ListChecks size={20} />
            <span>Bài Tập</span>
          </button>
        </div>

        {/* Title */}
        <div className={styles.formGroup}>
          <label htmlFor="title" className={styles.label}>
            <FileText size={18} />
            Tên bài học <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`${styles.input} ${errors.title ? styles.inputError : ""}`}
            placeholder="Nhập tên bài học..."
            disabled={isSubmitting}
          />
          {errors.title && <span className={styles.errorText}>{errors.title}</span>}
        </div>

        {/* Content */}
        <div className={styles.formGroup}>
          <label htmlFor="content" className={styles.label}>
            <FileText size={18} />
            Nội dung mô tả <span className={styles.required}>*</span>
          </label>
          <textarea
            id="content"
            name="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={`${styles.textarea} ${errors.content ? styles.inputError : ""}`}
            placeholder="Mô tả chi tiết nội dung bài học..."
            rows={6}
            disabled={isSubmitting}
          />
          {errors.content && <span className={styles.errorText}>{errors.content}</span>}
        </div>

        {/* VIDEO TYPE FIELDS */}
        {lessonType === "video" && (
          <div className={styles.videoSection}>
            <div className={styles.sectionHeader}>
              <Video size={20} />
              <h3>Cấu hình Video</h3>
            </div>

            {/* Video Type Toggle */}
            <div className={styles.videoTypeTabs}>
              <button
                type="button"
                className={`${styles.videoTypeBtn} ${videoType === "youtube" ? styles.active : ""}`}
                onClick={() => setVideoType("youtube")}
                disabled={isSubmitting}
              >
                YouTube URL
              </button>
              <button
                type="button"
                className={`${styles.videoTypeBtn} ${videoType === "upload" ? styles.active : ""}`}
                onClick={() => setVideoType("upload")}
                disabled={isSubmitting}
              >
                Upload Video
              </button>
            </div>

            {videoType === "youtube" ? (
              <div className={styles.formGroup}>
                <input
                  type="text"
                  value={videoUrl || ""}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className={`${styles.input} ${errors.video ? styles.inputError : ""}`}
                  placeholder="https://youtube.com/watch?v=..."
                  disabled={isSubmitting}
                />
                {errors.video && <span className={styles.errorText}>{errors.video}</span>}
              </div>
            ) : (
              <div className={styles.uploadArea}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoFileChange}
                  style={{ display: "none" }}
                />
                <button
                  type="button"
                  className={styles.uploadBtn}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting}
                >
                  <Upload size={20} />
                  {videoFile ? videoFile.name : videoUrl ? "Thay đổi video" : "Chọn file video"}
                </button>
                {errors.video && <span className={styles.errorText}>{errors.video}</span>}
              </div>
            )}
          </div>
        )}

        {/* TASK TYPE FIELDS */}
        {lessonType === "task" && (
          <div className={styles.taskSection}>
            <div className={styles.sectionHeader}>
              <Sparkles size={20} />
              <h3>Cấu hình Bài Tập</h3>
            </div>

            {/* Task Type Selection */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Loại bài tập <span className={styles.required}>*</span>
              </label>
              <div className={styles.taskTypeGrid}>
                {(["multiple_choice", "fill_blank", "listening", "matching", "speaking", "reading"] as TaskType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={`${styles.taskTypeCard} ${taskType === type ? styles.active : ""}`}
                    onClick={() => setTaskType(type)}
                    disabled={isSubmitting}
                  >
                    {getTaskIcon(type)}
                    <span>
                      {type === "multiple_choice" && "Trắc nghiệm"}
                      {type === "fill_blank" && "Điền từ"}
                      {type === "listening" && "Nghe hiểu"}
                      {type === "matching" && "Ghép cặp"}
                      {type === "speaking" && "Phát âm"}
                      {type === "reading" && "Đọc hiểu"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Task Instructions */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <AlertCircle size={18} />
                Hướng dẫn làm bài <span className={styles.required}>*</span>
              </label>
              <textarea
                value={taskInstructions || ""}
                onChange={(e) => setTaskInstructions(e.target.value)}
                className={`${styles.textarea} ${errors.taskInstructions ? styles.inputError : ""}`}
                placeholder="Hướng dẫn chi tiết cho học viên..."
                rows={3}
                disabled={isSubmitting}
              />
              {errors.taskInstructions && <span className={styles.errorText}>{errors.taskInstructions}</span>}
            </div>

            {/* MULTIPLE CHOICE */}
            {taskType === "multiple_choice" && (
              <div className={styles.questionsList}>
                <div className={styles.questionsHeader}>
                  <h4>Danh sách câu hỏi</h4>
                  <div className={styles.headerActions}>
                    <button
                      type="button"
                      className={`${styles.modeToggle} ${!isMultiAddMode ? styles.active : ''}`}
                      onClick={() => setIsMultiAddMode(false)}
                      disabled={isSubmitting}
                    >
                      Thêm từng câu
                    </button>
                    <button
                      type="button"
                      className={`${styles.modeToggle} ${isMultiAddMode ? styles.active : ''}`}
                      onClick={() => setIsMultiAddMode(true)}
                      disabled={isSubmitting}
                    >
                      Thêm nhiều câu
                    </button>
                  </div>
                </div>

                {isMultiAddMode ? (
                  <div className={styles.multiAddContainer}>
                    <div className={styles.formatGuide}>
                      <h5>📋 Định dạng:</h5>
                      <pre className={styles.formatExample}>{getMultiAddFormat()}</pre>
                      <p className={styles.aiTip}>
                        💡 <strong>Mẹo:</strong> Paste bài tập của bạn vào ChatGPT với prompt:
                        <em>"Hãy chuyển đổi các câu hỏi sau sang định dạng trên"</em> để tự động format!
                      </p>
                    </div>
                    <textarea
                      value={multiAddText || ""}
                      onChange={(e) => {
                        setMultiAddText(e.target.value);
                        setErrors(prev => ({ ...prev, multiAdd: "" }));
                      }}
                      className={styles.multiAddTextarea}
                      placeholder="Paste nội dung theo định dạng trên..."
                      rows={15}
                      disabled={isSubmitting}
                    />
                    {errors.multiAdd && <span className={styles.errorText}>{errors.multiAdd}</span>}
                    <div className={styles.multiAddActions}>
                      <button
                        type="button"
                        className={styles.cancelBtn}
                        onClick={() => {
                          setIsMultiAddMode(false);
                          setMultiAddText("");
                          setErrors(prev => ({ ...prev, multiAdd: "" }));
                        }}
                        disabled={isSubmitting}
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        className={styles.importBtn}
                        onClick={handleMultiAdd}
                        disabled={isSubmitting}
                      >
                        <Plus size={18} /> Import câu hỏi
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button type="button" className={styles.addBtn} onClick={addMcQuestion} disabled={isSubmitting}>
                      <Plus size={18} /> Thêm câu hỏi
                    </button>
                  </>
                )}

                {mcQuestions.map((q, qIdx) => (
                  <div key={q.id} className={styles.questionCard}>
                    <div className={styles.questionHeader}>
                      <span className={styles.questionNumber}>Câu {qIdx + 1}</span>
                      <button type="button" className={styles.removeBtn} onClick={() => removeMcQuestion(qIdx)} disabled={isSubmitting}>
                        <X size={18} />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={q.question || ""}
                      onChange={(e) => updateMcQuestion(qIdx, "question", e.target.value)}
                      className={styles.input}
                      placeholder="Nhập câu hỏi..."
                      disabled={isSubmitting}
                    />
                    <div className={styles.optionsList}>
                      {q.options.map((opt, optIdx) => (
                        <div key={opt.key} className={styles.optionRow}>
                          <span className={styles.optionKey}>{opt.key}</span>
                          <input
                            type="text"
                            value={opt.text || ""}
                            onChange={(e) => updateMcOption(qIdx, optIdx, e.target.value)}
                            className={styles.input}
                            placeholder="Nhập đáp án..."
                            disabled={isSubmitting}
                          />
                          {q.options.length > 2 && (
                            <button type="button" className={styles.removeOptBtn} onClick={() => removeMcOption(qIdx, optIdx)} disabled={isSubmitting}>
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button type="button" className={styles.addOptBtn} onClick={() => addMcOption(qIdx)} disabled={isSubmitting}>
                        <Plus size={16} /> Thêm đáp án
                      </button>
                    </div>
                    <div className={styles.answerRow}>
                      <label>Đáp án đúng:</label>
                      <select
                        value={q.answer || ""}
                        onChange={(e) => updateMcQuestion(qIdx, "answer", e.target.value)}
                        className={styles.select}
                        disabled={isSubmitting}
                      >
                        <option value="">-- Chọn --</option>
                        {q.options.map(opt => (
                          <option key={opt.key} value={opt.key}>{opt.key}</option>
                        ))}
                      </select>
                    </div>
                    <input
                      type="text"
                      value={q.explanation || ""}
                      onChange={(e) => updateMcQuestion(qIdx, "explanation", e.target.value)}
                      className={styles.input}
                      placeholder="Giải thích (tùy chọn)"
                      disabled={isSubmitting}
                    />
                  </div>
                ))}
                {errors.task && <span className={styles.errorText}>{errors.task}</span>}
              </div>
            )}

            {/* FILL BLANK */}
            {taskType === "fill_blank" && (
              <div className={styles.questionsList}>
                <div className={styles.questionsHeader}>
                  <h4>Danh sách câu điền từ</h4>
                  <div className={styles.headerActions}>
                    <button
                      type="button"
                      className={`${styles.modeToggle} ${!isMultiAddMode ? styles.active : ''}`}
                      onClick={() => setIsMultiAddMode(false)}
                      disabled={isSubmitting}
                    >
                      Thêm từng câu
                    </button>
                    <button
                      type="button"
                      className={`${styles.modeToggle} ${isMultiAddMode ? styles.active : ''}`}
                      onClick={() => setIsMultiAddMode(true)}
                      disabled={isSubmitting}
                    >
                      Thêm nhiều câu
                    </button>
                  </div>
                </div>

                {isMultiAddMode ? (
                  <div className={styles.multiAddContainer}>
                    <div className={styles.formatGuide}>
                      <h5>📋 Định dạng:</h5>
                      <pre className={styles.formatExample}>{getMultiAddFormat()}</pre>
                      <p className={styles.aiTip}>
                        💡 <strong>Mẹo:</strong> Paste bài tập của bạn vào ChatGPT với prompt:
                        <em>"Hãy chuyển đổi các câu sau sang định dạng trên"</em> để tự động format!
                      </p>
                    </div>
                    <textarea
                      value={multiAddText || ""}
                      onChange={(e) => {
                        setMultiAddText(e.target.value);
                        setErrors(prev => ({ ...prev, multiAdd: "" }));
                      }}
                      className={styles.multiAddTextarea}
                      placeholder="Paste nội dung theo định dạng trên..."
                      rows={15}
                      disabled={isSubmitting}
                    />
                    {errors.multiAdd && <span className={styles.errorText}>{errors.multiAdd}</span>}
                    <div className={styles.multiAddActions}>
                      <button
                        type="button"
                        className={styles.cancelBtn}
                        onClick={() => {
                          setIsMultiAddMode(false);
                          setMultiAddText("");
                          setErrors(prev => ({ ...prev, multiAdd: "" }));
                        }}
                        disabled={isSubmitting}
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        className={styles.importBtn}
                        onClick={handleMultiAdd}
                        disabled={isSubmitting}
                      >
                        <Plus size={18} /> Import câu
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button type="button" className={styles.addBtn} onClick={addFbItem} disabled={isSubmitting}>
                      <Plus size={18} /> Thêm câu
                    </button>
                  </>
                )}

                {fbItems.map((item, idx) => (
                  <div key={item.id} className={styles.questionCard}>
                    <div className={styles.questionHeader}>
                      <span className={styles.questionNumber}>Câu {idx + 1}</span>
                      <button type="button" className={styles.removeBtn} onClick={() => removeFbItem(idx)} disabled={isSubmitting}>
                        <X size={18} />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={item.sentence || ""}
                      onChange={(e) => updateFbItem(idx, "sentence", e.target.value)}
                      className={styles.input}
                      placeholder="Câu với chỗ trống (VD: まどを（　）ください。)"
                      disabled={isSubmitting}
                    />
                    <input
                      type="text"
                      value={item.answer || ""}
                      onChange={(e) => updateFbItem(idx, "answer", e.target.value)}
                      className={styles.input}
                      placeholder="Đáp án"
                      disabled={isSubmitting}
                    />
                    <div className={styles.hintsList}>
                      <label>Gợi ý:</label>
                      {item.hints.map((hint, hIdx) => (
                        <div key={hIdx} className={styles.hintRow}>
                          <input
                            type="text"
                            value={hint || ""}
                            onChange={(e) => updateFbHint(idx, hIdx, e.target.value)}
                            className={styles.input}
                            placeholder="Gợi ý..."
                            disabled={isSubmitting}
                          />
                          <button type="button" className={styles.removeOptBtn} onClick={() => removeFbHint(idx, hIdx)} disabled={isSubmitting}>
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                      <button type="button" className={styles.addOptBtn} onClick={() => addFbHint(idx)} disabled={isSubmitting}>
                        <Plus size={16} /> Thêm gợi ý
                      </button>
                    </div>
                  </div>
                ))}
                {errors.task && <span className={styles.errorText}>{errors.task}</span>}
              </div>
            )}

            {/* MATCHING */}
            {taskType === "matching" && (
              <div className={styles.questionsList}>
                <div className={styles.questionsHeader}>
                  <h4>Danh sách cặp ghép</h4>
                  <div className={styles.headerActions}>
                    <button
                      type="button"
                      className={`${styles.modeToggle} ${!isMultiAddMode ? styles.active : ''}`}
                      onClick={() => setIsMultiAddMode(false)}
                      disabled={isSubmitting}
                    >
                      Thêm từng cặp
                    </button>
                    <button
                      type="button"
                      className={`${styles.modeToggle} ${isMultiAddMode ? styles.active : ''}`}
                      onClick={() => setIsMultiAddMode(true)}
                      disabled={isSubmitting}
                    >
                      Thêm nhiều cặp
                    </button>
                  </div>
                </div>

                {isMultiAddMode ? (
                  <div className={styles.multiAddContainer}>
                    <div className={styles.formatGuide}>
                      <h5>📋 Định dạng:</h5>
                      <pre className={styles.formatExample}>{getMultiAddFormat()}</pre>
                      <p className={styles.aiTip}>
                        💡 <strong>Mẹo:</strong> Paste danh sách từ vựng vào ChatGPT với prompt:
                        <em>&quot;Hãy chuyển đổi sang định dạng: từ {'->'} nghĩa&quot;</em> để tự động format!
                      </p>
                    </div>
                    <textarea
                      value={multiAddText || ""}
                      onChange={(e) => {
                        setMultiAddText(e.target.value);
                        setErrors(prev => ({ ...prev, multiAdd: "" }));
                      }}
                      className={styles.multiAddTextarea}
                      placeholder="Paste nội dung theo định dạng trên..."
                      rows={15}
                      disabled={isSubmitting}
                    />
                    {errors.multiAdd && <span className={styles.errorText}>{errors.multiAdd}</span>}
                    <div className={styles.multiAddActions}>
                      <button
                        type="button"
                        className={styles.cancelBtn}
                        onClick={() => {
                          setIsMultiAddMode(false);
                          setMultiAddText("");
                          setErrors(prev => ({ ...prev, multiAdd: "" }));
                        }}
                        disabled={isSubmitting}
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        className={styles.importBtn}
                        onClick={handleMultiAdd}
                        disabled={isSubmitting}
                      >
                        <Plus size={18} /> Import cặp
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button type="button" className={styles.addBtn} onClick={addMatchingItem} disabled={isSubmitting}>
                      <Plus size={18} /> Thêm cặp
                    </button>
                  </>
                )}

                {matchingItems.map((item, idx) => (
                  <div key={idx} className={styles.matchingCard}>
                    <span className={styles.questionNumber}>{idx + 1}</span>
                    <input
                      type="text"
                      value={item.left || ""}
                      onChange={(e) => updateMatchingItem(idx, "left", e.target.value)}
                      className={styles.input}
                      placeholder="Từ/Cụm từ"
                      disabled={isSubmitting}
                    />
                    <span className={styles.matchArrow}>→</span>
                    <input
                      type="text"
                      value={item.right || ""}
                      onChange={(e) => updateMatchingItem(idx, "right", e.target.value)}
                      className={styles.input}
                      placeholder="Nghĩa/Giải thích"
                      disabled={isSubmitting}
                    />
                    <button type="button" className={styles.removeBtn} onClick={() => removeMatchingItem(idx)} disabled={isSubmitting}>
                      <X size={18} />
                    </button>
                  </div>
                ))}
                {errors.task && <span className={styles.errorText}>{errors.task}</span>}
              </div>
            )}

            {/* LISTENING */}
            {taskType === "listening" && (
              <>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <Volume2 size={18} />
                    URL Audio <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    value={audioUrl || ""}
                    onChange={(e) => setAudioUrl(e.target.value)}
                    className={`${styles.input} ${errors.audio ? styles.inputError : ""}`}
                    placeholder="https://cdn.example.com/audio/lesson.mp3"
                    disabled={isSubmitting}
                  />
                  {errors.audio && <span className={styles.errorText}>{errors.audio}</span>}
                </div>
                <div className={styles.questionsList}>
                  <div className={styles.questionsHeader}>
                    <h4>Câu hỏi nghe hiểu</h4>
                    <div className={styles.headerActions}>
                      <button
                        type="button"
                        className={`${styles.modeToggle} ${!isMultiAddMode ? styles.active : ''}`}
                        onClick={() => setIsMultiAddMode(false)}
                        disabled={isSubmitting}
                      >
                        Thêm từng câu
                      </button>
                      <button
                        type="button"
                        className={`${styles.modeToggle} ${isMultiAddMode ? styles.active : ''}`}
                        onClick={() => setIsMultiAddMode(true)}
                        disabled={isSubmitting}
                      >
                        Thêm nhiều câu
                      </button>
                    </div>
                  </div>

                  {isMultiAddMode ? (
                    <div className={styles.multiAddContainer}>
                      <div className={styles.formatGuide}>
                        <h5>📋 Định dạng:</h5>
                        <pre className={styles.formatExample}>{getMultiAddFormat()}</pre>
                        <p className={styles.aiTip}>
                          💡 <strong>Mẹo:</strong> Paste câu hỏi của bạn vào ChatGPT với prompt:
                          <em>"Hãy chuyển đổi sang định dạng trên"</em> để tự động format!
                        </p>
                      </div>
                      <textarea
                        value={multiAddText || ""}
                        onChange={(e) => {
                          setMultiAddText(e.target.value);
                          setErrors(prev => ({ ...prev, multiAdd: "" }));
                        }}
                        className={styles.multiAddTextarea}
                        placeholder="Paste nội dung theo định dạng trên..."
                        rows={15}
                        disabled={isSubmitting}
                      />
                      {errors.multiAdd && <span className={styles.errorText}>{errors.multiAdd}</span>}
                      <div className={styles.multiAddActions}>
                        <button
                          type="button"
                          className={styles.cancelBtn}
                          onClick={() => {
                            setIsMultiAddMode(false);
                            setMultiAddText("");
                            setErrors(prev => ({ ...prev, multiAdd: "" }));
                          }}
                          disabled={isSubmitting}
                        >
                          Hủy
                        </button>
                        <button
                          type="button"
                          className={styles.importBtn}
                          onClick={handleMultiAdd}
                          disabled={isSubmitting}
                        >
                          <Plus size={18} /> Import câu hỏi
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button type="button" className={styles.addBtn} onClick={addListeningQuestion} disabled={isSubmitting}>
                        <Plus size={18} /> Thêm câu hỏi
                      </button>
                    </>
                  )}

                  {listeningQuestions.map((q, qIdx) => (
                    <div key={q.id} className={styles.questionCard}>
                      <div className={styles.questionHeader}>
                        <span className={styles.questionNumber}>Câu {qIdx + 1}</span>
                        <button type="button" className={styles.removeBtn} onClick={() => removeListeningQuestion(qIdx)} disabled={isSubmitting}>
                          <X size={18} />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={q.question || ""}
                        onChange={(e) => updateListeningQuestion(qIdx, "question", e.target.value)}
                        className={styles.input}
                        placeholder="Nhập câu hỏi..."
                        disabled={isSubmitting}
                      />
                      <div className={styles.optionsList}>
                        {q.options.map((opt, optIdx) => (
                          <div key={opt.key} className={styles.optionRow}>
                            <span className={styles.optionKey}>{opt.key}</span>
                            <input
                              type="text"
                              value={opt.text || ""}
                              onChange={(e) => updateListeningOption(qIdx, optIdx, e.target.value)}
                              className={styles.input}
                              placeholder="Nhập đáp án..."
                              disabled={isSubmitting}
                            />
                            {q.options.length > 2 && (
                              <button type="button" className={styles.removeOptBtn} onClick={() => removeListeningOption(qIdx, optIdx)} disabled={isSubmitting}>
                                <X size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                        <button type="button" className={styles.addOptBtn} onClick={() => addListeningOption(qIdx)} disabled={isSubmitting}>
                          <Plus size={16} /> Thêm đáp án
                        </button>
                      </div>
                      <div className={styles.answerRow}>
                        <label>Đáp án đúng:</label>
                        <select
                          value={q.answer || ""}
                          onChange={(e) => updateListeningQuestion(qIdx, "answer", e.target.value)}
                          className={styles.select}
                          disabled={isSubmitting}
                        >
                          <option value="">-- Chọn --</option>
                          {q.options.map(opt => (
                            <option key={opt.key} value={opt.key}>{opt.key}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                  {errors.task && <span className={styles.errorText}>{errors.task}</span>}
                </div>
              </>
            )}

            {/* SPEAKING & READING Placeholder */}
            {(taskType === "speaking" || taskType === "reading") && (
              <div className={styles.placeholderBox}>
                <AlertCircle size={40} />
                <p>Tính năng đang phát triển</p>
                <span>Loại bài tập này sẽ sớm được hỗ trợ</span>
              </div>
            )}
          </div>
        )}

        {/* Submit Error */}
        {errors.submit && (
          <div className={styles.submitError}>{errors.submit}</div>
        )}

        {/* Actions */}
        <div className={styles.actions}>
          <button
            type="button"
            onClick={() => router.push(`/admin/courses/${courseId}/lessons/${lessonId}`)}
            className={styles.cancelBtn}
            disabled={isSubmitting}
          >
            Hủy
          </button>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={20} className={styles.spinner} />
                Đang cập nhật...
              </>
            ) : (
              <>
                <Save size={20} />
                Cập nhật bài học
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
