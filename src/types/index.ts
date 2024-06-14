export interface IProduct {
  category: string;
  description: string;
  id: string;
  image: string;
  price: number;
  title: string;
}

export interface IOrderForm {
  payment: TPayment;
  address: string;
}

export interface IContactsForm {
  email: string;
  phone: string;
}

export interface IOrder extends IOrderForm, IContactsForm {
  total: number;
  items: string[];
}

export interface IAppState {
  catalog: IProduct[];
  preview: string | null;
  order: IOrder | null;
}

export type TPayment = 'card' | 'cash';

export type FormErrors = Partial<Record<keyof IOrder, string>>

export interface IOrderResult {
  id: string;
  total: number;
}
