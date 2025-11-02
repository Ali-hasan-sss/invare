import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getListingBids,
  getBidById,
  createBid,
  deleteBid,
  clearError,
  clearCurrentBid,
  setCurrentBid,
  CreateBidData,
  Bid,
} from "@/store/slices/bidsSlice";

// Custom hook for bids management
export const useBids = () => {
  const dispatch = useAppDispatch();
  const { bids, currentBid, isLoading, error } = useAppSelector(
    (state) => state.bids
  );

  const getListingBidsHandler = useCallback(
    (listingId: string) => {
      return dispatch(getListingBids(listingId));
    },
    [dispatch]
  );

  const getBidByIdHandler = useCallback(
    (id: string) => {
      return dispatch(getBidById(id));
    },
    [dispatch]
  );

  const createBidHandler = useCallback(
    (bidData: CreateBidData) => {
      return dispatch(createBid(bidData));
    },
    [dispatch]
  );

  const deleteBidHandler = useCallback(
    (id: string) => {
      return dispatch(deleteBid(id));
    },
    [dispatch]
  );

  const clearErrorHandler = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const clearCurrentBidHandler = useCallback(() => {
    dispatch(clearCurrentBid());
  }, [dispatch]);

  const setCurrentBidHandler = useCallback(
    (bid: Bid) => {
      dispatch(setCurrentBid(bid));
    },
    [dispatch]
  );

  return {
    // State
    bids,
    currentBid,
    isLoading,
    error,

    // Actions
    getListingBids: getListingBidsHandler,
    getBidById: getBidByIdHandler,
    createBid: createBidHandler,
    deleteBid: deleteBidHandler,
    clearError: clearErrorHandler,
    clearCurrentBid: clearCurrentBidHandler,
    setCurrentBid: setCurrentBidHandler,
  };
};

// Hook specifically for bidding on listings
export const useBidding = () => {
  const bidHooks = useBids();

  const placeBid = useCallback(
    async (listingId: string, amount: string, bidderCompanyId?: string) => {
      // Debug logging
      console.log("Bid data before send:", {
        listingId,
        amount,
        bidderCompanyId,
      });

      // Format amount to always have 2 decimal places
      const formattedAmount = parseFloat(amount).toFixed(2);

      const bidData: CreateBidData = {
        listingId,
        amount: formattedAmount,
      };

      // Add bidderCompanyId if provided (no client-side UUID validation)
      if (
        bidderCompanyId &&
        typeof bidderCompanyId === "string" &&
        bidderCompanyId.trim()
      ) {
        bidData.bidderCompanyId = bidderCompanyId.trim();
        console.log("Adding bidderCompanyId:", bidderCompanyId.trim());
      }

      console.log("Final bid data being sent:", bidData);

      const result = await bidHooks.createBid(bidData);
      return result;
    },
    [bidHooks]
  );

  return {
    ...bidHooks,
    placeBid,
  };
};
