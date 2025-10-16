"use client";

import { Button, Input, Link } from "@nextui-org/react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useRef, useState } from "react";
import { useLogin } from "@/shared/hooks/useLogin";
import { useTranslation } from "@/shared/lib/useTranslation";
import toast from "react-hot-toast";
import { fetchAPI } from "@/shared/rpc/common-function";
import { getEmail } from "@/shared/utils/getEmail";

const schema = z.object({
  captcha: z
    .string()
    .length(6, { message: "Verification code must be 6 digits" }),
});

const sendCaptcha = (email: string) => {
  // Send captcha to user
  return fetchAPI("/api/auth/email/send_captcha", {
    method: "POST",
    body: {
      user_email: email,
      type: 1,
    } as unknown as BodyInit,
  });
};

export const EmailVerificationForm = ({ email }: { email: string }) => {
  const { loading, emailLoginOrSignUp } = useLogin();
  const { t } = useTranslation();
  const sendCaptchaRef = useRef(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      captcha: "",
    },
    mode: "onChange",
    resolver: zodResolver(schema),
  });

  const captcha = watch("captcha");
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    if (!sendCaptchaRef.current) {
      sendCaptcha(email);
      sendCaptchaRef.current = true;
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timeLeft]);

  const resend = () => {
    setTimeLeft(60);
    if (timeLeft > 0) return;
    sendCaptcha(email);
  };

  const onSubmit = async (data: { captcha: string }) => {
    const result = await emailLoginOrSignUp({
      captcha: data.captcha,
      user_email: email,
    });

    if (result.success) return;

    // Using NextUI's toast instead of Ant Design's message
    toast.error(t("Verify Email Error"));
  };

  const isCodeValid = captcha.length === 6;
  const canResendCode = timeLeft === 0;
  const emailWebsite = getEmail(email);

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-4">
        <Input isDisabled value={email} />
        <p className="text-default-500 text-[12px]">
          {t(
            "Please enter the 6-digit verification code we sent to the above email. This code expires within 30 minutes."
          )}
          {emailWebsite ? (
            <Link className="text-[12px]" href={emailWebsite} target="_blank">
              {t("Go to email")}
            </Link>
          ) : null}
        </p>
      </div>

      <div>
        <Controller
          name="captcha"
          control={control}
          render={({ field }) => (
            <div className="flex items-center gap-4">
              <Input
                {...field}
                placeholder={t("Enter your verification code")}
                maxLength={6}
                isInvalid={!!errors.captcha}
                errorMessage={errors.captcha?.message}
              />
              {timeLeft > 0 ? (
                <Button disabled variant="light">
                  {timeLeft} s
                </Button>
              ) : (
                <Button
                  color="default"
                  onClick={resend}
                  isDisabled={!canResendCode}
                  variant="ghost"
                >
                  {t("Resend")}
                </Button>
              )}
            </div>
          )}
        />
      </div>
      <div>
        <Button
          fullWidth
          isLoading={loading}
          color="primary"
          type="submit"
          isDisabled={!isCodeValid}
        >
          {t("Log In")}
        </Button>
      </div>
    </form>
  );
};
