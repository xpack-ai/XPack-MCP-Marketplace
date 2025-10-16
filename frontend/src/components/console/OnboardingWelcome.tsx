"use client";

import React, { useEffect, useState } from "react";
import {
  CheckCircle2,
  Share2,
  ArrowRight,
  Settings,
  ServerIcon,
  DollarSign,
} from "lucide-react";
import {
  Button,
  Card,
  CardBody,
  Listbox,
  ListboxItem,
  Link,
} from "@nextui-org/react";
import { useTranslation } from "@/shared/lib/useTranslation";
import { usePlatformConfig } from "@/shared/contexts/PlatformConfigContext";
import { OnboardingTaskKey } from "@/api/onboard.api";

export const REQUIRED_TASK_KEYS = [
  OnboardingTaskKey.PLATFORM_SETUP,
  OnboardingTaskKey.MCP_SERVICES,
  OnboardingTaskKey.REVENUE_MANAGEMENT,
  OnboardingTaskKey.SHARE_PLATFORM,
];
interface OnboardingWelcomeProps {
  onSkipOnboarding: () => void;
  completedTasks: string[];
  onTaskClick: (taskKey: OnboardingTaskKey) => void;
}
const OnboardingWelcome: React.FC<OnboardingWelcomeProps> = ({
  onSkipOnboarding,
  completedTasks,
  onTaskClick,
}) => {
  const { t } = useTranslation();
  const { platformConfig } = usePlatformConfig();
  const [activeTab, setActiveTab] = useState<OnboardingTaskKey | undefined>(
    REQUIRED_TASK_KEYS.find((task) => !completedTasks.includes(task))
  );
  useEffect(() => {
    setActiveTab(
      REQUIRED_TASK_KEYS.find((task) => !completedTasks.includes(task))
    );
  }, [completedTasks]);

  const tasks = [
    {
      key: OnboardingTaskKey.PLATFORM_SETUP,
      title: t("Configure Platform Settings"),
      subtitle: t("Set up your platform name, domain, and branding."),
      icon: <Settings size={18} />,
    },
    {
      key: OnboardingTaskKey.MCP_SERVICES,
      title: t("Add MCP Services"),
      subtitle: t("Configure and deploy your first MCP server tools."),
      icon: <ServerIcon size={18} />,
    },
    {
      key: OnboardingTaskKey.REVENUE_MANAGEMENT,
      title: t("Configure Payment & Billing"),
      subtitle: t("Set up payment channels and token pricing."),
      icon: <DollarSign size={18} />,
    },
    {
      key: OnboardingTaskKey.SHARE_PLATFORM,
      title: t("Share Your Platform"),
      subtitle: t("Invite users and promote your MCP platform."),
      icon: <Share2 size={18} />,
    },
  ];

  const isTaskCompleted = (taskKey: string) => completedTasks.includes(taskKey);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t("Welcome to {{name}}!", {
            name: platformConfig.name || "your platform",
          })}
        </h1>
        <p className="text-gray-600 text-sm">
          {t("Let's set up {{name}} to get you started.", {
            name: platformConfig.name || "your platform",
          })}
        </p>
      </div>
      <Card className="w-full max-w-lg border-1 overflow-visible" shadow="none">
        <CardBody className="py-0 overflow-y-visible">
          <Listbox
            aria-label="Onboarding tasks"
            className="overflow-visible"
            classNames={{
              list: "overflow-visible",
            }}
          >
            {tasks.map((task, index) => (
              <ListboxItem
                key={task.key}
                startContent={
                  <div
                    className={`flex-shrink-0 ${
                      !isTaskCompleted(task.key)
                        ? "text-primary"
                        : "text-default-400"
                    }`}
                  >
                    {task.icon}
                  </div>
                }
                endContent={
                  isTaskCompleted(task.key) ? (
                    <CheckCircle2
                      size={18}
                      className="text-green-500 flex-shrink-0"
                    />
                  ) : (
                    <ArrowRight
                      size={18}
                      className="text-primary flex-shrink-0 group-data-[hover=true]:translate-x-1 duration-300 ease-in-out"
                    />
                  )
                }
                description={activeTab === task.key ? task.subtitle : undefined}
                onPress={() => {
                  onTaskClick(task.key);
                }}
                className={`py-6 gap-3 ${
                  !isTaskCompleted(task.key)
                    ? "data-[hover=true]:opacity-50"
                    : "text-default-500 data-[hover=true]:text-default-500"
                } ${activeTab === task.key ? "scale-[1.15] border-2 border-primary bg-white px-6 data-[hover=true]:opacity-100 data-[hover=true]:bg-white" : "data-[hover=true]:bg-transparent"}`}
                classNames={{
                  title: "font-bold text-md",
                }}
                showDivider={
                  index !== tasks.length - 1 && activeTab !== task.key
                }
              >
                {task.title}
              </ListboxItem>
            ))}
          </Listbox>
        </CardBody>
      </Card>

      {/* Help Section */}
      <div className="text-center my-6">
        <p className="text-xs text-gray-500">
          {t("Need help getting started? Check out our")}{" "}
          <Link
            href="https://discord.gg/cyZfcdCXkW"
            size="sm"
            className="font-medium"
            target="_blank"
          >
            {t("Discord Community")}
          </Link>
          .
        </p>
      </div>

      {/* Skip Button */}
      <div className="text-center">
        <Button onPress={onSkipOnboarding} size="sm" variant="bordered">
          {t("Skip setup guide")}
        </Button>
      </div>
    </div>
  );
};

export default OnboardingWelcome;
