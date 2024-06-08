# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```

## Данные и типы данных, используемые в приложении

Товар

```ts
export interface IProduct {
  category: string;
  description: string;
  id: string;
  image: string;
  price: number;
  title: string;
}
```

Данные об оплате и доставке

```ts
export interface IOrderForm {
  payment: TPayment;
  address: string;
}
```

Контактные данные клиента

```ts
export interface IContactsForm {
  email: string;
  phone: string;
}
```

Полная информация о заказе

```ts
export interface IOrder extends IOrderForm, IContactsForm {
  total: number;
  items: string[];
}
```

Модель данных приложения

```ts
export interface IAppState {
  catalog: IProduct[];
  preview: string | null;
  order: IOrder | null;
}
```

Способы оплаты

```ts
export type TPayment = 'card' | 'cash';
```

Ошибки формы

```ts
export type FormErrors = Partial<Record<keyof IOrder, string>>
```

Тип для получения списка предметов с сервера (экспортируется из api.ts)

```ts
export type ApiListResponse<Type> = {
  total: number,
  items: Type[]
};
```

Результат заказа

```ts
export interface IOrderResult {
  id: string;
  total: number;
}
```

## Архитектура приложения

Код приложения разделён на слои согласно парадигме MVP:
- слой представления (View), отвечает за отображение данных на странице
- слой данных (Model), отвечает за хранение и изменение данных
- представитель (Presenter), отвечает за связь представления и данных.

### Базовый код

#### Класс `Api`
Отвечает за базовую логику отправки запросов.

Конструктор:
- `constructor(baseUrl: string, options: RequestInit = {})` - принимает базовую ссылку для запроса и опциональный объект настроек

Поля:
- `baseUrl: string` - базовая ссылка для запроса
- `options: RequestInit = {}` - опциональный объект настроек

Методы:
- `handleResponse(response: Response): Promise<object>` - обработать ответ
- `get(uri: string)` - отправить get-запрос и обработать ответ
- `post(uri: string, data: object, method: ApiPostMethods = 'POST')` - отправить post-запрос, передав в его тело объект данных и обработать ответ. В данном методе используется параметр `method`, использующий следующий тип данных:\
`export type ApiPostMethods = 'POST' | 'PUT' | 'DELETE';`

#### Класс `EventEmitter`
Брокер событий отвечает за работу с событиями в проекте.

Типы данных, используемые в классе:

- Название события
```ts
type EventName = string | RegExp
``` 
- Функция-обработчик
```ts
type Subscriber = Function
```
- Событие
```ts
type EmitterEvent = {
  eventName: string,
  data: unknown
};
```

Класс `EventEmitter` реализует интерфейс `IEvents`:
```ts
export interface IEvents {
  on<T extends object>(event: EventName, callback: (data: T) => void): void;
  emit<T extends object>(event: string, data?: T): void;
  trigger<T extends object>(event: string, context?: Partial<T>): (data: T) => void;
}
```

Поля:
- `_events: Map<EventName, Set<Subscriber>>` - коллекция событий

Методы:
- `on<T extends object>(eventName: EventName, callback: (event: T) => void)` - Установить обработчик на событие
- `off(eventName: EventName, callback: Subscriber)` - снять обработчик с события
- `emit<T extends object>(eventName: string, data?: T)` - инициировать событие с данными
- `onAll(callback: (event: EmitterEvent) => void)` - слушать все события
- `offAll()` - сбросить все обработчики
- `trigger<T extends object>(eventName: string, context?: Partial<T>)` - сделать коллбек триггер, генерирующий событие при вызове

### Слой данных

#### Класс `Model<T>`
Базовая модель, чтобы можно было отличить ее от простых объектов с данными.

Конструктор:
- `constructor(data: Partial<T>, protected events: IEvents)` - принимает объект данных и экземпляр класса `EventEmitter` для возможности инициации событий.

Поля:
- `events: IEvents` - экземпляр класса `EventEmitter`

Методы:
- `emitChanges(event: string, payload?: object)` - сообщает, что модель поменялась

#### Класс `AppState`
Модель данных приложения. Передаёт родительскому классу `Model` следующие настройки:
```ts
export interface IAppState {
  catalog: IProduct[];
  preview: string | null;
  order: IOrder | null;
}
```

