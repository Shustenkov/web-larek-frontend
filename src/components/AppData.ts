import { FormErrors, IAppState, IContactsForm, IOrder, IOrderForm, IProduct, TPayment } from "../types";
import { CatalogItem } from "./Card";
import { Model } from "./base/Model";

export class AppState extends Model<IAppState> {
  catalog: IProduct[];
  order: IOrder = {
    payment: undefined,
    email: '',
    phone: '',
    address: '',
    total: 0,
    items: []
  };
  preview: string | null;
  formErrors: FormErrors;

  addItem(id: string) {
    this.order.items.push(id);
    this.emitChanges('cart:changed');
  }

  removeItem(id: string) {
    this.order.items = this.order.items.filter(item => item != id);
    this.emitChanges('cart:changed');
  }

  clearCart() {
    this.order.items = [];
    this.emitChanges('cart:changed');
  }

  setCatalog(items: IProduct[]) {
    this.catalog = items;
    this.emitChanges('items:changed', {catalog: this.catalog});
  }

  setPreview(item: IProduct) {
    this.preview = item.id;
    this.emitChanges('preview:changed', item);
  }

  setOrderField(field: keyof IOrderForm, value: string) {
    if (field != 'payment') {
      this.order[field] = value;
    } else {
      this.order[field] = value as TPayment;
    }

    this.validateOrder();
  }

  setClientField(field: keyof IContactsForm, value: string) {
    this.order[field] = value;
    this.validateOrder();
  }

  validateOrder() {
    const errors: typeof this.formErrors = {};
    if (!this.order.payment) {
      errors.payment = 'Необходимо выбрать способ оплаты'
    }
    if (!this.order.email) {
      errors.email = 'Необходимо указать email'
    }
    if (!this.order.phone) {
      errors.phone = 'Необходимо указать телефон'
    }
    if (!this.order.address) {
      errors.address = 'Необходимо указать адрес'
    }
    this.formErrors = errors;
    this.events.emit('formErrors:change', this.formErrors);
    return Object.keys(errors).length === 0;
  }
}
