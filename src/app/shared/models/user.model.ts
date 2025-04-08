// Définir l'interface Rule
export interface Rule {
  id?: number;
  name: string;
  description?: string;
  // Ajoutez d'autres propriétés selon vos besoins
}

// Puis l'ajouter à l'interface User quand nécessaire
export interface User {
  userId?: number;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  userKey?: string;
  roles: string[];
  rule?: Rule; // Relation avec Rule (optionnelle)
}
