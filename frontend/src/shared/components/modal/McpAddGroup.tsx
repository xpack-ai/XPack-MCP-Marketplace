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
    Spinner,
  } from "@nextui-org/react";
  import { useState, useEffect, useCallback } from "react";
  import { useTranslation } from "@/shared/lib/useTranslation";
import { fetchUnboundResourceGroups } from "@/services/mcpService";
  
  interface McpAddGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    id: string;
    onSaveMcpServer: (serverIds: string[]) => Promise<void>;
  }
  
  interface ResourceGroup {
    id: string;
    name: string;
  }
  
  export const McpAddGroupModal: React.FC<McpAddGroupModalProps> = ({
    isOpen,
    onClose,
    id,
    onSaveMcpServer,
  }) => {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resourceGroups, setResourceGroups] = useState<ResourceGroup[]>([]);
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  
    // 加载服务列表
    const loadServices = useCallback(async () => {
      setLoading(true);
      try {
        const response = await fetchUnboundResourceGroups(id);
        setResourceGroups(response);
      } catch (error) {
        console.error("Failed to load resource groups:", error);
      } finally {
        setLoading(false);
      }
    }, []);
  
    // 当模态框打开时加载数据
    useEffect(() => {
      if (isOpen) {
        setSelectedKeys(new Set());
        loadServices();
      }
    }, [isOpen, loadServices]);
  
    // 处理保存
    const handleSave = async () => {
      const serverIds = typeof selectedKeys === 'string' && selectedKeys === 'all' ? resourceGroups.map((group) => group.id) : Array.from(selectedKeys);
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
                {t("Add to Groups")}
              </ModalHeader>
              <ModalBody>
                <Table
                  aria-label="Resource groups selection table"
                  selectionMode="multiple"
                  selectedKeys={selectedKeys}
                  onSelectionChange={(keys) => setSelectedKeys(keys as Set<string>)}
                  removeWrapper
                  classNames={{
                    wrapper: "min-h-[400px]",
                  }}
                  className="[&_td:first-child]:w-[30px] [&_th:first-child]:w-[30px]"
                >
                  <TableHeader>
                    <TableColumn>{t("Group Name")}</TableColumn>
                  </TableHeader>
                  <TableBody
                    items={resourceGroups}
                    isLoading={loading}
                    loadingContent={<Spinner />}
                    emptyContent={t("No resource groups available")}
                  >
                    {(resourceGroup) => (
                      <TableRow key={resourceGroup.id}>
                        <TableCell>
                          <span className="text-sm">{resourceGroup.name}</span>
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