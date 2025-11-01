import { configureStore } from "@reduxjs/toolkit";
import languageReducer from "./slices/languageSlice";
import themeReducer from "./slices/themeSlice";
import authReducer from "./slices/authSlice";
import materialsReducer from "./slices/materialsSlice";
import materialCategoriesReducer from "./slices/materialCategoriesSlice";
import listingsReducer from "./slices/listingsSlice";
import listingPhotosReducer from "./slices/listingPhotosSlice";
import listingAttributesReducer from "./slices/listingAttributesSlice";
import bidsReducer from "./slices/bidsSlice";
import ordersReducer from "./slices/ordersSlice";
import paymentsReducer from "./slices/paymentsSlice";
import shipmentsReducer from "./slices/shipmentsSlice";
import countriesReducer from "./slices/countriesSlice";
import countrySettingsReducer from "./slices/countrySettingsSlice";
import localizationReducer from "./slices/localizationSlice";
import ticketsReducer from "./slices/ticketsSlice";
import chatReducer from "./slices/chatSlice";
import usersReducer from "./slices/usersSlice";
import companiesReducer from "./slices/companiesSlice";
import companyAddressesReducer from "./slices/companyAddressesSlice";
import userAddressesReducer from "./slices/userAddressesSlice";
import advertisementsReducer from "./slices/advertisementsSlice";

export const store = configureStore({
  reducer: {
    language: languageReducer,
    theme: themeReducer,
    auth: authReducer,
    materials: materialsReducer,
    materialCategories: materialCategoriesReducer,
    listings: listingsReducer,
    listingPhotos: listingPhotosReducer,
    listingAttributes: listingAttributesReducer,
    bids: bidsReducer,
    orders: ordersReducer,
    payments: paymentsReducer,
    shipments: shipmentsReducer,
    countries: countriesReducer,
    countrySettings: countrySettingsReducer,
    localization: localizationReducer,
    tickets: ticketsReducer,
    chat: chatReducer,
    users: usersReducer,
    companies: companiesReducer,
    companyAddresses: companyAddressesReducer,
    userAddresses: userAddressesReducer,
    advertisements: advertisementsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
