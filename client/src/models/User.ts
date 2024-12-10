import type { Recipient } from './Recipient';

export interface User {
  username: string | null;
  email: string | null;
  password: string | null;
  recipientList: Recipient[];
  recipientCount: number;
}
