
import data from './quotes-wisdom-from-the-wilderness.json';

export interface Quote {
  id: string;
  quote: string;
}

export const quotes: Quote[] = data;
