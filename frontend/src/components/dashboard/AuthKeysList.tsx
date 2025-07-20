import React from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Divider,
  Listbox,
  ListboxItem,
} from "@nextui-org/react";
import { Plus } from "lucide-react";
import { APIKey } from "@/shared/types/api";

interface AuthKeysListProps {
  apiKeys: APIKey[] | null;
  selectedApiKey: APIKey | null;
  onNewKey: () => void;
  onSelectKey: (key: APIKey) => void;
}

const AuthKeysList: React.FC<AuthKeysListProps> = ({
  apiKeys,
  selectedApiKey,
  onNewKey,
  onSelectKey,
}) => {
  const { t } = useTranslation();

  return (
    <div className="min-w-[300px] w-[300px] bg-default-100/50 h-full">
      <Card
        shadow="none"
        radius="none"
        className="bg-transparent flex flex-col h-full"
      >
        <CardHeader className="flex justify-between items-center px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {t("Auth Key")}
          </h2>
          <Button
            size="sm"
            color="primary"
            startContent={<Plus size={16} />}
            onPress={onNewKey}
          >
            {t("New")}
          </Button>
        </CardHeader>
        <Divider />
        <CardBody className="flex-grow overflow-y-auto">
          <Listbox
            aria-label="Auth keys list"
            items={apiKeys || []}
            selectionMode="single"
            selectedKeys={selectedApiKey ? [selectedApiKey.apikey_id] : []}
            onSelectionChange={(keys) => {
              const selectedId = Array.from(keys)[0];
              const selectedKey = (apiKeys || []).find(
                (k) => k.apikey_id === selectedId
              );
              if (selectedKey) onSelectKey(selectedKey);
            }}
            itemClasses={{
              title: "text-md font-medium",
              base: "bg-white p-6 transition-colors border-1 data-[selected=true]:focus:bg-primary-50 data-[selected=true]:data-[hover=true]:bg-primary-50 data-[selected=true]:border-primary-500 data-[selected=true]:bg-primary-50 data-[hover=true]:bg-default/50 data-[selectable=true]:focus:bg-default/50",
            }}
            classNames={{
              list: "gap-4",
            }}
            hideSelectedIcon
          >
            {(key) => (
              <ListboxItem key={key.apikey_id} textValue={key.name}>
                {key.name}
              </ListboxItem>
            )}
          </Listbox>
        </CardBody>
      </Card>
    </div>
  );
};

export default AuthKeysList;