Поля:
- `catalog: IProduct[]` - каталог товаров
- `order: IOrder` - объект с информацией о заказе и данными клиента
- `preview: string | null` - id товара, выбранного для просмотра в модальном окне
- `formErrors: FormErrors` - объект с ошибками формы

Методы:
- `addItem(id: string)` - добавить товар в корзину
- `removeItem(id: string)` - удалить товар из корзины
- `clearCart()` - очистить корзину
- `getTotal()` - получить суммарную стоимость корзины
- `setCatalog(items: IProduct[])` - установить предметы в каталог
- `setPreview(item: IProduct)` - установить предмет для превью
- `setOrderField(field: keyof IOrderForm, value: string)` - установить значение поля формы заказа в объекте заказа
- `setClientField(field: keyof IContactsForm, value: string)` - установить значение поля формы контактных данных в объекте заказа
- `validateOrder()` - проверить данные заказа

### Классы представления
Все классы представления отвечают за отображение внутри контейнера (DOM-элемента) переданных в них данных.

#### Класс `Component<T>`
Базовый абстрактный класс для всех классов представления.

Конструктор:
- `constructor(protected readonly container: HTMLElement)` - принимает корневой DOM-элемент

Поля:
- `container: HTMLElement` - корневой DOM-элемент

Методы:
- `toggleClass(element: HTMLElement, className: string, force?: boolean)` - переключить класс
- `setText(element: HTMLElement, value: unknown)` - установить текстовое содержимое
- `setDisabled(element: HTMLElement, state: boolean)` - сменить статус блокировки
- `setHidden(element: HTMLElement)` - скрыть
- `setVisible(element: HTMLElement)` - показать
- `setImage(element: HTMLImageElement, src: string, alt?: string)` - установить изображение с алтернативным текстом
- `render(data?: Partial<T>): HTMLElement` - вернуть корневой DOM-элемент

#### Класс `Modal`
Реализует модальное окно. Устанавливает слушатели для закрытия модального окна кликом по оверлею или кнопке закрытия.\
Передаёт базовому классу `Component` следующие настройки:
```ts
interface IModalData {
  content: HTMLElement;
}
```

Конструктор:
- `constructor(container: HTMLElement, protected events: IEvents)` - принимает корневой DOM-элемент модального окна и экземпляр класса `EventEmitter` для возможности инициации событий.

Поля:
- `_closeButton: HTMLButtonElement` - кнопка закрытия модального окна
- `_content: HTMLElement` - контент модального окна
- `events: IEvents` - брокер событий

Методы:
- `open()` - открыть модальное окно
- `close()` - закрыть модальное окно
- `render(data: IModalData): HTMLElement` - открыть окно и вернуть корневой DOM-элемент

Сеттеры:
- `set content(value: HTMLElement)` - устанавливает содержимое модального окна

#### Класс `Card`
Базовый класс для всех видов карточек товара. Устанавливает слушатели для задаваемых действий на кнопку или на корневой DOM-элемент.\
Передаёт родительскому классу `Component` следующие настройки:
```ts
interface ICard {
  title: string;
  price: string;
}
```

Конструктор:
- `constructor(container: HTMLElement, protected actions?: ICardActions)` - принимает корневой DOM-элемент и опциональный объект, реализующий интерфейс `ICardActions`:
```ts
interface ICardActions {
  onClick: (event: MouseEvent) => void;
}
```

Поля:
- `actions?: ICardActions` - опциональный объект действий при клике
- `_title: HTMLElement` - заголовок карточки
- `_price: HTMLElement ` - цена карточки
- `_button?: HTMLButtonElement` - кнопка карточки

Сеттеры:
- `set id(value: string)` - устанавливает дата-атрибут id корневому DOM-элементу
- `set title(value: string)` - устанавливает текст заголовка
- `set price (value: number)` - устанавливает цену.

Геттеры:
- `get id(): string` - возвращает дата-атрибут id корневого DOM-элемента или пустую строку
- `get title(): string` - возвращает текст заголовка или пустую строку
- `get price(): string` - возвращает текст цены или пустую строку

#### Класс `CatalogItem`
Отвечает за отображение карточки товара в каталоге. Расширяет класс `Card`.

Конструктор:
- `constructor(container: HTMLElement, actions?: ICardActions)` - принимает корневой DOM-элемент и опциональный объект, реализующий интерфейс `ICardActions`

