import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Spinner,
} from "@nextui-org/react";
import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "@/shared/lib/useTranslation";
import { ChargeType } from "@/shared/types/marketplace";
import { fetchSimpleMcpServices } from "@/api/resourceGroup.api";
import { Price } from "@/shared/components/marketplace/Price";

interface AddMcpServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveMcpServer: (serverIds: string[]) => Promise<void>;
  id: string;
}

export interface SimpleMcpService {
  id: string;
  name: string;
  base_url: string;
  charge_type: ChargeType;
  price: string;
  enabled: boolean;
  input_token_price?: string;
  output_token_price?: string;
}

export const AddMcpServerModal: React.FC<AddMcpServerModalProps> = ({
  isOpen,
  onClose,
  onSaveMcpServer,
  id,
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<SimpleMcpService[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  // 加载服务列表
  const loadServices = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const response = await fetchSimpleMcpServices(id);
      setServices(response);
    } catch (error) {
      console.error("Failed to load MCP services:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 当模态框打开时加载数据
  useEffect(() => {
    if (isOpen) {
      setSelectedKeys(new Set());
      loadServices(id);
    }
  }, [isOpen, loadServices]);

  // 处理保存
  const handleSave = async () => {
    const serverIds = typeof selectedKeys === 'string' && selectedKeys === 'all' ? services.map((service) => service.id) : Array.from(selectedKeys);
    if (serverIds.length === 0) {
      return;
    }

    setIsLoading(true);
    try {
      await onSaveMcpServer(serverIds);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="5xl" scrollBehavior="inside">
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {t("Add MCP Server")}
            </ModalHeader>
            <ModalBody>
              <Table
                aria-label="MCP services selection table"
                selectionMode="multiple"
                selectedKeys={selectedKeys}
                onSelectionChange={(keys) => setSelectedKeys(keys as Set<string>)}
                removeWrapper
                classNames={{
                  wrapper: "min-h-[400px]",
                }}
              >
                <TableHeader>
                  <TableColumn>{t("Service Name")}</TableColumn>
                  <TableColumn>{t("API Endpoint")}</TableColumn>
                  <TableColumn>{t("Status")}</TableColumn>
                  <TableColumn>{t("Pricing")}</TableColumn>
                </TableHeader>
                <TableBody
                  items={services}
                  isLoading={loading}
                  loadingContent={<Spinner />}
                  emptyContent={t("No MCP services available")}
                >
                  {(service) => (
                    <TableRow key={service.id}>
                      <TableCell>
                        <span className="text-sm">{service.name}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{service.base_url}</span>
                      </TableCell>
                      <TableCell>
                        <Chip
                          className="capitalize"
                          color={service.enabled ? "success" : "danger"}
                          size="sm"
                          variant="flat"
                        >
                          {t(service.enabled ? "Published" : "Unpublished")}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <Price
                          price={service.price}
                          charge_type={service.charge_type}
                          input_token_price={service.input_token_price}
                          output_token_price={service.output_token_price}
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                variant="light"
                onPress={onClose}
                isDisabled={isLoading}
              >
                {t("Close")}
              </Button>
              <Button
                color="primary"
                onPress={handleSave}
                isLoading={isLoading}
                isDisabled={selectedKeys.size === 0}
              >
                {t("Add")}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};