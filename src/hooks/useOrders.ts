import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  deleteOrder,
  clearError,
  clearCurrentOrder,
  setCurrentPage,
  setLimit,
  Order,
  CreateOrderData,
  GetOrdersParams,
} from "@/store/slices/ordersSlice";

export const useOrders = () => {
  const dispatch = useAppDispatch();
  const {
    orders,
    currentOrder,
    isLoading,
    error,
    totalCount,
    currentPage,
    limit,
  } = useAppSelector((state) => state.orders);

  const getOrdersHandler = useCallback(
    (params?: GetOrdersParams) => {
      return dispatch(getOrders(params));
    },
    [dispatch]
  );

  const getOrderByIdHandler = useCallback(
    (id: string) => {
      return dispatch(getOrderById(id));
    },
    [dispatch]
  );

  const createOrderHandler = useCallback(
    (orderData: CreateOrderData) => {
      return dispatch(createOrder(orderData));
    },
    [dispatch]
  );

  const updateOrderStatusHandler = useCallback(
    (id: string, status: string) => {
      return dispatch(updateOrderStatus({ id, status }));
    },
    [dispatch]
  );

  const deleteOrderHandler = useCallback(
    (id: string) => {
      return dispatch(deleteOrder(id));
    },
    [dispatch]
  );

  const clearErrorHandler = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const clearCurrentOrderHandler = useCallback(() => {
    dispatch(clearCurrentOrder());
  }, [dispatch]);

  const setCurrentPageHandler = useCallback(
    (page: number) => {
      dispatch(setCurrentPage(page));
    },
    [dispatch]
  );

  const setLimitHandler = useCallback(
    (limit: number) => {
      dispatch(setLimit(limit));
    },
    [dispatch]
  );

  return {
    orders,
    currentOrder,
    isLoading,
    error,
    totalCount,
    currentPage,
    limit,
    getOrders: getOrdersHandler,
    getOrderById: getOrderByIdHandler,
    createOrder: createOrderHandler,
    updateOrderStatus: updateOrderStatusHandler,
    deleteOrder: deleteOrderHandler,
    clearError: clearErrorHandler,
    clearCurrentOrder: clearCurrentOrderHandler,
    setCurrentPage: setCurrentPageHandler,
    setLimit: setLimitHandler,
  };
};