Поля:
- `_category: HTMLElement` - категория карточки
- `_image: HTMLImageElement` - изображение карточки

Сеттеры:
- `set category(value: string)` - устанавливает текст и класс категории
- `set image(value: string)` - устанавливает изображение с альтернативным текстом

Геттеры:
- `get category(): string` - возвращает текст категории или пустую строку

#### Класс `PreviewItem`
Отвечает за отображение превью карточки. Расширяет класс `CatalogItem`.

Конструктор:
- `constructor(container: HTMLElement, actions?: ICardActions)` - принимает корневой DOM-элемент и опциональный объект, реализующий интерфейс `ICardActions`

Поля:
- `_description: HTMLElement` - описание карточки

Сеттеры:
- `set description(value: string)` - устанавливает текст описания
- `set buttonProperties(text: string, actions?: ICardActions)` - устанавливает текст кнопки и опционально меняет её функционал

#### Класс `CartItem`
Отвечает за отображение карточки в корзине. Расширяет класс `Card`.

Конструктор:
- `constructor(container: HTMLElement, actions?: ICardActions)` - принимает корневой DOM-элемент и опциональный объект, реализующий интерфейс `ICardActions`

Поля:
- `_itemIndex: HTMLElement` - индекс товара в корзине

Сеттеры:
- `set itemIndex(value: number)` - устанавливает индекс товара

#### Класс `Cart`
Отвечает за отображение корзины. Устанавливает слушатель на кнопку оформления заказа. Передаёт базовому классу `Component` следующие настройки:
```ts
interface ICartView {
  items: HTMLElement[];
  total: number;
}
```

Конструктор:
- `constructor(container: HTMLElement, protected events: EventEmitter)` - принимает корневой DOM-элемент и экземпляр класса `EventEmitter` для возможности инициации событий.

Поля:
- `events: EventEmitter` - экземпляр класса `EventEmitter`
- `_list: HTMLElement` - контейнер для DOM-элементов товаров
- `_total: HTMLElement` - суммарная стоимость заказа
- `_button: HTMLElement` - кнопка оформления заказа

Сеттеры:
- `set items(items: HTMLElement[])` - устанавливает товары в корзине. Если товаров нет, то кнопка оформления отключается.
- `set total(total: number)` - устанавливает текст цены

#### Класс `Form<T>`
Отвечает за отображение форм. Устанавливает слушатели на поля ввода и кнопку сабмита\
Передаёт базовому классу `Component` следующие настройки:
```ts
interface IFormState {
  valid: boolean;
  errors: string[];
}
```
- `constructor(protected container: HTMLFormElement, protected events: IEvents)` - Конструктор принимает корневой DOM-элемент и экземпляр класса `EventEmitter` для возможности инициации событий.

Поля:
- `container: HTMLFormElement` - корневой DOM-элемент
- `events: IEvents` - экземпляр класса `EventEmitter`
- `_submit` - DOM-элемент кнопки сабмита
- `_errors` - DOM-элемент ошибок формы

Методы:
- `onInputChange(field: keyof T, value: string)` - инициирует событие ввода в поле формы
- `render(state: Partial<T> & IFormState)` - возвращает корневой DOM-элемент

Сеттеры:
- `set valid(value: boolean)` - переключает активность кнопки сабмита
- `set errors(value: string)` - устанавливает текст ошибок формы

#### Класс `Order`
Отвечает за отображение формы с данными о заказе. Передаёт базовому классу `Form` следующие настройки:
```ts
interface IOrderForm {
  payment: TPayment;
  address: string;
}
```

- `constructor(container: HTMLFormElement, events: IEvents)` - Конструктор принимает корневой DOM-элемент и экземпляр класса `EventEmitter` для возможности инициации событий.

Сеттеры:
- `set payment(value: TPayment)` - выбрать кнопку способа платежа
- `set address(value: string)` - установить значение адреса доставки

#### Класс `Contacts`
Отвечает за отображение формы с контактными данными клиента. Передаёт базовому классу `Form` следующие настройки:
```ts
interface IContactsForm {
  email: string;
  phone: string;
}
```

- `constructor(container: HTMLFormElement, events: IEvents)` - Конструктор принимает корневой DOM-элемент и экземпляр класса `EventEmitter` для возможности инициации событий.

