import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Switch } from "@nextui-org/react"
import { useState, useEffect } from "react";
import { useTranslation } from "@/shared/lib/useTranslation";
interface AddServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  onSaveServer: (name: string, isDefault: boolean) => Promise<void>;
  type: "add" | "edit";
  isDefault: boolean;
}
export const AddServerModal: React.FC<AddServerModalProps> = ({
  isOpen,
  onClose,
  name,
  onSaveServer,
  type,
  isDefault,
}) => {
  const { t } = useTranslation();
  const [serverName, setServerName] = useState(name);
  const [isEnabledState, setIsEnabledState] = useState(isDefault);
  const [isLoading, setIsLoading] = useState(false);

  // 当 name prop 或 isOpen 变化时,更新内部状态
  useEffect(() => {
    if (isOpen) {
      setServerName(name);
      setIsEnabledState(isDefault);
      setIsLoading(false); // 重置 loading 状态
    }
  }, [name, isOpen, isDefault]);

  // 处理保存
  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSaveServer(serverName, isEnabledState);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {type === "add" ? t("Create New Resource Group") : t("Edit Resource Group")}
            </ModalHeader>
            <ModalBody>
              <Input
                label={t("Resource Group Name")}
                value={serverName}
                placeholder={t("Edit Resource Group Name")}
                onChange={(e) => setServerName(e.target.value)}
              />
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium">
                    {t("Set as default")}
                  </span>
                  <span className="text-xs text-gray-500">
                    {t("Automatically bind default resource groups when adding users")}
                  </span>
                </div>
                <Switch
                  isSelected={isEnabledState || false}
                  onValueChange={setIsEnabledState}
                  color="primary"
                  size="sm"
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button 
                color="danger" 
                variant="light" 
                onPress={onClose}
                isDisabled={isLoading}
              >
                {t("Cancel")}
              </Button>
              <Button
                color="primary"
                onPress={handleSave}
                isLoading={isLoading}
              >
                {t("Save")}
              </Button>
            </ModalFooter>
          </>
        )}

      </ModalContent>
    </Modal>
  )
}