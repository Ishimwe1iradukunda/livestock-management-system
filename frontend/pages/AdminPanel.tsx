import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBackend } from "../hooks/useBackend";
import { Shield, Users, FileText, Activity } from "lucide-react";

export default function AdminPanel() {
  const backend = useBackend();
  const [timeRange, setTimeRange] = useState("30");

  const { data: admins } = useQuery({
    queryKey: ["admins"],
    queryFn: () => backend.admin.listAdmins(),
  });

  const { data: auditLogs } = useQuery({
    queryKey: ["audit-logs", timeRange],
    queryFn: () => backend.admin.getAuditLogs({ limit: 50 }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground mt-2">
            Manage system administrators and view audit logs
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Admin Only
        </Badge>
      </div>

      <Tabs defaultValue="admins" className="space-y-6">
        <TabsList>
          <TabsTrigger value="admins">
            <Users className="h-4 w-4 mr-2" />
            Administrators
          </TabsTrigger>
          <TabsTrigger value="audit">
            <FileText className="h-4 w-4 mr-2" />
            Audit Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="admins" className="space-y-4">
          <div className="grid gap-4">
            {admins?.admins?.map((admin) => (
              <Card key={admin.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{admin.username}</CardTitle>
                  <CardDescription>
                    {admin.fullName || "No name provided"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={admin.isActive ? "default" : "secondary"}>
                          {admin.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline">{admin.role}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Created: {new Date(admin.createdAt).toLocaleDateString()}
                      </p>
                      {admin.lastLogin && (
                        <p className="text-sm text-muted-foreground">
                          Last login: {new Date(admin.lastLogin).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <div className="grid gap-2">
            {auditLogs?.logs?.map((log) => (
              <Card key={log.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">{log.action}</p>
                        <Badge variant="outline" className="text-xs">
                          {log.resourceType || "system"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {log.adminEmail || "System"}
                      </p>
                      {log.details && (
                        <p className="text-xs text-muted-foreground">
                          {JSON.stringify(log.details)}
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
