
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/atoms/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/organisms/Tabs";
import { Settings as SettingsIcon, Save, AlertCircle } from "lucide-react";
import { SETTINGS_TABS } from "@/config/tabs";
import { PageHeader } from "@/components/molecules/PageHeader";
import { useToast } from "@/hooks/utils/toast.utils";
import { Badge } from "@/components/atoms/Badge";
import {
 loadSettings,
 saveSettings,
 AppSettings,
 defaultSettings,
} from "@/lib/app-settings";
import { useSearchParams, useLocation } from "react-router-dom";
import GeneralSettingsTab from "@/components/features/settings/GeneralSettingsTab";
import NotificationsSettingsTab from "@/components/features/settings/NotificationsSettingsTab";
import AISettingsTab from "@/components/features/settings/AISettingsTab";
import CoursesSettingsTab from "@/components/features/settings/CoursesSettingsTab";
import SecuritySettingsTab from "@/components/features/settings/SecuritySettingsTab";
import BackupSettingsTab from "@/components/features/settings/BackupSettingsTab";
import GuidanceStandardsTab from "@/components/features/settings/GuidanceStandardsTab";

const schema = z.object({
 theme: z.enum(["light","dark"]),
 language: z.enum(["tr","en"]),
 dateFormat: z.enum(["dd.MM.yyyy","yyyy-MM-dd"]),
 timeFormat: z.enum(["HH:mm","hh:mm a"]),
 weekStart: z.union([z.literal(1), z.literal(7)]),
 notifications: z.object({
 email: z.boolean(),
 sms: z.boolean(),
 push: z.boolean(),
 digestHour: z.number().int().min(0).max(23),
 }),
 privacy: z.object({
 analyticsEnabled: z.boolean(),
 dataSharingEnabled: z.boolean(),
 }),
 account: z.object({
 displayName: z.string().min(1),
 email: z.string().email(),
 institution: z.string().min(1),
 signature: z.string().optional().nullable(),
 }),
});

