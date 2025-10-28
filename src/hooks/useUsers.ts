import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  clearError,
  clearCurrentUser,
  setCurrentPage,
  setLimit,
  CreateUserData,
  UpdateUserData,
  GetUsersParams,
} from "../store/slices/usersSlice";

// Main users hook
export const useUsers = () => {
  const dispatch = useAppDispatch();
  const usersState = useAppSelector((state) => state.users);

  // Get users list
  const fetchUsers = useCallback(
    async (params?: GetUsersParams) => {
      return dispatch(getUsers(params));
    },
    [dispatch]
  );

  // Get user by ID
  const fetchUserById = useCallback(
    async (id: string) => {
      return dispatch(getUserById(id));
    },
    [dispatch]
  );

  // Create user
  const addUser = useCallback(
    async (userData: CreateUserData) => {
      return dispatch(createUser(userData));
    },
    [dispatch]
  );

  // Update user
  const editUser = useCallback(
    async (id: string, userData: UpdateUserData) => {
      return dispatch(updateUser({ id, data: userData }));
    },
    [dispatch]
  );

  // Delete user
  const removeUser = useCallback(
    async (id: string) => {
      return dispatch(deleteUser(id));
    },
    [dispatch]
  );

  // Clear error
  const clearUsersError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Clear current user
  const clearUser = useCallback(() => {
    dispatch(clearCurrentUser());
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
    users: usersState.users,
    currentUser: usersState.currentUser,
    isLoading: usersState.isLoading,
    error: usersState.error,
    totalCount: usersState.totalCount,
    currentPage: usersState.currentPage,
    limit: usersState.limit,

    // Actions
    getUsers: fetchUsers,
    getUserById: fetchUserById,
    createUser: addUser,
    updateUser: editUser,
    deleteUser: removeUser,
    clearError: clearUsersError,
    clearCurrentUser: clearUser,
    setCurrentPage: changePage,
    setLimit: changeLimit,
  };
};

// Hook for users list only
export const useUsersList = () => {
  const { users, isLoading, error, getUsers } = useUsers();

  return {
    users,
    isLoading,
    error,
    getUsers,
  };
};

// Hook for current user only
export const useCurrentUser = () => {
  const { currentUser, isLoading, error, getUserById, clearCurrentUser } =
    useUsers();

  return {
    currentUser,
    isLoading,
    error,
    getUserById,
    clearCurrentUser,
  };
};

// Hook for user actions only
export const useUserActions = () => {
  const { createUser, updateUser, deleteUser, clearError } = useUsers();

  return {
    createUser,
    updateUser,
    deleteUser,
    clearError,
  };
};

export default useUsers;
