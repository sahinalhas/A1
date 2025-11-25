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
import { Palette, User, Calendar, Clock, Globe } from "lucide-react";

interface GeneralSettingsTabProps {
 form: UseFormReturn<AppSettings>;
}

export default function GeneralSettingsTab({ form }: GeneralSettingsTabProps) {
 return (
 <div className="grid gap-4 md:grid-cols-2">
 <motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
 >
  <Card className="border-muted">
   <CardHeader>
    <CardTitle className="flex items-center gap-2">
     <Palette className="h-5 w-5 text-primary" />
     Görünüm
    </CardTitle>
    <CardDescription>Tema ve dil tercihi</CardDescription>
   </CardHeader>
   <CardContent className="space-y-4">
 <div className="grid gap-2">
 <Label>Tema</Label>
 <div className="flex items-center gap-3">
 <Button
 type="button"
 variant={
 form.watch("theme") ==="light" ?"default" :"outline"
 }
 onClick={() =>
 form.setValue("theme","light", { shouldValidate: true, shouldDirty: true })
 }
 >
 Açık
 </Button>
 <Button
 type="button"
 variant={
 form.watch("theme") ==="dark" ?"default" :"outline"
 }
 onClick={() =>
 form.setValue("theme","dark", { shouldValidate: true, shouldDirty: true })
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
 shouldValidate: true, shouldDirty: true,
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
 { shouldValidate: true, shouldDirty: true },
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
 { shouldValidate: true, shouldDirty: true },
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
 shouldValidate: true, shouldDirty: true,
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
 </motion.div>

 <motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, delay: 0.1 }}
 >
  <Card id="account" className="border-muted">
   <CardHeader>
    <CardTitle className="flex items-center gap-2">
     <User className="h-5 w-5 text-primary" />
     Hesap
    </CardTitle>
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
 shouldValidate: true, shouldDirty: true,
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
 shouldValidate: true, shouldDirty: true,
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
 shouldValidate: true, shouldDirty: true,
 })
 }
 />
 </div>
 <div className="grid gap-2">
 <Label htmlFor="signature">İmza / Not</Label>
 <Textarea
 id="signature"
 value={form.watch("account.signature") ??""}
 onChange={(e) =>
 form.setValue("account.signature", e.target.value, {
 shouldValidate: true, shouldDirty: true,
 })
 }
 />
 </div>
 </CardContent>
  </Card>
 </motion.div>
 </div>
 );
}