export default function SettingsPage() {
 const { toast } = useToast();
 const [init, setInit] = useState<AppSettings>(defaultSettings());
 const [searchParams, setSearchParams] = useSearchParams();
 const initialTab = useMemo(() => {
 const t = searchParams.get("tab") ||"genel";
 const allowed = new Set([
"genel",
"bildirim",
"ai",
"dersler",
"guvenlik",
"yedekleme",
"rehberlik-standartlari",
 ]);
 return allowed.has(t) ? t :"genel";
 }, [searchParams]);
 const [tab, setTab] = useState<string>(initialTab);
 const [isSaving, setIsSaving] = useState(false);
 
 useEffect(() => {
 setTab(initialTab);
 }, [initialTab]);

 const location = useLocation();
 useEffect(() => {
 if (location.hash) {
 const id = location.hash.slice(1);
 const el = document.getElementById(id);
 if (el) {
 setTimeout(
 () => el.scrollIntoView({ behavior:"smooth", block:"start" }),
 0,
 );
 }
 }
 }, [location.hash, tab]);

 const form = useForm<AppSettings>({
 resolver: zodResolver(schema) as any,
 defaultValues: init,
 mode:"onChange",
 });

 useEffect(() => {
 loadSettings().then(settings => {
 setInit(settings);
 form.reset(settings);
 });
 }, []);

 useEffect(() => {
 const sub = form.watch((value, { name }) => {
 if (!value) return;
 if (name ==="theme") {
 const root = document.documentElement;
 if (value.theme ==="dark") root.classList.add("dark");
 else root.classList.remove("dark");
 }
 });
 return () => sub.unsubscribe();
 }, [form]);

 const onSave = async (values: AppSettings) => {
 setIsSaving(true);
 try {
 await saveSettings(values);
 form.reset(values);
 toast({ 
 title:"Ayarlar Kaydedildi",
 description:"Değişiklikleriniz başarıyla kaydedildi."
 });
 } catch (error) {
 toast({ 
 title:"Hata",
 description:"Ayarlar kaydedilemedi. Lütfen tekrar deneyin.",
 variant:"destructive"
 });
 } finally {
 setIsSaving(false);
 }
 };

 useEffect(() => {
 const handleBeforeUnload = (e: BeforeUnloadEvent) => {
 if (form.formState.isDirty) {
 e.preventDefault();
 e.returnValue ="";
 }
 };

 window.addEventListener("beforeunload", handleBeforeUnload);
 return () => window.removeEventListener("beforeunload", handleBeforeUnload);
 }, [form.formState.isDirty]);

 const onReset = async () => {
 const def = defaultSettings();
 await saveSettings(def);
 form.reset(def);
 const root = document.documentElement;
 if (def.theme ==="dark") root.classList.add("dark");
 else root.classList.remove("dark");
 toast({ title:"Ayarlar varsayılana döndü" });
 };

 const onExport = () => {
 const data = JSON.stringify(form.getValues(), null, 2);
 const blob = new Blob([data], { type:"application/json" });
 const url = URL.createObjectURL(blob);
 const a = document.createElement("a");
 a.href = url;
 a.download ="rehber360-settings.json";
 a.click();
 URL.revokeObjectURL(url);
 };

 const isDirty = form.formState.isDirty;

 return (
 <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 pb-24">
 <PageHeader
 title="Sistem Ayarları"
 subtitle="Uygulama genel tercihleri"
 icon={SettingsIcon}
 />
 
 <Tabs
 value={tab}
 onValueChange={(v) => {
 setTab(v);
 setSearchParams((p) => {
 const np = new URLSearchParams(p);
 np.set("tab", v);
 return np;
 });
 }}
 >
 <TabsList variant="default">
 {SETTINGS_TABS.map((tabConfig) => (
 <TabsTrigger
 key={tabConfig.value}
 value={tabConfig.value}
 icon={tabConfig.icon}
 variant="default"
 title={tabConfig.description}
 >
 {tabConfig.label}
 </TabsTrigger>
 ))}
 </TabsList>

 <TabsContent value="genel">
 <GeneralSettingsTab form={form} />
 </TabsContent>

 <TabsContent value="bildirim">
 <NotificationsSettingsTab form={form} />
 </TabsContent>

 <TabsContent value="ai">
 <AISettingsTab />
 </TabsContent>

 <TabsContent value="dersler">
 <CoursesSettingsTab />
 </TabsContent>

 <TabsContent value="guvenlik">
 <SecuritySettingsTab
 form={form}
 onReset={onReset}
 onExport={onExport}
 />
 </TabsContent>

 <TabsContent value="yedekleme">
 <BackupSettingsTab form={form} />
 </TabsContent>

 <TabsContent value="rehberlik-standartlari">
 <GuidanceStandardsTab />
 </TabsContent>
 </Tabs>

 {isDirty && (
 <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/95 to-transparent pb-4 pt-8 z-50">
 <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
 <div className="flex flex-col sm:flex-row items-center justify-between bg-card/95 border-2 border-border/80 rounded-xl p-3 sm:p-4 gap-3 sm:gap-4">
 <div className="flex items-center gap-3 w-full sm:w-auto">
 <div className="relative flex-shrink-0">
 <AlertCircle className="h-5 w-5 text-amber-500" />
 <span className="absolute -top-1 -right-1 flex h-3 w-3">
 <span className=" absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
 <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
 </span>
 </div>
 <div className="flex-1 min-w-0">
 <p className="font-semibold text-sm sm:text-base">Kaydedilmemiş Değişiklikler</p>
 <p className="text-xs text-muted-foreground truncate">
 Yaptığınız değişiklikler henüz kaydedilmedi
 </p>
 </div>
 </div>
 <div className="flex gap-2 w-full sm:w-auto justify-end">
 <Button
 variant="outline"
 onClick={() => form.reset()}
 disabled={isSaving}
 className="flex-1 sm:flex-none min-w-[100px]"
 >
 İptal
 </Button>
 <Button
 onClick={form.handleSubmit(onSave as any)}
 disabled={isSaving}
 className="flex-1 sm:flex-none min-w-[140px] gap-2 bg-gradient-to-r from-primary to-primary/90"
 >
 {isSaving ? (
 <>
 <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent" />
 <span className="hidden sm:inline">Kaydediliyor...</span>
 </>
 ) : (
 <>
 <Save className="h-4 w-4" />
 <span className="hidden sm:inline">Değişiklikleri Kaydet</span>
 <span className="sm:hidden">Kaydet</span>
 </>
 )}
 </Button>
 </div>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}
