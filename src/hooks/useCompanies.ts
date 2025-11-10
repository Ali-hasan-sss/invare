import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  getCompanies,
  getCompanyById,
  getMyCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
  createCompanyWithUser,
  clearError,
  clearCurrentCompany,
  setCurrentPage,
  setLimit,
  CreateCompanyData,
  UpdateCompanyData,
  CreateCompanyWithUserData,
  GetCompaniesParams,
} from "../store/slices/companiesSlice";

// Main companies hook
export const useCompanies = () => {
  const dispatch = useAppDispatch();
  const companiesState = useAppSelector((state) => state.companies);

  // Get companies list
  const fetchCompanies = useCallback(
    async (params?: GetCompaniesParams) => {
      return dispatch(getCompanies(params));
    },
    [dispatch]
  );

  // Get company by ID
  const fetchCompanyById = useCallback(
    async (id: string) => {
      return dispatch(getCompanyById(id));
    },
    [dispatch]
  );

  // Create company
  const addCompany = useCallback(
    async (companyData: CreateCompanyData) => {
      return dispatch(createCompany(companyData));
    },
    [dispatch]
  );

  // Update company
  const editCompany = useCallback(
    async (id: string, companyData: UpdateCompanyData) => {
      return dispatch(updateCompany({ id, data: companyData }));
    },
    [dispatch]
  );

  // Delete company
  const removeCompany = useCallback(
    async (id: string) => {
      return dispatch(deleteCompany(id));
    },
    [dispatch]
  );

  // Create company with user
  const addCompanyWithUser = useCallback(
    async (data: CreateCompanyWithUserData) => {
      return dispatch(createCompanyWithUser(data));
    },
    [dispatch]
  );

  // Get current user's companies
  const fetchMyCompanies = useCallback(async () => {
    return dispatch(getMyCompanies());
  }, [dispatch]);

  // Clear error
  const clearCompaniesError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Clear current company
  const clearCompany = useCallback(() => {
    dispatch(clearCurrentCompany());
  }, [dispatch]);

  // Set current page
  const changePage = useCallback(
    (page: number) => {
      dispatch(setCurrentPage(page));
    },
    [dispatch]
  );

  // Set limit
  const changeLimit = useCallback(
    (limit: number) => {
      dispatch(setLimit(limit));
    },
    [dispatch]
  );

  return {
    // State
    companies: companiesState.companies,
    currentCompany: companiesState.currentCompany,
    myCompanies: companiesState.myCompanies,
    isLoading: companiesState.isLoading,
    error: companiesState.error,
    totalCount: companiesState.totalCount,
    currentPage: companiesState.currentPage,
    limit: companiesState.limit,

    // Actions
    getCompanies: fetchCompanies,
    getCompanyById: fetchCompanyById,
    getMyCompanies: fetchMyCompanies,
    createCompany: addCompany,
    updateCompany: editCompany,
    deleteCompany: removeCompany,
    createCompanyWithUser: addCompanyWithUser,
    clearError: clearCompaniesError,
    clearCurrentCompany: clearCompany,
    setCurrentPage: changePage,
    setLimit: changeLimit,
  };
};

// Hook for companies list only
export const useCompaniesList = () => {
  const { companies, isLoading, error, getCompanies } = useCompanies();

  return {
    companies,
    isLoading,
    error,
    getCompanies,
  };
};

// Hook for current company only
export const useCurrentCompany = () => {
  const {
    currentCompany,
    isLoading,
    error,
    getCompanyById,
    clearCurrentCompany,
  } = useCompanies();

  return {
    currentCompany,
    isLoading,
    error,
    getCompanyById,
    clearCurrentCompany,
  };
};

// Hook for company actions only
export const useCompanyActions = () => {
  const {
    createCompany,
    updateCompany,
    deleteCompany,
    createCompanyWithUser,
    getMyCompanies,
    clearError,
  } = useCompanies();

  return {
    createCompany,
    updateCompany,
    deleteCompany,
    createCompanyWithUser,
    getMyCompanies,
    clearError,
  };
};

export default useCompanies;
