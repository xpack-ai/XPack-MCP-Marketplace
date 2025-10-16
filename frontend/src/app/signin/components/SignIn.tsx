"use client";

import { Divider } from "@nextui-org/react";
import { useRef, useState } from "react";
import { LoginButton } from "./LoginButton";
import { useLogin } from "@/shared/hooks/useLogin";
import { EmailVerificationForm } from "./VerifyEmail";
import { LoginEmailFrom } from "./LoginEmailFrom";
import { LoginEmailPasswordForm } from "./LoginEmailPasswordForm";
import { useTranslation } from "@/shared/lib/useTranslation";
import { usePlatformConfig } from "@/shared/contexts/PlatformConfigContext";
import { EmailMode } from "@/shared/types/system";
import BgCollagePattern from "@/shared/components/sign/BgCollagePattern";
import { DynamicLogo } from "@/shared/components/DynamicLogo";

export type StepState = "init" | "emailForm" | "verifyEmail";

export default function SignInComponent() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<StepState>("init");
  const { googleLoginOrSignUp } = useLogin();
  const { loginConfig } = usePlatformConfig();
  const containerRef = useRef<HTMLDivElement>(null);
  // 检查是否启用了 Google 登录
  const isGoogleLoginEnabled =
    loginConfig?.google?.is_enabled && loginConfig?.google?.client_id;

  // 检查是否启用了邮箱登录
  const isEmailEnabled = loginConfig?.email?.is_enabled ?? true;

  // 获取邮箱登录模式
  const emailMode = loginConfig?.email?.mode ?? EmailMode.PASSWORD;

  return (
    <>
      <div
        className="relative w-full min-h-screen flex items-center justify-center"
        ref={containerRef}
      >
        {/* Background collage pattern */}
        <BgCollagePattern
          containerRef={containerRef}
          options={{
            radius: 30,
            background: "#f5f5f5",
            particleCount: 20000,
            color: "#006fee",
            colorPole: "#001aee",
          }}
        />
        <div className="relative z-10 w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-lg bg-opacity-95">
            <div className="mb-10">
              <div className="flex gap-2 mb-4">
                <DynamicLogo className="h-[32px]" hideText />
              </div>
              <h1 className="text-3xl font-semibold text-default-900">
                {t("Sign in")} <br />
                <span>{t("or create your account")}</span>
              </h1>
            </div>

            <div className="space-y-6">
              {step === "verifyEmail" && (
                <EmailVerificationForm email={email} />
              )}
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
                  <p className="shrink-0 text-tiny text-default-500">
                    {t("OR")}
                  </p>
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

              {/* 底部提示文本 */}
              {step === "init" && (
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    {t("No account? Just continue—we’ll set you up.")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
