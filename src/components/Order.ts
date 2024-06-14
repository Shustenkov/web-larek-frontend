import { IOrderForm, TPayment } from "../types";
import { IEvents } from "./base/events";
import { Form } from "./common/Form";

export class Order extends Form<IOrderForm> {
  constructor(container: HTMLFormElement, events: IEvents) {
    super(container, events);
    
    Array.from(this.container.querySelector('.order__buttons').children).forEach((element) => {
      element.addEventListener('click', () => {
        if (!element.classList.contains('button_alt-active')) {
          Array.from(this.container.querySelector('.order__buttons').children).forEach((item) => {
            item.classList.remove('button_alt-active');
          });
          element.classList.add('button_alt-active');
          this.events.emit('order.payment:change', {field: 'payment', value: (element as HTMLButtonElement).name});
        }
      });
    });
  }

  set payment(value: TPayment) {
    if (value) {
      (this.container.elements.namedItem(value) as HTMLButtonElement).click();
    } else {
      Array.from(this.container.querySelector('.order__buttons').children).forEach((item) => {
        item.classList.remove('button_alt-active');
      });
    }
  }
  
  set address(value: string) {
    (this.container.elements.namedItem('address') as HTMLInputElement).value = value;
  }
}
