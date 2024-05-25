export interface IProduct {
  category: string;
  description: string;
  id: string;
  image: string;
  price: number;
  title: string;
}

export interface ICart {
  items: IProduct[];
  totalPrice: number;
  paymethod: TPaymethod;
  shippingAddress: string;
  email: string;
  phone: string;
  payStatus: boolean;
}

export interface IProductData {
  products: IProduct[];
  preview: string | null;
  addProduct(product: IProduct): void;
  removeProduct(id: string, payload: Function | null): void;
  updateProduct(product: IProduct, payload: Function | null): void;
  getProduct(id: string): IProduct;
}

export interface ICartData {
  items: IProduct[];
  totalPrice: number;
  addItem(item: IProduct): void;
  removeItem(id: string, payload: Function | null): void;
  getItem(id: string): IProduct;
  getPurchaseInfo(): TPurchaseInfo;
  setPurchaseInfo(data: TPurchaseInfo): void;
  getClientInfo(): TClientInfo;
  setClientInfo(data: TClientInfo): void;
  checkPurchaseValidation(data: Record<keyof TPurchaseInfo, string>): boolean;
  checkClientValidation(data: Record<keyof TClientInfo, string>): boolean;
}

export type TPaymethod = 'online' | 'reception';

export type TPurchaseInfo = Pick<ICart, 'paymethod' | 'shippingAddress'>;

export type TClientInfo = Pick<ICart, 'email' | 'phone'>;


