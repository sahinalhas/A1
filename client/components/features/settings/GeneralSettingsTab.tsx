import { UseFormReturn } from "react-hook-form";
import { AppSettings } from "@/lib/app-settings";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/organisms/Card";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/Select";
import { EnhancedTextarea as Textarea } from "@/components/molecules/EnhancedTextarea";

interface GeneralSettingsTabProps {
  form: UseFormReturn<AppSettings>;
}

export default function GeneralSettingsTab({ form }: GeneralSettingsTabProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Görünüm</CardTitle>
          <CardDescription>Tema ve dil tercihi</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Tema</Label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant={
                  form.watch("theme") === "light" ? "default" : "outline"
                }
                onClick={() =>
                  form.setValue("theme", "light", { shouldValidate: true })
                }
              >
                Açık
              </Button>
              <Button
                type="button"
                variant={
                  form.watch("theme") === "dark" ? "default" : "outline"
                }
                onClick={() =>
                  form.setValue("theme", "dark", { shouldValidate: true })
                }
              >
                Koyu
              </Button>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="language">Dil</Label>
            <Select
              value={form.watch("language")}
              onValueChange={(v) =>
                form.setValue("language", v as AppSettings["language"], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger id="language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tr">Türkçe</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dateFormat">Tarih Formatı</Label>
            <Select
              value={form.watch("dateFormat")}
              onValueChange={(v) =>
                form.setValue(
                  "dateFormat",
                  v as AppSettings["dateFormat"],
                  { shouldValidate: true },
                )
              }
            >
              <SelectTrigger id="dateFormat">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dd.MM.yyyy">dd.MM.yyyy</SelectItem>
                <SelectItem value="yyyy-MM-dd">yyyy-MM-dd</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="timeFormat">Saat Formatı</Label>
            <Select
              value={form.watch("timeFormat")}
              onValueChange={(v) =>
                form.setValue(
                  "timeFormat",
                  v as AppSettings["timeFormat"],
                  { shouldValidate: true },
                )
              }
            >
              <SelectTrigger id="timeFormat">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HH:mm">24 Saat (HH:mm)</SelectItem>
                <SelectItem value="hh:mm a">12 Saat (hh:mm a)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="weekStart">Haftanın İlk Günü</Label>
            <Select
              value={String(form.watch("weekStart"))}
              onValueChange={(v) =>
                form.setValue("weekStart", Number(v) as 1 | 7, {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger id="weekStart">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Pazartesi</SelectItem>
                <SelectItem value="7">Pazar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card id="account">
        <CardHeader>
          <CardTitle>Hesap</CardTitle>
          <CardDescription>Kullanıcı bilgileri</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="displayName">Ad Soyad</Label>
            <Input
              id="displayName"
              value={form.watch("account.displayName")}
              onChange={(e) =>
                form.setValue("account.displayName", e.target.value, {
                  shouldValidate: true,
                })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">E-posta</Label>
            <Input
              id="email"
              type="email"
              value={form.watch("account.email")}
              onChange={(e) =>
                form.setValue("account.email", e.target.value, {
                  shouldValidate: true,
                })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="institution">Kurum</Label>
            <Input
              id="institution"
              value={form.watch("account.institution")}
              onChange={(e) =>
                form.setValue("account.institution", e.target.value, {
                  shouldValidate: true,
                })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="signature">İmza / Not</Label>
            <Textarea
              id="signature"
              value={form.watch("account.signature") ?? ""}
              onChange={(e) =>
                form.setValue("account.signature", e.target.value, {
                  shouldValidate: true,
                })
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
