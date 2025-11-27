import React from "react";
import {
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import { Input } from "@/components/ui/Input";
import { getCountryFlag, getCountryName } from "@/lib/countryUtils";
import { getCountryDialCode, getDefaultDialCode } from "@/lib/phoneUtils";

export interface PhoneCountryOption {
  id: string;
  countryCode: string;
  countryName: string;
}

interface PhoneNumberInputProps {
  countries: PhoneCountryOption[];
  countryValue: string;
  numberValue: string;
  languageCode: "ar" | "en";
  onCountryChange: (dialCode: string) => void;
  onNumberChange: (digits: string) => void;
  loading?: boolean;
  placeholder?: string;
  helperText?: string;
  disabled?: boolean;
  loadingText?: string;
}

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  countries,
  countryValue,
  numberValue,
  languageCode,
  onCountryChange,
  onNumberChange,
  loading = false,
  placeholder = "05XXXXXXXX",
  helperText,
  disabled = false,
  loadingText = "Loading...",
}) => {
  if (loading && countries.length === 0) {
    return (
      <div className="text-center py-2 text-gray-500 dark:text-gray-400 text-sm">
        {loadingText}
      </div>
    );
  }

  const renderValue = (value?: string) => (
    <span className="text-gray-900 dark:text-white font-medium">
      {value || getDefaultDialCode()}
    </span>
  );

  return (
    <div className="space-y-1.5" dir="ltr">
      <div className="flex items-stretch gap-0">
        <FormControl
          className="w-36 flex-shrink-0"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
              marginRight: "-1px",
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgb(209 213 219)",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgb(59 130 246)",
            },
            ".dark & .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgb(75 85 99)",
            },
          }}
        >
          <Select
            value={countryValue || getDefaultDialCode()}
            onChange={(e: SelectChangeEvent<string>) => {
              onCountryChange(e.target.value);
            }}
            displayEmpty
            MenuProps={{
              PaperProps: {
                sx: {
                  backgroundColor: "rgb(255 255 255)",
                  ".dark &": {
                    backgroundColor: "rgb(17 24 39)",
                  },
                },
              },
            }}
            renderValue={renderValue}
          >
            {countries.map((country) => {
              const flag = getCountryFlag(country.countryCode);
              const dialCode = getCountryDialCode(country.countryCode);
              const translatedName = getCountryName(
                country.countryCode,
                languageCode
              );
              const displayName = translatedName || country.countryName || "";
              return (
                <MenuItem
                  key={`${country.id}-${dialCode}`}
                  value={dialCode}
                  sx={{
                    color: "rgb(17 24 39)",
                    ".dark &": {
                      color: "rgb(249 250 251)",
                    },
                  }}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{flag}</span>
                    <span>{displayName}</span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {dialCode}
                    </span>
                  </span>
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
        <Input
          type="tel"
          inputMode="tel"
          value={numberValue}
          onChange={(e) => {
            const digitsOnly = e.target.value.replace(/\D/g, "");
            onNumberChange(digitsOnly);
          }}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 -ml-px"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
            },
          }}
        />
      </div>
      {helperText && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
    </div>
  );
};

export default PhoneNumberInput;
