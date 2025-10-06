// Types cho Flashcard và FlashList - Đã move xuống dưới

export interface IUser {
  _id: string;
  fullname: string;
  username: string;
  avatar?: string;
}

export interface IFlashList {
  _id: string;
  user: IUser | string;
  isPublic: boolean;
  title: string;
  level: "N5" | "N4" | "N3" | "N2" | "N1";
  description: string;
  thumbnail: string;
  ratings: Array<{
    user: string;
    rating: number;
  }>;
  averageRating?: number;
  flashcards: IFlashCard[] | string[];
  createdAt: string;
  updatedAt: string;
}

export interface GetAllFlashListsResponse {
  success: boolean;
  message: string;
  data: {
    publicLists: IFlashList[];
    myLists: IFlashList[];
    pagination: {
      currentPage: number;
      limit: number;
      totalPublic: number;
      totalMy: number;
      totalPublicPages: number;
      totalMyPages: number;
    };
  };
  timestamp: string;
}

export interface GetFlashListByIdResponse {
  success: boolean;
  message: string;
  data: IFlashList;
  timestamp: string;
}

export interface CreateFlashListRequest {
  title: string;
  isPublic?: boolean;
  level?: "N5" | "N4" | "N3" | "N2" | "N1";
  description?: string;
  thumbnail?: File;
  flashcards?: string[]; // Array of FlashCard IDs
}

export interface CreateFlashListResponse {
  success: boolean;
  message: string;
  data: IFlashList;
  timestamp: string;
}

export interface UpdateFlashListRequest {
  title?: string;
  isPublic?: boolean;
  level?: "N5" | "N4" | "N3" | "N2" | "N1";
  thumbnail?: string;
}

export interface DeleteFlashListResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

export interface RateFlashListRequest {
  rating: number;
}

export interface RateFlashListResponse {
  success: boolean;
  message: string;
  data: IFlashList;
  timestamp: string;
}

export interface SearchFlashListParams {
  q: string;
  level?: "N5" | "N4" | "N3" | "N2" | "N1" | "all";
  select?: "me" | "other" | "all";
  page?: number;
  limit?: number;
}

export interface SearchFlashListResponse {
  success: boolean;
  message: string;
  data: {
    results: IFlashList[];
    pagination: {
      currentPage: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  timestamp: string;
}

// FlashCard Types
export interface IFlashCardItem {
  vocabulary: string;
  meaning: string;
}

export interface IFlashCard {
  _id: string;
  name: string;
  cards: IFlashCardItem[];
  user: IUser | string;
  isPublic: boolean;
  thumbnail?: string;
  description: string;
  level: "N5" | "N4" | "N3" | "N2" | "N1";
  createdAt: string;
  updatedAt: string;
}

export interface GetAllFlashCardsResponse {
  success: boolean;
  message: string;
  data: {
    flashCards: IFlashCard[];
    pagination: {
      currentPage: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  timestamp: string;
}

export interface SearchFlashCardParams {
  q: string;
  level?: "N5" | "N4" | "N3" | "N2" | "N1" | "all";
  select?: "me" | "other" | "all";
  page?: number;
  limit?: number;
}

export interface SearchFlashCardResponse {
  success: boolean;
  message: string;
  data: {
    results: IFlashCard[];
    pagination: {
      currentPage: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  timestamp: string;
}

export interface CreateFlashCardRequest {
  name: string;
  cards: IFlashCardItem[];
  isPublic?: boolean;
  description?: string;
  level?: "N5" | "N4" | "N3" | "N2" | "N1";
  thumbnail?: File;
}

export interface CreateFlashCardResponse {
  success: boolean;
  message: string;
  data: IFlashCard;
  timestamp: string;
}
