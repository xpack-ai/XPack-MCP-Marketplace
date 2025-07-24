"use client";

import { Divider } from "@nextui-org/react";
import { Suspense, useState } from "react";
import { LoginButton } from "./LoginButton";
import { useLogin } from "@/hooks/useLogin";
import { EmailVerificationForm } from "./VerifyEmail";
import { LoginEmailFrom } from "./LoginEmailFrom";
import { LoginEmailPasswordForm } from "./LoginEmailPasswordForm";
import { useTranslation } from "@/shared/lib/useTranslation";
import { usePlatformConfig } from "@/shared/contexts/PlatformConfigContext";
import { EmailMode } from "@/shared/types/system";

export type StepState = "init" | "emailForm" | "verifyEmail";

const SignInComponent = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<StepState>("init");
  const { googleLoginOrSignUp } = useLogin();
  const { loginConfig } = usePlatformConfig();

  // 检查是否启用了 Google 登录
  const isGoogleLoginEnabled =
    loginConfig?.google?.is_enabled && loginConfig?.google?.client_id;

  // 检查是否启用了邮箱登录
  const isEmailEnabled = loginConfig?.email?.is_enabled ?? true;
  
  // 获取邮箱登录模式
  const emailMode = loginConfig?.email?.mode ?? EmailMode.PASSWORD;

  return (
    <>
      <div className="mt-2 flex w-full max-w-sm flex-col gap-8 rounded-large bg-content1 px-8 py-6 shadow-small backdrop-blur-sm">
        {step === "verifyEmail" && <EmailVerificationForm email={email} />}
        {step === "init" && isGoogleLoginEnabled && (
          <LoginButton
            title={t("Log in with Google")}
            color="primary"
            variant="solid"
            icon="flat-color-icons:google"
            onClick={googleLoginOrSignUp}
          />
        )}
        {/* OR - 只有在启用 Google 登录且有其他登录方式时才显示分隔符 */}
        {isGoogleLoginEnabled && isEmailEnabled && (
          <div className="flex items-center gap-4">
            <Divider className="flex-1" />
            <p className="shrink-0 text-tiny text-default-500">{t("OR")}</p>
            <Divider className="flex-1" />
          </div>
        )}
        {/* Login With Email */}
        {step === "init" && isEmailEnabled && (
          <div className="space-y-4">
            {/* 邮箱/密码登录表单 */}
            {emailMode === EmailMode.PASSWORD && (
              <LoginEmailPasswordForm />
            )}

            {/* 邮箱/验证码登录表单 */}
            {emailMode === EmailMode.CAPTCHA && (
              <LoginEmailFrom setEmail={setEmail} setStep={setStep} />
            )}
          </div>
        )}
        {step !== "init" && isGoogleLoginEnabled && (
          <LoginButton
            title={t("Log in with Google")}
            icon="flat-color-icons:google"
            onClick={googleLoginOrSignUp}
          />
        )}
      </div>
    </>
  );
};

export default function SignInWrapper() {
  return (
    <Suspense fallback={<></>}>
      <SignInComponent />
    </Suspense>
  );
}
