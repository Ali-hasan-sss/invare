"use client";

import React, { useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  TextField,
  CircularProgress,
} from "@mui/material";
import { useTranslation } from "@/hooks/useTranslation";

export interface BiddingDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  isLoading?: boolean;
  bidAmount: string;
  setBidAmount: (value: string) => void;
  currentPriceLabel: string;
  minAmount?: string; // minimum allowed bid (e.g., starting price)
}

const BiddingDialog: React.FC<BiddingDialogProps> = ({
  open,
  onClose,
  onSubmit,
  isLoading = false,
  bidAmount,
  setBidAmount,
  currentPriceLabel,
  minAmount,
}) => {
  const { t } = useTranslation();

  // Manually lock body scroll without layout shift
  useEffect(() => {
    if (typeof document === "undefined") return;
    const originalOverflow = document.body.style.overflow;
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = originalOverflow || "";
    }
    return () => {
      document.body.style.overflow = originalOverflow || "";
    };
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      // Prevent page shift by disabling MUI scroll lock
      disableScrollLock
      PaperProps={{
        className: "dark:bg-gray-800 dark:text-white",
      }}
    >
      <DialogTitle className="dark:bg-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700">
        <Typography
          component="span"
          className="text-lg font-semibold text-gray-900 dark:text-white"
        >
          {t("bidding.biddingForm")}
        </Typography>
      </DialogTitle>
      <DialogContent className="pt-6 dark:bg-gray-800">
        <Box className="space-y-4">
          <Box className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <Typography
              variant="body2"
              className="text-gray-600 dark:text-gray-400 mb-1"
            >
              {t("bidding.currentBid")}
            </Typography>
            <Typography
              variant="h6"
              className="text-green-600 dark:text-green-400 font-bold"
            >
              {currentPriceLabel}
            </Typography>
          </Box>

          <TextField
            fullWidth
            label={t("bidding.yourBidAmount")}
            type="number"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            variant="outlined"
            InputProps={{ className: "dark:text-white" }}
            InputLabelProps={{ className: "dark:text-gray-300" }}
            helperText={
              minAmount ? `${t("bidding.minimumBid")}: ${minAmount}` : undefined
            }
          />
        </Box>
      </DialogContent>
      <DialogActions className="p-6 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <Button
          onClick={onClose}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
        >
          {t("bidding.cancelBid")}
        </Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={
            !bidAmount ||
            (minAmount
              ? parseFloat(bidAmount || "0") <= parseFloat(minAmount)
              : false) ||
            isLoading
          }
          className="bg-purple-600 hover:bg-purple-700 text-white disabled:bg-gray-400"
        >
          {isLoading ? (
            <Box className="flex items-center gap-2">
              <CircularProgress size={16} color="inherit" />
              <span>{t("common.loading")}...</span>
            </Box>
          ) : (
            t("bidding.submitBid")
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BiddingDialog;
