import { UseFormReturn } from "react-hook-form";
import { AppSettings } from "@/lib/app-settings";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/organisms/Card";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
import { Switch } from "@/components/atoms/Switch";
import { Separator } from "@/components/atoms/Separator";

interface NotificationsSettingsTabProps {
  form: UseFormReturn<AppSettings>;
}

export default function NotificationsSettingsTab({
  form,
}: NotificationsSettingsTabProps) {
  return (
    <Card id="notifications">
      <CardHeader>
        <CardTitle>Bildirim Tercihleri</CardTitle>
        <CardDescription>
          E-posta, SMS ve bildirim ayarları
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>E-posta Bildirimleri</Label>
          <Switch
            checked={form.watch("notifications.email")}
            onCheckedChange={(v) =>
              form.setValue("notifications.email", !!v, {
                shouldValidate: true,
              })
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <Label>SMS Bildirimleri</Label>
          <Switch
            checked={form.watch("notifications.sms")}
            onCheckedChange={(v) =>
              form.setValue("notifications.sms", !!v, {
                shouldValidate: true,
              })
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <Label>Anlık Bildirimler</Label>
          <Switch
            checked={form.watch("notifications.push")}
            onCheckedChange={(v) =>
              form.setValue("notifications.push", !!v, {
                shouldValidate: true,
              })
            }
          />
        </div>
        <Separator />
        <div className="grid gap-2 max-w-xs">
          <Label htmlFor="digestHour">Günlük Özet Saati</Label>
          <Input
            id="digestHour"
            type="number"
            min={0}
            max={23}
            value={form.watch("notifications.digestHour")}
            onChange={(e) =>
              form.setValue(
                "notifications.digestHour",
                Number(e.target.value),
                { shouldValidate: true },
              )
            }
          />
          <p className="text-xs text-muted-foreground">
            0-23 arası bir saat
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
