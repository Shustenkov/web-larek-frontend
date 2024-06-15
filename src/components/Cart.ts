import { createElement, ensureElement, formatNumber } from '../utils/utils';
import { Component } from './base/Component';
import { EventEmitter } from './base/Events';

interface ICartView {
	items: HTMLElement[];
	total: number;
}

export class Cart extends Component<ICartView> {
	protected _list: HTMLElement;
	protected _total: HTMLElement;
	protected _button: HTMLButtonElement;

	constructor(container: HTMLElement, protected events: EventEmitter) {
		super(container);

		this._list = ensureElement<HTMLElement>('.basket__list', this.container);
		this._total = this.container.querySelector('.basket__price');
		this._button = this.container.querySelector('.basket__button');

		if (this._button) {
			this._button.addEventListener('click', () => {
				events.emit('order:open');
			});
		}
	}

	set valid(value: boolean) {
		this.setDisabled(this._button, !value);
	}

	set items(items: HTMLElement[]) {
		this._list.replaceChildren(...items);
	}

	set total(total: number) {
    this.setText(this._total, `${formatNumber(total)} синапсов`);
  }
}
