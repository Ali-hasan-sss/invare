/**
 * Helper function to get translated error message from error string
 * Maps common error messages to translation keys
 */
export const getErrorMessageKey = (
  errorMsg: string | null | undefined
): string | null => {
  if (!errorMsg) return null;

  // Map common error messages to translation keys
  const errorMap: { [key: string]: string } = {
    // Materials
    "Failed to fetch materials": "errors.fetchMaterials",
    "Failed to fetch material": "errors.fetchMaterial",
    "Failed to create material": "errors.createMaterial",
    "Failed to update material": "errors.updateMaterial",
    "Failed to delete material": "errors.deleteMaterial",
    "Failed to add material to favorites": "errors.addToFavorites",
    "Failed to fetch favorite materials": "errors.fetchFavorites",
    "Failed to remove material from favorites": "errors.removeFromFavorites",
    "Failed to add material to favorites for user":
      "errors.addToFavoritesForUser",
    "Failed to fetch user favorite materials": "errors.fetchUserFavorites",
    "Failed to add materials to user favorites": "errors.addToUserFavorites",
    "Failed to delete favorite material": "errors.deleteFavorite",
    "Failed to delete user favorite material": "errors.deleteUserFavorite",

    // Categories
    "Failed to fetch material categories": "errors.fetchCategories",
    "Failed to create material category": "errors.createCategory",
    "Failed to update material category": "errors.updateCategory",
    "Failed to delete material category": "errors.deleteCategory",

    // Auth
    "Login failed": "errors.login",
    "Registration failed": "errors.registration",
    "Company registration failed": "errors.companyRegistration",
    "Failed to request OTP": "errors.requestOtp",
    "Too many OTP requests. Try again later.": "errors.tooManyOtpRequests",
    "Google login failed": "errors.googleLogin",
    "Failed to get user data": "errors.getUserData",

    // Users
    "Failed to fetch users": "errors.fetchUsers",
    "Failed to create user": "errors.createUser",
    "Failed to update user": "errors.updateUser",
    "Failed to delete user": "errors.deleteUser",

    // Companies
    "Failed to fetch companies": "errors.fetchCompanies",
    "Failed to create company": "errors.createCompany",
    "Failed to update company": "errors.updateCompany",
    "Failed to delete company": "errors.deleteCompany",

    // Countries
    "Failed to fetch countries": "errors.fetchCountries",
    "Failed to create country": "errors.createCountry",
    "Failed to update country": "errors.updateCountry",
    "Failed to delete country": "errors.deleteCountry",

    // Chat
    "Failed to fetch chats": "errors.fetchChats",
    "Failed to create chat": "errors.createChat",
    "Failed to update chat status": "errors.updateChatStatus",
    "Failed to add message": "errors.addMessage",
    "Failed to fetch chat messages": "errors.fetchMessages",

    // Listings
    "Failed to fetch listings": "errors.fetchListings",
    "Failed to create listing": "errors.createListing",
    "Failed to update listing": "errors.updateListing",
    "Failed to delete listing": "errors.deleteListing",

    // Advertisements
    "Failed to fetch advertisements": "errors.fetchAdvertisements",
    "Failed to create advertisement": "errors.createAdvertisement",
    "Failed to update advertisement": "errors.updateAdvertisement",
    "Failed to delete advertisement": "errors.deleteAdvertisement",
  };

  // Check if error message matches a known error
  for (const [key, translationKey] of Object.entries(errorMap)) {
    if (errorMsg.includes(key) || errorMsg === key) {
      return translationKey;
    }
  }

  // If no match found, return null (caller should use generic error)
  return null;
};
