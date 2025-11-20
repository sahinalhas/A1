import { UseFormReturn } from "react-hook-form";
import { AppSettings } from "@/lib/app-settings";
import { motion } from "framer-motion";
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
import { Bell, Mail, Smartphone, MessageSquare, Clock } from "lucide-react";

interface NotificationsSettingsTabProps {
 form: UseFormReturn<AppSettings>;
}

export default function NotificationsSettingsTab({
 form,
}: NotificationsSettingsTabProps) {
 return (
 <motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
  className="max-w-3xl"
 >
  <Card id="notifications" className="border-muted">
   <CardHeader>
    <CardTitle className="flex items-center gap-2">
     <Bell className="h-5 w-5 text-primary" />
     Bildirim Tercihleri
    </CardTitle>
    <CardDescription>
     E-posta, SMS ve bildirim ayarları
    </CardDescription>
   </CardHeader>
   <CardContent className="space-y-4">
 <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 hover:bg-accent/20 transition-colors">
  <div className="flex items-center gap-3">
   <div className="p-2 rounded-lg bg-primary/10">
    <Mail className="h-4 w-4 text-primary" />
   </div>
   <Label className="cursor-pointer">E-posta Bildirimleri</Label>
  </div>
  <Switch
   checked={form.watch("notifications.email")}
   onCheckedChange={(v) =>
    form.setValue("notifications.email", !!v, {
     shouldValidate: true,
    })
   }
  />
 </div>
 <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 hover:bg-accent/20 transition-colors">
  <div className="flex items-center gap-3">
   <div className="p-2 rounded-lg bg-primary/10">
    <MessageSquare className="h-4 w-4 text-primary" />
   </div>
   <Label className="cursor-pointer">SMS Bildirimleri</Label>
  </div>
  <Switch
   checked={form.watch("notifications.sms")}
   onCheckedChange={(v) =>
    form.setValue("notifications.sms", !!v, {
     shouldValidate: true,
    })
   }
  />
 </div>
 <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 hover:bg-accent/20 transition-colors">
  <div className="flex items-center gap-3">
   <div className="p-2 rounded-lg bg-primary/10">
    <Smartphone className="h-4 w-4 text-primary" />
   </div>
   <Label className="cursor-pointer">Anlık Bildirimler</Label>
  </div>
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
    <div className="p-4 rounded-lg border border-border/40 bg-muted/30">
     <div className="flex items-center gap-2 mb-3">
      <Clock className="h-4 w-4 text-primary" />
      <Label htmlFor="digestHour" className="font-semibold">Günlük Özet Saati</Label>
     </div>
     <div className="grid gap-2 max-w-xs">
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
       0-23 arası bir saat belirtin (örn: 9 = sabah 9:00)
      </p>
     </div>
    </div>
   </CardContent>
  </Card>
 </motion.div>
 );
}
