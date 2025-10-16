"use client";

import React from "react";
import {
  Card,
  CardBody,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/react";
import { useTranslation } from "@/shared/lib/useTranslation";

interface DNSRecordsPanelProps {
  cnameTarget: string; // e.g., subdomain.domainhost.com
  apexATarget?: string; // optional A record IP for apex
}

type DnsRow = { key: string; type: string; host: string; value: string };

const DNSRecordsPanel: React.FC<DNSRecordsPanelProps> = ({
  cnameTarget,
  apexATarget,
}) => {
  const { t } = useTranslation();

  const rows: DnsRow[] = [
    ...(cnameTarget
      ? [{ key: "cname", type: "CNAME", host: "www", value: cnameTarget }]
      : []),
    ...(apexATarget
      ? [{ key: "a-record", type: "A", host: "@", value: apexATarget }]
      : []),
  ];

  return (
    <Card shadow="none">
      <CardBody className="p-0 flex flex-col gap-2">
        <h3 className="font-semibold mb-2">
          {"2. "}
          {t("Create your DNS records")}
        </h3>
        <Table aria-label={t("DNS Records Table")} shadow="none" removeWrapper>
          <TableHeader>
            <TableColumn>{t("Type")}</TableColumn>
            <TableColumn>{t("Host")}</TableColumn>
            <TableColumn>{t("Value")}</TableColumn>
          </TableHeader>
          <TableBody items={rows}>
            {(item) => (
              <TableRow key={item.key}>
                <TableCell>{item.type}</TableCell>
                <TableCell>{item.host}</TableCell>
                <TableCell>{item.value}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  );
};

export default DNSRecordsPanel;
