import { Component } from './base/Component';
import {
	bem,
	createElement,
	ensureElement,
	formatNumber,
} from '../utils/utils';

const categoryClasses = new Map<string, string>([
	['софт-скил', 'card__category_soft'],
	['хард-скил', 'card__category_hard'],
	['другое', 'card__category_other'],
	['дополнительное', 'card__category_additional'],
	['кнопка', 'card__category_button'],
]);

interface ICardActions {
	onClick: (event: MouseEvent) => void;
}

interface ICard {
	title: string;
	price: number;
	image?: string;
	category?: string;
	description?: string;
	itemIndex?: number;
}

export class Card extends Component<ICard> {
	protected _title: HTMLElement;
	protected _price: HTMLElement;
	protected _button?: HTMLButtonElement;

	constructor(container: HTMLElement, protected actions?: ICardActions) {
		super(container);

		this._title = ensureElement<HTMLElement>('.card__title', container);
		this._price = ensureElement<HTMLElement>('.card__price', container);
		this._button = container.querySelector('.card__button');

		if (this.actions?.onClick) {
			if (this._button) {
				this._button.addEventListener('click', this.actions.onClick);
			} else {
				container.addEventListener('click', this.actions.onClick);
			}
		}
	}

	set id(value: string) {
		this.container.dataset.id = value;
	}

	get id(): string {
		return this.container.dataset.id || '';
	}

	set title(value: string) {
		this.setText(this._title, value);
	}

	get title(): string {
		return this._title.textContent || '';
	}

	set price(value: number) {
		if (value) {
			this.setText(this._price, `${formatNumber(value)} синапсов`);
		} else {
			this.setText(this._price, 'Бесценно');
		}
	}
}

export class CatalogItem extends Card {
	protected _category: HTMLElement;
	protected _image: HTMLImageElement;

	constructor(container: HTMLElement, actions?: ICardActions) {
		super(container, actions);

		this._category = ensureElement<HTMLElement>('.card__category', container);
		this._image = ensureElement<HTMLImageElement>('.card__image', container);
	}


	set category(value: string) {
		this.setText(this._category, value);

		const categoryValues = Array.from(categoryClasses.values());

		// Если есть класс категории - удаляем, затем добавляем новый
		if (categoryClasses.get(value)) {
			this._category.classList.forEach((element) => {
				this.toggleClass(this._category, element, !categoryValues.includes(element));
			});

			this.toggleClass(this._category, categoryClasses.get(value), true);
		}
	}

	set image(value: string) {
		this.setImage(this._image, value, this.title);
	}

	get category(): string {
		return this._category.textContent || '';
	}
}

export class PreviewItem extends CatalogItem {
	protected _description: HTMLElement;

	constructor(container: HTMLElement, actions?: ICardActions) {
		super(container, actions);

		this._description = ensureElement<HTMLElement>('.card__text', container);
	}

	setButtonProperties(text: string, actions?: ICardActions) {
		this.setText(this._button, text);

		if (actions?.onClick) {
			if (this._button) {
				this._button.removeEventListener('click', this.actions.onClick);
				this._button.addEventListener('click', actions.onClick);
				this.actions = actions;
			} else {
				console.error('Кнопка не найдена');
			}
		}
	}

	set valid(value: boolean) {
		this.setDisabled(this._button, !value);
	}

	set description(value: string) {
		this.setText(this._description, value);
	}
}

export class CartItem extends Card {
	protected _itemIndex: HTMLElement;

	constructor(container: HTMLElement, actions?: ICardActions) {
		super(container, actions);

		this._itemIndex = ensureElement<HTMLElement>(
			'.basket__item-index',
			container
		);
	}

	set itemIndex(value: number) {
		this.setText(this._itemIndex, value);
	}
}
