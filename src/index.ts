import './scss/styles.scss';
import { EventEmitter } from './components/base/events';
import { API_URL, CDN_URL } from './utils/constants';
import { AppAPI } from './components/AppAPI';
import { cloneTemplate, createElement, ensureElement } from './utils/utils';
import { AppState } from './components/AppData';
import { Page } from './components/Page';
import { Modal } from './components/common/Modal';
import { Cart } from './components/common/Cart';
import { Order } from './components/Order';
import { Contacts } from './components/Contacts';
import { CartItem, CatalogItem, PreviewItem } from './components/Card';
import { IContactsForm, IOrderForm, IProduct } from './types';
import { Success } from './components/common/Success';

const events = new EventEmitter();
const api = new AppAPI(CDN_URL, API_URL);

// Чтобы мониторить все события, для отладки
events.onAll(({ eventName, data }) => {
  console.log(eventName, data);
});

// Все шаблоны
const successTemplate = ensureElement<HTMLTemplateElement>('#success');
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardCartTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const cartTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');

// Модель данных приложения
const appData = new AppState({}, events);

// Глобальные контейнеры
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

// Переиспользуемые части интерфейса
const cart = new Cart(cloneTemplate(cartTemplate), events);
const order = new Order(cloneTemplate(orderTemplate), events);
const contacts = new Contacts(cloneTemplate(contactsTemplate), events);

// Дальше идет бизнес-логика
// Поймали событие, сделали что нужно

// Изменились элементы каталога
events.on('items:changed', () => {
  page.catalog = appData.catalog.map(item => {
    const card = new CatalogItem(cloneTemplate(cardCatalogTemplate), {
      onClick: () => events.emit('item:select', item)
    });
    return card.render({
      title: item.title,
      price: item.price,
      image: item.image,
      category: item.category
    });
  });
});

// Отправлена форма заказа
events.on('order:submit', () => {
  events.emit('contacts:open');
});

// Отправлена форма контактных данных
events.on('contacts:submit', () => {
  api.orderProducts(appData.order)
    .then((result) => {
      const success = new Success(cloneTemplate(successTemplate), {
        onClick: () => {
          modal.close();
          appData.clearCart();
        }
      });
      modal.render({
        content: success.render({
          description: appData.order.total
        })
      });
    })
    .catch(err => {
      console.error(err);
    });
});

// Изменилось состояние валидации формы
events.on('formErrors:change', (errors: Partial<IOrderForm & IContactsForm>) => {
  const { payment, address, email, phone } = errors;
  order.valid = !payment && !address;
  contacts.valid = !email && !phone;
  order.errors = Object.values({payment, address}).filter(i => !!i).join('; ');
  contacts.errors = Object.values({email, phone}).filter(i => !!i).join('; ');
});

// Изменилось одно из полей формы заказа
events.on(/^order\..*:change/, (data: { field: keyof IOrderForm, value: string }) => {
  appData.setOrderField(data.field, data.value);
});

// Изменилось одно из полей формы контактных данных
events.on(/^contacts\..*:change/, (data: { field: keyof IContactsForm, value: string }) => {
  appData.setClientField(data.field, data.value);
});

// Открыть форму заказа
events.on('order:open', () => {
  modal.render({
    content: order.render({
      payment: undefined,
      address: '',
      valid: false,
      errors: []
    })
  });
  appData.order.payment = undefined;
  appData.order.address = '';
});

// Открыть форму контактных данных
events.on('contacts:open', () => {
  modal.render({
    content: contacts.render({
      email: '',
      phone: '',
      valid: false,
      errors: []
    })
  });
  appData.order.email = '';
  appData.order.phone = '';
});

// Открыть корзину
events.on('cart:open', () => {
  modal.render({content: cart.render()});
});

// Изменения в корзине
events.on('cart:changed', () => {
  cart.valid = !(appData.order.items.length === 0);
  page.counter = appData.order.items.length;
  appData.order.total = appData.order.items.map(element => appData.catalog.find(item => item.id === element)).reduce(
    (accumulator, currentValue) => accumulator + currentValue.price, 0
  );

  cart.items = appData.order.items.map(element => appData.catalog.find(item => item.id === element)).map(item => {
    const card = new CartItem(cloneTemplate(cardCartTemplate), {
      onClick: () => events.emit('item:remove', item)
    });
    return card.render({
      itemIndex: appData.order.items.findIndex(element => element === item.id) + 1,
      title: item.title,
      price: item.price
    });
  });
  cart.total = appData.order.total;
});

// Открыть карточку
events.on('item:select', (item: IProduct) => {
  appData.setPreview(item);
});

// Изменена карточка для превью
events.on('preview:changed', (item: IProduct) => {
  const card = new PreviewItem(cloneTemplate(cardPreviewTemplate), {
    onClick: () => events.emit('item:add', item)
  });
  card.valid = item.price != null;
  if (appData.order.items.includes(item.id)) {
    card.setButtonProperties('Удалить из корзины', {onClick: () => {
      events.emit('item:remove', item);
      events.emit('preview:changed', item);
    }});
  }
  modal.render({
    content: card.render({
      category: item.category,
      title: item.title,
      price: item.price,
      description: item.description,
      image: item.image,
    })
  });
});

// Добавлен предмет в корзину
events.on('item:add', (item: IProduct) => {
  appData.addItem(item.id);
  modal.close();
});

// Удалён предмет из корзины
events.on('item:remove', (item: IProduct) => {
  appData.removeItem(item.id);
});

// Блокируем прокрутку страницы если открыта модалка
events.on('modal:open', () => {
  page.locked = true;
});

// ... и разблокируем
events.on('modal:close', () => {
  page.locked = false;
});

// Получаем товары с сервера
api.getProductList()
  .then(appData.setCatalog.bind(appData))
  .catch(err => {
    console.error(err);
  });
