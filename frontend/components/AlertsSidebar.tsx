import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { 
  Bell, 
  AlertTriangle, 
  Package, 
  Heart, 
  Calendar,
  ExternalLink
} from "lucide-react";
import { Link } from "react-router-dom";
import { useBackend } from "../hooks/useBackend";

export default function AlertsSidebar() {
  const backend = useBackend();
  const { data: alertsData, isLoading } = useQuery({
    queryKey: ["alerts"],
    queryFn: () => backend.alerts.getAlerts(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "low_stock":
        return <Package className="h-4 w-4" />;
      case "health_due":
      case "vaccination_due":
        return <Heart className="h-4 w-4" />;
      case "breeding_due":
        return <Calendar className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "outline";
    }
  };

  const getActionLink = (alert: any) => {
    switch (alert.type) {
      case "low_stock":
        return "/feeds";
      case "health_due":
      case "vaccination_due":
        return "/health";
      case "breeding_due":
        return "/animals";
      default:
        return "/";
    }
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString();
  };

  const totalAlerts = alertsData?.counts.total || 0;
  const urgentAlerts = (alertsData?.counts.urgent || 0) + (alertsData?.counts.high || 0);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {totalAlerts > 0 && (
            <Badge 
              variant={urgentAlerts > 0 ? "destructive" : "secondary"}
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {totalAlerts > 99 ? "99+" : totalAlerts}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[500px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Farm Alerts
          </SheetTitle>
          <SheetDescription>
            System notifications and action items requiring attention
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="mt-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-full"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="mt-6">
            {totalAlerts === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">All Clear!</h3>
                  <p className="text-muted-foreground text-center">
                    No alerts at the moment. Your farm is running smoothly.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="mb-4 grid grid-cols-2 gap-2 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {urgentAlerts}
                    </div>
                    <div className="text-muted-foreground">Urgent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {totalAlerts}
                    </div>
                    <div className="text-muted-foreground">Total</div>
                  </div>
                </div>

                <ScrollArea className="h-[calc(100vh-300px)]">
                  <div className="space-y-4">
                    {alertsData?.alerts.map((alert) => (
                      <Card key={alert.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1">
                              <div className={`p-1 rounded-full ${
                                alert.priority === "urgent" || alert.priority === "high" 
                                  ? "bg-red-100 text-red-600" 
                                  : "bg-yellow-100 text-yellow-600"
                              }`}>
                                {getAlertIcon(alert.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium text-sm truncate">
                                    {alert.title}
                                  </h4>
                                  <Badge variant={getPriorityColor(alert.priority)} className="text-xs">
                                    {alert.priority}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mb-2">
                                  {alert.description}
                                </p>
                                {alert.dueDate && (
                                  <p className="text-xs text-muted-foreground">
                                    Due: {formatDate(alert.dueDate)}
                                  </p>
                                )}
                              </div>
                            </div>
                            {alert.actionRequired && (
                              <Link to={getActionLink(alert)}>
                                <Button size="sm" variant="outline" className="h-6 w-6 p-0">
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              </Link>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}