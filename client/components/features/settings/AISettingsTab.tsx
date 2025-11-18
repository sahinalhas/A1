import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/organisms/Card';
import { Label } from '@/components/atoms/Label';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/atoms/Select';
import { Brain, CheckCircle, XCircle, Loader2, Server, Cloud, Zap, Shield, Gauge, Info, Sparkles } from 'lucide-react';
import { Badge } from '@/components/atoms/Badge';
import { toast } from 'sonner';
import { Separator } from '@/components/atoms/Separator';
import { Alert, AlertDescription } from '@/components/atoms/Alert';

const PROVIDER_INFO = {
 gemini: {
 name: 'Google Gemini',
 description: 'Google\'ın en yeni yapay zeka modeli. Ücretsiz ve güçlü.',
 icon: Cloud,
 color: 'from-blue-500 to-cyan-500',
 features: ['Ücretsiz kullanım', 'Yüksek performans', 'Geniş token limiti', 'Makul kullanımda sınırsız'],
 models: [
 { value: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'En hızlı ve verimli model (Önerilen)' },
 { value: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'En güçlü model, karmaşık görevler için' },
 { value: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', description: 'Dengeli performans ve hız' },
 { value: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash Exp', description: 'Deneysel özellikler ile' }
 ]
 },
 openai: {
 name: 'OpenAI',
 description: 'ChatGPT\'nin arkasındaki teknoloji. Ücretli ama çok güçlü.',
 icon: Sparkles,
 color: 'from-green-500 to-emerald-500',
 features: ['GPT-4 desteği', 'Yüksek kalite', 'Geniş dil desteği', 'API key gerekli'],
 models: [
 { value: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Hızlı ve ekonomik (Önerilen)' },
 { value: 'gpt-4o', name: 'GPT-4o', description: 'En yeni ve güçlü model' },
 { value: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Dengeli güç ve hız' },
 { value: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Hızlı ve ekonomik' }
 ]
 },
 ollama: {
 name: 'Ollama (Lokal)',
 description: 'Kendi bilgisayarınızda çalışan açık kaynak modeller. Tamamen ücretsiz ve özel.',
 icon: Server,
 color: 'from-purple-500 to-pink-500',
 features: ['Tamamen ücretsiz', 'Veri gizliliği', 'İnternet gerektirmez', 'Yerel kontrol'],
 models: []
 }
};

export default function AISettingsTab() {
 const [provider, setProvider] = useState<'ollama' | 'openai' | 'gemini'>('gemini');
 const [model, setModel] = useState('gemini-2.5-flash');
 const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
 const [availableModels, setAvailableModels] = useState<string[]>([]);
 const [isChecking, setIsChecking] = useState(false);
 const [connectionStatus, setConnectionStatus] = useState<'unchecked' | 'success' | 'error'>('unchecked');
 const [currentActiveProvider, setCurrentActiveProvider] = useState<string>('');
 const [isSaving, setIsSaving] = useState(false);
 const [providerModelsCache, setProviderModelsCache] = useState<Record<string, string[]>>({});
 const [healthStatus, setHealthStatus] = useState<Record<string, any>>({});

 useEffect(() => {
 loadCurrentSettings();
 loadHealthStatus();
 
 // Health status'u her 30 saniyede güncelle
 const interval = setInterval(loadHealthStatus, 30000);
 return () => clearInterval(interval);
 }, []);

 const loadHealthStatus = async () => {
 try {
 const response = await fetch('/api/ai-assistant/health-status');
 if (response.ok) {
 const data = await response.json();
 setHealthStatus(data.data || {});
 }
 } catch (error) {
 console.error('Failed to load health status:', error);
 }
 };

 const handleProviderChange = (selectedProvider: 'ollama' | 'openai' | 'gemini') => {
 setProvider(selectedProvider);
 setConnectionStatus('unchecked');
 
 if (selectedProvider === 'ollama') {
 const cachedModels = providerModelsCache['ollama'] || [];
 setAvailableModels(cachedModels);
 if (cachedModels.length > 0 && !cachedModels.includes(model)) {
 setModel(cachedModels[0]);
 }
 
 // Ollama için otomatik bağlantı testi yap
 if (cachedModels.length === 0) {
 setTimeout(() => checkConnection(), 500);
 }
 } else {
 const cachedModels = providerModelsCache[selectedProvider];
 if (cachedModels && cachedModels.length > 0) {
 setAvailableModels(cachedModels);
 if (!cachedModels.includes(model)) {
 setModel(cachedModels[0]);
 }
 } else {
 const providerModels = PROVIDER_INFO[selectedProvider].models;
 const modelValues = providerModels.map(m => m.value);
 setAvailableModels(modelValues);
 if (modelValues.length > 0 && !modelValues.includes(model)) {
 setModel(modelValues[0]);
 }
 
 // Cloud provider'lar için otomatik health check
 setTimeout(() => checkConnection(), 500);
 }
 }
 };

 const loadCurrentSettings = async () => {
 try {
 const response = await fetch('/api/ai-assistant/models');
 if (response.ok) {
 const data = await response.json();
 if (data.success && data.data) {
 const currentProvider = data.data.provider || 'gemini';
 const currentModel = data.data.currentModel || 'gemini-2.5-flash';
 
 setProvider(currentProvider);
 setModel(currentModel);
 setCurrentActiveProvider(`${PROVIDER_INFO[currentProvider as keyof typeof PROVIDER_INFO].name} (${currentModel})`);
 
 if (currentProvider === 'ollama' && data.data.ollamaBaseUrl) {
 setOllamaUrl(data.data.ollamaBaseUrl);
 }
 
 if (data.data.availableModels && data.data.availableModels.length > 0) {
 setAvailableModels(data.data.availableModels);
 setProviderModelsCache(prev => ({
 ...prev,
 [currentProvider]: data.data.availableModels
 }));
 } else if (currentProvider !== 'ollama') {
 const providerModels = PROVIDER_INFO[currentProvider as keyof typeof PROVIDER_INFO].models;
 const modelValues = providerModels.map(m => m.value);
 setAvailableModels(modelValues);
 setProviderModelsCache(prev => ({
 ...prev,
 [currentProvider]: modelValues
 }));
 }
 }
 }
 } catch (error) {
 console.error('Failed to load AI settings:', error);
 toast.error('AI ayarları yüklenemedi');
 }
 };

 const checkConnection = async () => {
 setIsChecking(true);
 setConnectionStatus('unchecked');

 try {
 const endpoint = provider === 'ollama' 
 ? `${ollamaUrl}/api/tags`
 : '/api/ai-assistant/health';

 const response = await fetch(endpoint);
 
 if (response.ok) {
 const data = await response.json();
 
 if (provider === 'ollama' && data.models) {
 const modelNames = data.models.map((m: any) => m.name);
 setAvailableModels(modelNames);
 setProviderModelsCache(prev => ({
 ...prev,
 'ollama': modelNames
 }));
 setConnectionStatus('success');
 
 if (modelNames.length > 0 && !modelNames.includes(model)) {
 setModel(modelNames[0]);
 }
 
 toast.success(`Ollama bağlantısı başarılı! ${modelNames.length} model bulundu.`);
 } else if (provider === 'gemini' && data.success && data.data) {
 if (data.data.available) {
 if (data.data.availableModels && data.data.availableModels.length > 0) {
 setAvailableModels(data.data.availableModels);
 setProviderModelsCache(prev => ({
 ...prev,
 'gemini': data.data.availableModels
 }));
 if (!data.data.availableModels.includes(model)) {
 setModel(data.data.availableModels[0]);
 }
 }
 setConnectionStatus('success');
 toast.success('Gemini bağlantısı başarılı! API key doğrulandı.');
 } else {
 throw new Error('Gemini API key tanımlı değil');
 }
 } else if (provider === 'openai' && data.success && data.data) {
 if (data.data.available) {
 if (data.data.availableModels && data.data.availableModels.length > 0) {
 setAvailableModels(data.data.availableModels);
 setProviderModelsCache(prev => ({
 ...prev,
 'openai': data.data.availableModels
 }));
 if (!data.data.availableModels.includes(model)) {
 setModel(data.data.availableModels[0]);
 }
 }
 setConnectionStatus('success');
 toast.success('OpenAI bağlantısı başarılı! API key doğrulandı.');
 } else {
 throw new Error('OpenAI API key tanımlı değil');
 }
 } else {
 throw new Error('Geçersiz yanıt alındı');
 }
 } else {
 throw new Error('Bağlantı başarısız');
 }
 } catch (error: unknown) {
 console.error('Connection error:', error);
 setConnectionStatus('error');
 const providerName = PROVIDER_INFO[provider].name;
 toast.error(`Bağlantı hatası: ${error instanceof Error ? error instanceof Error ? error.message : String(error) : providerName + ' servisi erişilemiyor'}`);
 } finally {
 setIsChecking(false);
 }
 };

 const saveSettings = async () => {
 setIsSaving(true);
 try {
 const settings = {
 provider,
 model,
 ...(provider === 'ollama' && { ollamaBaseUrl: ollamaUrl })
 };

 const response = await fetch('/api/ai-assistant/set-provider', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(settings)
 });

 if (response.ok) {
 const providerName = PROVIDER_INFO[provider].name;
 toast.success(`AI Ayarları Kaydedildi!\n${providerName} (${model}) aktif olarak ayarlandı. Bu ayar kalıcıdır.`);
 
 await loadCurrentSettings();
 setConnectionStatus('unchecked');
 } else {
 const errorData = await response.json().catch(() => ({}));
 throw new Error(errorData.error || 'Ayarlar kaydedilemedi');
 }
 } catch (error: unknown) {
 console.error('Save error:', error);
 toast.error(`Ayarlar kaydedilemedi: ${error instanceof Error ? error.message : String(error)}`);
 } finally {
 setIsSaving(false);
 }
 };

 const getProviderIcon = (providerKey: keyof typeof PROVIDER_INFO) => {
 const IconComponent = PROVIDER_INFO[providerKey].icon;
 return <IconComponent className="h-5 w-5" />;
 };

 const getModelDescription = (modelValue: string) => {
 const providerModels = PROVIDER_INFO[provider].models;
 const modelInfo = providerModels.find(m => m.value === modelValue);
 return modelInfo?.description || '';
 };

 return (
 <div className="space-y-6 max-w-5xl">
 {currentActiveProvider && (
 <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-2 border-blue-200 dark:border-blue-800">
 <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
 <AlertDescription>
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm font-medium text-muted-foreground mb-1">Şu Anda Aktif AI Provider</p>
 <p className="text-lg font-bold text-foreground">{currentActiveProvider}</p>
 <p className="text-xs text-muted-foreground mt-1">
 Bu ayar kalıcıdır ve tüm AI özelliklerinde kullanılır
 </p>
 </div>
 <Badge variant="default" className="bg-green-500">
 <CheckCircle className="mr-1 h-3 w-3" />
 Aktif
 </Badge>
 </div>
 </AlertDescription>
 </Alert>
 )}

 <div>
 <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
 <Brain className="h-6 w-6 text-primary" />
 AI Provider Seçimi
 </h2>
 <p className="text-muted-foreground mb-6">
 Uygulamanızda kullanmak istediğiniz yapay zeka sağlayıcısını seçin. Her sağlayıcının kendine özgü özellikleri vardır.
 </p>

 <div className="grid md:grid-cols-3 gap-4">
 {(Object.keys(PROVIDER_INFO) as Array<keyof typeof PROVIDER_INFO>).map((key) => {
 const info = PROVIDER_INFO[key];
 const isSelected = provider === key;
 
 return (
 <Card
 key={key}
 className={`cursor-pointer ${
 isSelected 
 ? 'ring-2 ring-primary'
 : ''
 }`}
 onClick={() => handleProviderChange(key)}
 >
 <CardHeader className="pb-3">
 <div className="flex items-start justify-between">
 <div className={`p-2 rounded-lg bg-gradient-to-br ${info.color} text-white`}>
 {getProviderIcon(key)}
 </div>
 {isSelected && (
 <Badge variant="default" className="bg-primary">
 <CheckCircle className="mr-1 h-3 w-3" />
 Seçili
 </Badge>
 )}
 </div>
 <CardTitle className="text-lg mt-3">{info.name}</CardTitle>
 <CardDescription className="text-sm">{info.description}</CardDescription>
 </CardHeader>
 <CardContent>
 <div className="space-y-2">
 {info.features.map((feature, index) => (
 <div key={index} className="flex items-center gap-2 text-sm">
 <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
 <span className="text-muted-foreground">{feature}</span>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 );
 })}
 </div>
 </div>

 <Card>
 <CardHeader>
 <div className="flex items-center gap-2">
 <Gauge className="h-5 w-5 text-primary" />
 <CardTitle>Provider Yapılandırması</CardTitle>
 </div>
 <CardDescription>
 {PROVIDER_INFO[provider].name} için gerekli ayarları yapın
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-6">
 {provider === 'ollama' && (
 <>
 <div className="space-y-2">
 <Label htmlFor="ollama-url" className="flex items-center gap-2">
 <Server className="h-4 w-4" />
 Ollama Sunucu Adresi
 </Label>
 <Input
 id="ollama-url"
 value={ollamaUrl}
 onChange={(e) => setOllamaUrl(e.target.value)}
 placeholder="http://localhost:11434"
 className="font-mono"
 />
 <p className="text-xs text-muted-foreground flex items-start gap-2">
 <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
 <span>Ollama servisinin çalıştığı URL adresi. Varsayılan olarak localhost:11434 kullanılır.</span>
 </p>
 </div>

 <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
 <Server className="h-4 w-4 text-blue-600 dark:text-blue-400" />
 <AlertDescription>
 <h4 className="font-semibold mb-3 text-foreground">Ollama Nasıl Kurulur?</h4>
 <ol className="space-y-2 text-sm text-muted-foreground">
 <li className="flex items-start gap-2">
 <span className="font-bold text-blue-600 dark:text-blue-400">1.</span>
 <span>
 Ollama'yı{' '}
 <a 
 href="https://ollama.ai" 
 target="_blank" 
 rel="noopener noreferrer" 
 className="text-blue-600 dark:text-blue-400 font-medium"
 >
 ollama.ai
 </a>
 {' '}adresinden indirin ve yükleyin
 </span>
 </li>
 <li className="flex items-start gap-2">
 <span className="font-bold text-blue-600 dark:text-blue-400">2.</span>
 <span>
 Terminal'de şu komutu çalıştırarak bir model indirin:{' '}
 <code className="bg-muted px-2 py-1 rounded font-mono text-xs">ollama pull llama3.2:3b</code>
 </span>
 </li>
 <li className="flex items-start gap-2">
 <span className="font-bold text-blue-600 dark:text-blue-400">3.</span>
 <span>
 Servisi başlatın:{' '}
 <code className="bg-muted px-2 py-1 rounded font-mono text-xs">ollama serve</code>
 </span>
 </li>
 <li className="flex items-start gap-2">
 <span className="font-bold text-blue-600 dark:text-blue-400">4.</span>
 <span>Aşağıdaki"Bağlantıyı Test Et" butonuna tıklayarak bağlantıyı kontrol edin</span>
 </li>
 </ol>
 </AlertDescription>
 </Alert>
 </>
 )}

 {provider === 'gemini' && (
 <Alert className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
 <Cloud className="h-4 w-4 text-green-600 dark:text-green-400" />
 <AlertDescription>
 <h4 className="font-semibold mb-2 text-foreground">Google Gemini AI (Önerilen)</h4>
 <div className="space-y-2 text-sm text-muted-foreground">
 <p>
 Google'ın Gemini AI modeli <strong>ücretsizdir</strong> ve makul kullanım dahilinde limit yoktur.
 Yüksek performans ve geniş token limiti sunar.
 </p>
 <p>
 GEMINI_API_KEY environment variable'ı zaten tanımlanmış durumda. Değiştirmek isterseniz,{' '}
 <a 
 href="https://aistudio.google.com/apikey" 
 target="_blank" 
 rel="noopener noreferrer" 
 className="text-green-600 dark:text-green-400 font-medium"
 >
 Google AI Studio
 </a>
 {' '}üzerinden ücretsiz API key alabilirsiniz.
 </p>
 </div>
 </AlertDescription>
 </Alert>
 )}

 {provider === 'openai' && (
 <Alert className="bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900">
 <Sparkles className="h-4 w-4 text-orange-600 dark:text-orange-400" />
 <AlertDescription>
 <h4 className="font-semibold mb-2 text-foreground">OpenAI API Key Gerekli</h4>
 <div className="space-y-2 text-sm text-muted-foreground">
 <p>
 OpenAI kullanmak için <strong>OPENAI_API_KEY</strong> environment variable'ı tanımlanmalıdır.
 OpenAI ücretli bir servistir ve kullanım başına ücretlendirilir.
 </p>
 <p>
 API key'inizi{' '}
 <a 
 href="https://platform.openai.com/api-keys" 
 target="_blank" 
 rel="noopener noreferrer" 
 className="text-orange-600 dark:text-orange-400 font-medium"
 >
 OpenAI Platform
 </a>
 {' '}üzerinden alabilirsiniz.
 </p>
 </div>
 </AlertDescription>
 </Alert>
 )}

 <Separator />

 <div className="flex items-center gap-3">
 <Button 
 onClick={checkConnection} 
 disabled={isChecking}
 variant="outline"
 size="lg"
 >
 {isChecking ? (
 <>
 <Loader2 className="mr-2 h-4 w-4" />
 Kontrol ediliyor...
 </>
 ) : (
 <>
 <Zap className="mr-2 h-4 w-4" />
 Bağlantıyı Test Et
 </>
 )}
 </Button>

 {connectionStatus === 'success' && (
 <Badge variant="default" className="bg-green-500 text-sm py-1.5 px-3">
 <CheckCircle className="mr-1.5 h-4 w-4" />
 Bağlantı Başarılı
 </Badge>
 )}
 {connectionStatus === 'error' && (
 <Badge variant="destructive" className="text-sm py-1.5 px-3">
 <XCircle className="mr-1.5 h-4 w-4" />
 Bağlantı Hatası
 </Badge>
 )}
 </div>

 {availableModels.length > 0 && (
 <div className="space-y-3 pt-2">
 <div className="flex items-center justify-between">
 <Label htmlFor="ai-model" className="text-base font-semibold flex items-center gap-2">
 <Brain className="h-4 w-4" />
 Model Seçimi
 </Label>
 <Badge variant="secondary" className="text-xs">
 {availableModels.length} model mevcut
 </Badge>
 </div>
 
 <Select value={model} onValueChange={setModel}>
 <SelectTrigger id="ai-model" className="h-auto py-3">
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 {availableModels.map((m) => {
 const modelInfo = PROVIDER_INFO[provider].models.find(model => model.value === m);
 return (
 <SelectItem key={m} value={m} className="py-3">
 <div className="flex flex-col items-start gap-1">
 <span className="font-medium">{modelInfo?.name || m}</span>
 {modelInfo?.description && (
 <span className="text-xs text-muted-foreground">{modelInfo.description}</span>
 )}
 </div>
 </SelectItem>
 );
 })}
 </SelectContent>
 </Select>
 
 {getModelDescription(model) && (
 <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg flex items-start gap-2">
 <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
 <span>{getModelDescription(model)}</span>
 </p>
 )}
 </div>
 )}

 <Separator />

 <div className="flex justify-end gap-3 pt-2">
 <Button 
 onClick={saveSettings}
 disabled={isSaving}
 size="lg"
 className="min-w-[160px]"
 >
 {isSaving ? (
 <>
 <Loader2 className="mr-2 h-5 w-5" />
 Kaydediliyor...
 </>
 ) : (
 <>
 <CheckCircle className="mr-2 h-5 w-5" />
 Ayarları Kaydet
 </>
 )}
 </Button>
 </div>
 </CardContent>
 </Card>

 <Card>
 <CardHeader>
 <div className="flex items-center gap-2">
 <Shield className="h-5 w-5 text-primary" />
 <CardTitle>AI Özellikleri ve Yetenekler</CardTitle>
 </div>
 <CardDescription>
 Seçtiğiniz AI provider ile kullanılabilen özellikler
 </CardDescription>
 </CardHeader>
 <CardContent>
 <div className="grid sm:grid-cols-2 gap-3">
 {[
 { name: 'AI Sohbet Asistanı', description: 'Doğal dilde sohbet yapabilen akıllı asistan' },
 { name: 'Günlük AI Insights', description: 'Günlükler için otomatik analiz ve öneriler' },
 { name: 'Toplu Veri Analizi', description: 'Çoklu kayıt analizi ve raporlama' },
 { name: 'Risk Tahmini', description: 'Gelecekteki riskleri öngörme' },
 { name: 'Müdahale Önerileri', description: 'Duruma özel aksiyon önerileri' },
 { name: 'Otomatik Raporlama', description: 'PDF raporları otomatik oluşturma' }
 ].map((feature, index) => (
 <div 
 key={index} 
 className="flex items-start gap-3 p-3 border rounded-lg"
 >
 <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded">
 <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
 </div>
 <div className="flex-1 min-w-0">
 <div className="font-medium text-sm">{feature.name}</div>
 <div className="text-xs text-muted-foreground mt-0.5">{feature.description}</div>
 </div>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 </div>
 );
}
