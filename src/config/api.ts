export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://72.61.112.229:3000",
  ENDPOINTS: {
    AUTH: {
      LOGIN: "/auth/login",
      REGISTER_USER: "/auth/register/user",
      REGISTER_COMPANY: "/auth/register/company",
      ME: "/auth/me",
      REQUEST_OTP: "/auth/request-otp",
    },
    MATERIALS: {
      BASE: "/materials",
      LIST: "/materials",
      DETAIL: (id: string) => `/materials/${id}`,
      ADD_FAVORITE: (id: string) => `/materials/${id}/favorite`,
      GET_FAVORITES: "/materials/favorites",
      REMOVE_FAVORITE: (id: string) => `/materials/${id}/favorite`,
    },
    MATERIAL_CATEGORIES: {
      BASE: "/material-categories",
      LIST: "/material-categories",
      DETAIL: (id: string) => `/material-categories/${id}`,
    },
    LISTINGS: {
      BASE: "/listings",
      LIST: "/listings",
      DETAIL: (id: string) => `/listings/${id}`,
    },
    LISTING_PHOTOS: {
      BASE: "/listings/photos",
      GET_BY_LISTING: (listingId: string) => `/listings/${listingId}/photos`,
      SET_PRIMARY: (id: string) => `/listings/photos/${id}/primary`,
      DETAIL: (id: string) => `/listings/photos/${id}`,
    },
    LISTING_ATTRIBUTES: {
      BASE: "/listings/attributes",
      GET_BY_LISTING: (listingId: string) =>
        `/listings/${listingId}/attributes`,
      DETAIL: (id: string) => `/listings/attributes/${id}`,
    },
    BIDS: {
      BASE: "/bids",
      GET_BY_LISTING: (listingId: string) => `/bids/listing/${listingId}`,
      DETAIL: (id: string) => `/bids/${id}`,
    },
    ORDERS: {
      BASE: "/orders",
      LIST: "/orders",
      DETAIL: (id: string) => `/orders/${id}`,
      UPDATE_STATUS: (id: string, status: string) =>
        `/orders/${id}/status/${status}`,
    },
    PAYMENTS: {
      BASE: "/payments",
      GET_BY_ORDER: (orderId: string) => `/payments/order/${orderId}`,
      UPDATE_STATUS: (id: string, status: string) =>
        `/payments/${id}/status/${status}`,
      DETAIL: (id: string) => `/payments/${id}`,
      THAWANI_CHECKOUT: (orderId: string) =>
        `/payments/thawani/${orderId}/checkout`,
      THAWANI_WEBHOOK: "/payments/thawani/webhook",
      EDFAPAY_CHECKOUT: (orderId: string) =>
        `/payments/edfapay/${orderId}/checkout`,
      EDFAPAY_WEBHOOK: "/payments/edfapay/webhook",
    },
    SHIPMENTS: {
      BASE: "/shipments",
      GET_BY_ORDER: (orderId: string) => `/shipments/order/${orderId}`,
      DETAIL: (id: string) => `/shipments/${id}`,
    },
    USERS: {
      BASE: "/users",
      LIST: "/users",
      DETAIL: (id: string) => `/users/${id}`,
    },
    COMPANIES: {
      BASE: "/companies",
      LIST: "/companies",
      DETAIL: (id: string) => `/companies/${id}`,
    },
    COMPANY_ADDRESSES: {
      BASE: "/company-addresses",
      GET_BY_COMPANY: (companyId: string) =>
        `/company-addresses/company/${companyId}`,
      DETAIL: (id: string) => `/company-addresses/${id}`,
    },
    USER_ADDRESSES: {
      BASE: "/user-addresses",
      GET_BY_USER: (userId: string) => `/user-addresses/user/${userId}`,
      DETAIL: (id: string) => `/user-addresses/${id}`,
    },
    COUNTRIES: {
      BASE: "/countries",
      LIST: "/countries",
      DETAIL: (id: string) => `/countries/${id}`,
    },
    COUNTRY_SETTINGS: {
      BASE: "/country-settings",
      GET_BY_COUNTRY: (countryId: string) => `/country-settings/${countryId}`,
      DETAIL: (id: string) => `/country-settings/${id}`,
    },
    LOCALIZATION: {
      KEYS_BASE: "/localization/keys",
      KEYS_LIST: "/localization/keys",
      KEY_DETAIL: (id: string) => `/localization/keys/${id}`,
      TRANSLATE: "/localization/translate",
      GET_BY_LANG: (languageCode: string) =>
        `/localization/lang/${languageCode}`,
    },
    TICKETS: {
      BASE: "/tickets",
      LIST: "/tickets",
      DETAIL: (id: string) => `/tickets/${id}`,
      UPDATE_STATUS: (id: string) => `/tickets/${id}/status`,
      ASSIGN: "/tickets/assign",
      ADD_MESSAGE: "/tickets/message",
      GET_MESSAGES: (id: string) => `/tickets/${id}/messages`,
    },
    CHAT: {
      BASE: "/chat",
      GET_BY_USER: (userId: string) => `/chat/user/${userId}`,
      UPDATE_STATUS: (chatId: string) => `/chat/${chatId}/status`,
      ADD_MESSAGE: "/chat/message",
      GET_MESSAGES: (chatId: string) => `/chat/${chatId}/messages`,
    },
    ADVERTISEMENTS: {
      BASE: "/advertisements",
      LIST: "/advertisements",
      DETAIL: (id: string) => `/advertisements/${id}`,
      TOGGLE_ACTIVE: (id: string) => `/advertisements/${id}/toggle-active`,
    },
    NOTIFICATIONS: {
      BASE: "/notifications",
      LIST: "/notifications",
      MARK_READ: (id: string) => `/notifications/${id}/read`,
      MARK_ALL_READ: "/notifications/read-all",
    },
    UPLOADS: {
      IMAGE: "/uploads/image",
      FILE: "/uploads/file",
    },
  },
} as const;
