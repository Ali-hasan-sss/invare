"use client";

import React, { useState } from "react";
import {
  Container,
  Box,
  Typography,
  Paper,
  Divider,
  Grid,
} from "@mui/material";
import { TextField, Button, Snackbar, Alert } from "@mui/material";
import { useTranslation } from "@/hooks/useTranslation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from "lucide-react";

const ContactPage: React.FC = () => {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  return (
    <Container maxWidth="lg" className="py-8">
      <Breadcrumbs
        className="mb-6"
        variant="default"
        size="md"
        items={[
          { label: t("common.home"), href: "/" },
          { label: t("navigation.contactUs") || "اتصل بنا" },
        ]}
      />

      <Paper className="p-6 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700">
        <Typography
          variant="h4"
          className="font-bold mb-2 text-gray-900 dark:text-gray-100"
        >
          {t("contact.title") || "اتصل بنا"}
        </Typography>
        <Typography className="mb-4 text-gray-700 dark:text-gray-300">
          {t("contact.subtitle") ||
            "يسعدنا تواصلك معنا. تجد أدناه طرق التواصل."}
        </Typography>

        <Divider className="my-4" />

        <Grid container spacing={3}>
          {/* Contact info cards */}
          <Grid item xs={12} md={4}>
            <Box className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/40 h-full border border-gray-200 dark:border-gray-700">
              <Box className="flex items-center mb-2">
                <Mail
                  size={18}
                  className="text-purple-600 dark:text-purple-400 ltr:mr-2 rtl:ml-2"
                />
                <Typography className="font-semibold text-gray-900 dark:text-gray-100">
                  {t("contact.emailLabel") || "البريد الإلكتروني"}
                </Typography>
              </Box>
              <Typography className="text-gray-700 dark:text-gray-300">
                {t("contact.email")}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/40 h-full border border-gray-200 dark:border-gray-700">
              <Box className="flex items-center mb-2">
                <Phone
                  size={18}
                  className="text-green-600 dark:text-green-400 ltr:mr-2 rtl:ml-2"
                />
                <Typography className="font-semibold text-gray-900 dark:text-gray-100">
                  {t("contact.phoneLabel") || "رقم الهاتف"}
                </Typography>
              </Box>
              <Typography className="text-gray-700 dark:text-gray-300">
                {t("contact.phone")}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/40 h-full border border-gray-200 dark:border-gray-700">
              <Box className="flex items-center mb-2">
                <MapPin
                  size={18}
                  className="text-blue-600 dark:text-blue-400 ltr:mr-2 rtl:ml-2"
                />
                <Typography className="font-semibold text-gray-900 dark:text-gray-100">
                  {t("contact.addressLabel") || "العنوان"}
                </Typography>
              </Box>
              <Typography className="text-gray-700 dark:text-gray-300">
                {t("contact.address")}
              </Typography>
            </Box>
          </Grid>

          {/* Contact form */}
          <Grid item xs={12} md={7}>
            <Box className="p-5 rounded-lg bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700">
              <Typography className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                {t("contact.formTitle")}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t("contact.formName")}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    size="small"
                    InputLabelProps={{ className: "dark:text-gray-300" as any }}
                    className="dark:[&_input]:text-white"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t("contact.formEmail")}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    size="small"
                    InputLabelProps={{ className: "dark:text-gray-300" as any }}
                    className="dark:[&_input]:text-white"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={t("contact.formSubject")}
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    size="small"
                    InputLabelProps={{ className: "dark:text-gray-300" as any }}
                    className="dark:[&_input]:text-white"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={t("contact.formMessage")}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    size="small"
                    multiline
                    minRows={4}
                    InputLabelProps={{ className: "dark:text-gray-300" as any }}
                    className="dark:[&_textarea]:text-white"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white"
                    onClick={() => {
                      setToastMsg(t("payments.paymentSuccess") || "تم الإرسال");
                      setToastOpen(true);
                      setName("");
                      setEmail("");
                      setSubject("");
                      setMessage("");
                    }}
                  >
                    {t("contact.formSubmit")}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Grid>

          {/* Social links */}
          <Grid item xs={12} md={5}>
            <Box className="p-5 rounded-lg bg-gray-50 dark:bg-gray-900/40 h-full border border-gray-200 dark:border-gray-700">
              <Typography className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                {t("contact.socialTitle")}
              </Typography>
              <Box className="flex items-center space-x-4 rtl:space-x-reverse">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-600"
                >
                  <Facebook size={20} />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-600 dark:text-gray-300 hover:text-sky-500"
                >
                  <Twitter size={20} />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-600 dark:text-gray-300 hover:text-pink-500"
                >
                  <Instagram size={20} />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-700"
                >
                  <Linkedin size={20} />
                </a>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Snackbar
        open={toastOpen}
        autoHideDuration={3000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToastOpen(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          {toastMsg}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ContactPage;
