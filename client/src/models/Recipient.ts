export interface Recipient {
  name: string;
  gender: string;
  age: number;
  gifts:
    | {
        name: string;
        query: string;
        price: number;
        url: string;
        image: string;
      }[]
    | undefined;
  recipientId: string;
  budget: number;
  status: boolean;
}