Сеттеры:
- `set email(value: string)` - установить значение email
- `set phone(value: string)` - установить значение номера телефона

#### Класс `Success`
Отвечает за отображение успешного результата заказа. Устанавливает слушатель на кнопку. Передаёт базовому классу `Component` следующие настройки:
```ts
interface ISuccess {
  total: number;
}
```

- `constructor(container: HTMLElement, actions: ISuccessActions)` - Конструктор принимает корневой DOM-элемент и объект действий, реализующий интерфейс `ISuccessActions`:
```ts
interface ISuccessActions {
  onClick: () => void;
}
```

Поля:
- `_close: HTMLElement` - кнопка закрытия
- `_description: HTMLElement` - описание

Сеттеры:
- `set description(value: number)` - устанавливает текст описания с суммой заказа

#### Класс `Page`
Отвечает за отображение компонентов представления на странице. Устанавливает слушатель на кнопку корзины. Передаёт базовому классу `Component` следующие настройки:
```ts
interface IPage {
  counter: number;
  catalog: HTMLElement[];
  locked: boolean;
}
```

- `constructor(container: HTMLElement, protected events: IEvents)` - Конструктор принимает корневой DOM-элемент и экземпляр класса `EventEmitter` для возможности инициации событий.

Поля:
- `events: IEvents` - экземпляр класса `EventEmitter`
- `_counter: HTMLElement` - счётчик товаров в корзине
- `_catalog: HTMLElement` - каталог
- `_wrapper: HTMLElement` - обёртка страницы
- `_cart: HTMLElement` - корзина

Сеттеры:
- `set counter(value: number)` - установить значение счётчика товаров в корзине
- `set catalog(items: HTMLElement[])` - устанавливает элементы в каталоге
- `set locked(value: boolean)` - переключает блокировку прокрутки страницы

### Слой коммуникации

#### Класс `AppAPI`
Отвечает за взаимодействие с бэкендом сервиса. Расширяет класс `Api` и реализует интерфейс `IAppAPI`:
```ts
export interface IAppAPI {
  getProductList: () => Promise<IProduct[]>;
  getProductItem: (id: string) => Promise<IProduct>;
  orderProducts: (order: IOrder) => Promise<IOrderResult>;
}
```

Конструктор:
- `constructor(cdn: string, baseUrl: string, options?: RequestInit)` - принимает CDN-URL, API-URL и опциональный объект настроек

Поля:
- `cdn: string` - CDN-URL

Методы:
- `getProductList(): Promise<IProduct[]>` - получить список товаров
- `getProductItem(id: string): Promise<IProduct>` - получить товар по id
- `orderProducts(order: IOrder): Promise<IOrderResult>` - отправить заказ на сервер и получить ответ

## Взаимодействие компонентов
Код, описывающий взаимодействие представления и данных между собой находится в файле `index.ts`, выполняющем роль презентера.\
Взаимодействие осуществляется за счет событий, генерируемых с помощью брокера событий и обработчиков этих событий, описанных в `index.ts`\
В `index.ts` сначала создаются экземпляры всех необходимых классов, а затем настраивается обработка событий.

*Список всех событий, которые могут генерироваться в системе:*\
*События изменения данных (генерируются классами моделями данных)*
- `items:changed` - изменение массива карточек
- `preview:changed` - изменилась карточка, открываемая в модальном окне
- `cart:changed` - товары в корзине изменились
- `formErrors:change` - изменилось состояние валидации формы

*События, возникающие при взаимодействии пользователя с интерфейсом (генерируются классами, отвечающими за представление)*
- `item:select` - выбор открываемой в модальном окне карточки
- `cart:open` - открыть модальное окно корзины
- `order:open` - открыть модальное окно с формой данных о заказе
- `contacts:open` - открыть модальное окно с формой контактных данных
- `order.payment:change` - изменился способ оплаты
- `order.address:change` - изменилось поле ввода адреса в форме заказа
- `contacts.email:change` - изменилось поле ввода email в форме контактных данных
- `contacts.phone:change` - изменилось поле ввода телефона в форме контактных данных
- `order:submit` - отправка формы с информацией о заказе
- `contacts:submit` - отправка формы контактной информации
- `item:add` - добавить товар в корзину
- `item:remove` - удалить товар из корзины
- `modal:open` - открыто модальное окно
- `modal:close` - закрыто модальное окно