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
      // Helper function to validate UUID format
      const isValidUUID = (uuid: string) => {
        if (!uuid || typeof uuid !== "string") return false;
        const uuidRegex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid.trim());
      };

      // Debug logging
      console.log("Bid data before validation:", {
        listingId,
        amount,
        bidderCompanyId,
        isValidUUID: bidderCompanyId ? isValidUUID(bidderCompanyId) : "N/A",
      });

      // Format amount to always have 2 decimal places
      const formattedAmount = parseFloat(amount).toFixed(2);

      const bidData: CreateBidData = {
        listingId,
        amount: formattedAmount,
      };

      // Add bidderCompanyId if available and valid UUID
      if (bidderCompanyId && isValidUUID(bidderCompanyId)) {
        bidData.bidderCompanyId = bidderCompanyId.trim();
        console.log("✅ Adding bidderCompanyId:", bidderCompanyId.trim());
      } else {
        console.log("❌ bidderCompanyId not added:", {
          bidderCompanyId: bidderCompanyId,
          isString: typeof bidderCompanyId === "string",
          isValid: bidderCompanyId ? isValidUUID(bidderCompanyId) : false,
        });
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
