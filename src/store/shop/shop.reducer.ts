import {Network} from '../../constants';
import {APP_NETWORK} from '../../constants/config';
import {
  CardConfigMap,
  CategoriesAndCurations,
  DirectIntegrationMap,
  GiftCard,
  PhoneCountryInfo,
  UnsoldGiftCard,
} from './shop.models';
import {ShopActionType, ShopActionTypes} from './shop.types';

type ShopReduxPersistBlackList = [];
export const shopReduxPersistBlackList: ShopReduxPersistBlackList = [];

export interface ShopState {
  availableCardMap: CardConfigMap;
  supportedCardMap: CardConfigMap;
  categoriesAndCurations: CategoriesAndCurations;
  integrations: DirectIntegrationMap;
  email: string;
  phone: string;
  phoneCountryInfo: PhoneCountryInfo;
  giftCards: {
    [key in Network]: (GiftCard | UnsoldGiftCard)[];
  };
}

export const initialShopState: ShopState = {
  availableCardMap: {},
  supportedCardMap: {},
  categoriesAndCurations: {curated: {}, categories: {}},
  integrations: {},
  email: '',
  phone: '',
  phoneCountryInfo: {
    phoneCountryCode: '',
    countryIsoCode: '',
  },
  giftCards: {
    [Network.mainnet]: [],
    [Network.testnet]: [],
  },
};

export const shopReducer = (
  state: ShopState = initialShopState,
  action: ShopActionType,
): ShopState => {
  switch (action.type) {
    case ShopActionTypes.SUCCESS_FETCH_CATALOG:
      const {availableCardMap, categoriesAndCurations, integrations} =
        action.payload;
      const supportedCardMap = {
        ...(state.supportedCardMap || {}),
        ...availableCardMap,
      };
      return {
        ...state,
        availableCardMap,
        supportedCardMap,
        categoriesAndCurations,
        integrations,
      };
    case ShopActionTypes.INITIALIZED_UNSOLD_GIFT_CARD:
      const {giftCard} = action.payload;
      return {
        ...state,
        giftCards: {
          ...state.giftCards,
          [APP_NETWORK]: state.giftCards[APP_NETWORK].concat(giftCard),
        },
      };
    case ShopActionTypes.SET_PURCHASED_GIFT_CARDS:
      const {giftCards} = action.payload;
      return {
        ...state,
        giftCards: {
          ...state.giftCards,
          [APP_NETWORK]: giftCards,
        },
      };
    case ShopActionTypes.DELETED_UNSOLD_GIFT_CARDS:
      return {
        ...state,
        giftCards: {
          ...state.giftCards,
          [APP_NETWORK]: state.giftCards[APP_NETWORK].filter(
            card => card.status !== 'UNREDEEMED',
          ),
        },
      };
    case ShopActionTypes.REDEEMED_GIFT_CARD:
      const {giftCard: redeemedGiftCard} = action.payload;
      return {
        ...state,
        giftCards: {
          ...state.giftCards,
          [APP_NETWORK]: state.giftCards[APP_NETWORK].map(card =>
            card.invoiceId === redeemedGiftCard.invoiceId
              ? {...card, ...redeemedGiftCard}
              : card,
          ),
        },
      };
    case ShopActionTypes.TOGGLED_GIFT_CARD_ARCHIVED_STATUS:
      const {giftCard: archivableGiftCard} = action.payload;
      return {
        ...state,
        giftCards: {
          ...state.giftCards,
          [APP_NETWORK]: state.giftCards[APP_NETWORK].map(card =>
            card.invoiceId === archivableGiftCard.invoiceId
              ? {...card, archived: !archivableGiftCard.archived}
              : card,
          ),
        },
      };
    case ShopActionTypes.UPDATED_EMAIL_ADDRESS:
      const {email} = action.payload;
      return {
        ...state,
        email,
      };
    case ShopActionTypes.UPDATED_GIFT_CARD_STATUS:
      const {invoiceId: invoiceIdToUpdate, status} = action.payload;
      return {
        ...state,
        giftCards: {
          ...state.giftCards,
          [APP_NETWORK]: state.giftCards[APP_NETWORK].map(card =>
            card.invoiceId === invoiceIdToUpdate ? {...card, status} : card,
          ),
        },
      };
    case ShopActionTypes.UPDATED_PHONE:
      const {phone, phoneCountryInfo} = action.payload;
      return {
        ...state,
        phone,
        phoneCountryInfo,
      };
    case ShopActionTypes.CLEARED_GIFT_CARDS:
      return {
        ...state,
        giftCards: {
          [Network.mainnet]: [],
          [Network.testnet]: [],
        },
      };

    default:
      return state;
  }
};
