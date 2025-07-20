"use client";

import { Divider } from "@nextui-org/react";
import { Suspense, useState } from "react";
import { LoginButton } from "./LoginButton";
import { useLogin } from "@/hooks/useLogin";
import { EmailVerificationForm } from "./VerifyEmail";
import { LoginEmailFrom } from "./LoginEmailFrom";
import { useTranslation } from "@/shared/lib/useTranslation";
import { usePlatformConfig } from "@/shared/contexts/PlatformConfigContext";

export type StepState = "init" | "emailForm" | "verifyEmail";

const SignInComponent = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<StepState>("init");
  const { googleLoginOrSignUp } = useLogin();
  const { googleAuthConfig } = usePlatformConfig();

  // 检查是否启用了 Google 登录
  const isGoogleLoginEnabled = googleAuthConfig?.is_enabled && googleAuthConfig?.client_id;

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
        {/* OR - 只有在启用 Google 登录时才显示分隔符 */}
        {isGoogleLoginEnabled && (
          <div className="flex items-center gap-4">
            <Divider className="flex-1" />
            <p className="shrink-0 text-tiny text-default-500">{t("OR")}</p>
            <Divider className="flex-1" />
          </div>
        )}
        {/* Login With Email */}
        {step === "init" && (
          <LoginEmailFrom setEmail={setEmail} setStep={setStep} />
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