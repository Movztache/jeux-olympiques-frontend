/**
 * Interface représentant un article d'actualité dans le système Vibe-Tickets
 */
export interface News {
  id?: number;
  title: string;
  description: string;
  author?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  // Propriétés alternatives pour DTO
  authorId?: number;
  authorName?: string;
  authorFirstName?: string;
  authorLastName?: string;
  authorEmail?: string;
  createdDate: string;
  updatedDate?: string;
  published: boolean;
  imageUrl?: string;
}

/**
 * Interface pour la création/modification d'un article
 */
export interface NewsCreateRequest {
  title: string;
  description: string;
  published: boolean;
  imageUrl?: string;
}

/**
 * Interface pour la réponse paginée des actualités
 */
export interface NewsPageResponse {
  content: News[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  numberOfElements: number;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  empty: boolean;
}

/**
 * Interface pour les paramètres de recherche d'actualités
 */
export interface NewsSearchParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  title?: string;
  authorId?: number;
  startDate?: string;
  endDate?: string;
}

/**
 * Interface pour les statistiques d'actualités (pour l'admin)
 */
export interface NewsStats {
  totalNews: number;
  publishedNews: number;
  draftNews: number;
  recentNews: number;
}

/**
 * Interface pour le DTO du backend (format potentiel)
 */
export interface NewsDTO {
  id?: number;
  title: string;
  description: string;
  // Peut contenir soit un objet author complet
  author?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  // Soit des propriétés séparées
  authorId?: number;
  authorName?: string;
  authorFirstName?: string;
  authorLastName?: string;
  authorEmail?: string;
  createdDate: string;
  updatedDate?: string;
  published: boolean;
  imageUrl?: string;
}
