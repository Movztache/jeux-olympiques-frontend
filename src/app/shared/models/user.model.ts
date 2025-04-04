export interface User {
  userId?: number;
  firstName: string;
  lastName: string;
  email: string;
  password?: string; // Optionnel car sensible
  userKey?: string;
  // Nous n'incluons pas les relations (carts, logs, reservations, rule) pour l'instant
  // On pourra les ajouter selon les besoins

}
