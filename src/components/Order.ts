import { IOrderForm, TPayment } from "../types";
import { ensureElement } from "../utils/utils";
import { IEvents } from "./base/Events";
import { Form } from "./common/Form";

export class Order extends Form<IOrderForm> {
  protected _buttonCard: HTMLButtonElement;
  protected _buttonCash: HTMLButtonElement;

  constructor(container: HTMLFormElement, events: IEvents) {
    super(container, events);

    this._buttonCard = ensureElement<HTMLButtonElement>('button[name="card"]', this.container);
    this._buttonCash = ensureElement<HTMLButtonElement>('button[name="cash"]', this.container);

    this._buttonCard.addEventListener('click', () => {
      if (!this._buttonCard.classList.contains('button_alt-active')) {
        this.toggleCard();
        this.toggleCash(false);
        this.events.emit('order.payment:change', {field: 'payment', value: 'card'});
      }
    });

    this._buttonCash.addEventListener('click', () => {
      if (!this._buttonCash.classList.contains('button_alt-active')) {
        this.toggleCash();
        this.toggleCard(false);
        this.events.emit('order.payment:change', {field: 'payment', value: 'cash'});
      }
    });
  }

  set payment(value: TPayment) {
    if (value) {
      (this.container.elements.namedItem(value) as HTMLButtonElement).click();
    } else {
      this.toggleCard(false);
      this.toggleCash(false);
    }
  }
  
  set address(value: string) {
    (this.container.elements.namedItem('address') as HTMLInputElement).value = value;
  }

  toggleCard(state: boolean = true) {
    this.toggleClass(this._buttonCard, 'button_alt-active', state);
  }

  toggleCash(state: boolean = true) {
    this.toggleClass(this._buttonCash, 'button_alt-active', state);
  } 
}
