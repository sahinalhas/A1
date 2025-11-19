/**
 * AI Settings Tab
 * Modern, clean AI configuration interface
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/organisms/Card';
import { Label } from '@/components/atoms/Label';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/atoms/Select';
import { Switch } from '@/components/atoms/Switch';
import { Brain, CheckCircle, Loader2, Server, Info, Zap, Power, Settings2 } from 'lucide-react';
import { Badge } from '@/components/atoms/Badge';
import { toast } from 'sonner';
import { Separator } from '@/components/atoms/Separator';
import { Alert, AlertDescription } from '@/components/atoms/Alert';
import { AI_PROVIDERS, AI_FEATURES, type AIProviderType } from '@/constants/ai-providers';

export default function AISettingsTab() {
  const [aiEnabled, setAiEnabled] = useState(true);
  const [provider, setProvider] = useState<AIProviderType>('gemini');
  const [model, setModel] = useState('gemini-2.5-flash');
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    updateAvailableModels();
  }, [provider]);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/ai-assistant/models');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setProvider(data.data.provider || 'gemini');
          setModel(data.data.currentModel || 'gemini-2.5-flash');
          
          if (data.data.provider === 'ollama' && data.data.ollamaBaseUrl) {
            setOllamaUrl(data.data.ollamaBaseUrl);
          }

          if (data.data.availableModels?.length > 0) {
            setAvailableModels(data.data.availableModels);
          }
        }
      }

      // Load AI enabled status
      const settingsResponse = await fetch('/api/settings');
      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json();
        if (settingsData.success && settingsData.data?.aiEnabled !== undefined) {
          setAiEnabled(settingsData.data.aiEnabled);
        }
      }
    } catch (error) {
      console.error('Failed to load AI settings:', error);
      toast.error('AI ayarları yüklenemedi');
    }
  };

  const updateAvailableModels = () => {
    const providerInfo = AI_PROVIDERS[provider];
    if (providerInfo.models.length > 0) {
      const modelValues = providerInfo.models.map(m => m.value);
      setAvailableModels(modelValues);
      if (!modelValues.includes(model)) {
        setModel(modelValues[0]);
      }
    } else if (provider === 'ollama') {
      setAvailableModels([]);
      setModel('');
      setConnectionStatus('idle');
    }
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus('idle');

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
          setConnectionStatus('success');
          toast.success(`Ollama bağlantısı başarılı! ${modelNames.length} model bulundu.`);
          if (modelNames.length > 0 && !modelNames.includes(model)) {
            setModel(modelNames[0]);
          }
        } else if (data.success && data.data?.available) {
          setConnectionStatus('success');
          toast.success(`${AI_PROVIDERS[provider].name} bağlantısı başarılı!`);
        } else {
          throw new Error(`${AI_PROVIDERS[provider].name} kullanılamıyor`);
        }
      } else {
        throw new Error('Bağlantı başarısız');
      }
    } catch (error) {
      console.error('Connection error:', error);
      setConnectionStatus('error');
      toast.error(`Bağlantı hatası: ${error instanceof Error ? error.message : 'Servis erişilemiyor'}`);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      // Save AI enabled status
      const enabledResponse = await fetch('/api/settings/ai-enabled', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: aiEnabled })
      });

      if (!enabledResponse.ok) {
        throw new Error('AI durum ayarı kaydedilemedi');
      }

      // Save provider settings
      const providerSettings = {
        provider,
        model,
        ...(provider === 'ollama' && { ollamaBaseUrl: ollamaUrl })
      };

      const providerResponse = await fetch('/api/ai-assistant/set-provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(providerSettings)
      });

      if (!providerResponse.ok) {
        throw new Error('Provider ayarları kaydedilemedi');
      }

      toast.success(
        `AI Ayarları Kaydedildi!\n${aiEnabled ? `${AI_PROVIDERS[provider].name} (${model}) aktif` : 'AI özellikleri kapalı'}`
      );
      setConnectionStatus('idle');
    } catch (error) {
      console.error('Save error:', error);
      toast.error(`Ayarlar kaydedilemedi: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const ProviderIcon = AI_PROVIDERS[provider].icon;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* AI Enable/Disable Toggle */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${aiEnabled ? 'from-blue-500 to-indigo-500' : 'from-gray-400 to-gray-500'} text-white`}>
                <Power className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl">AI Özellikleri</CardTitle>
                <CardDescription>
                  {aiEnabled ? 'AI özellikleri aktif ve kullanıma hazır' : 'AI özellikleri şu anda kapalı'}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Label htmlFor="ai-enabled" className="text-sm font-medium">
                {aiEnabled ? 'Aktif' : 'Kapalı'}
              </Label>
              <Switch
                id="ai-enabled"
                checked={aiEnabled}
                onCheckedChange={setAiEnabled}
                className="data-[state=checked]:bg-green-500"
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Provider Selection - Only show when AI is enabled */}
      {aiEnabled && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-primary" />
                <CardTitle>AI Provider Seçimi</CardTitle>
              </div>
              <CardDescription>
                Kullanmak istediğiniz yapay zeka sağlayıcısını seçin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {(Object.keys(AI_PROVIDERS) as AIProviderType[]).map((key) => {
                  const info = AI_PROVIDERS[key];
                  const Icon = info.icon;
                  const isSelected = provider === key;

                  return (
                    <button
                      key={key}
                      onClick={() => setProvider(key)}
                      className={`relative p-4 rounded-lg border-2 transition-all text-left ${
                        isSelected
                          ? 'border-primary bg-primary/5 shadow-md'
                          : 'border-border hover:border-primary/50 hover:bg-accent/50'
                      }`}
                    >
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${info.color} text-white`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          {isSelected && (
                            <Badge variant="default" className="bg-primary">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Seçili
                            </Badge>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold">{info.name}</h3>
                          <p className="text-xs text-muted-foreground mt-1">{info.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Provider Configuration */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ProviderIcon className="h-5 w-5 text-primary" />
                <CardTitle>{AI_PROVIDERS[provider].name} Yapılandırması</CardTitle>
              </div>
              <CardDescription>
                {AI_PROVIDERS[provider].description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Ollama URL */}
              {provider === 'ollama' && (
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
                    <span>Ollama servisinin çalıştığı URL adresi.</span>
                  </p>
                </div>
              )}

              {/* Provider Info Alerts */}
              {provider === 'gemini' && (
                <Alert className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
                  <Info className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-sm">
                    <strong>Ücretsiz ve Güçlü:</strong> Gemini API makul kullanım dahilinde ücretsizdir.
                    API key'inizi{' '}
                    <a 
                      href="https://aistudio.google.com/apikey" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-green-600 dark:text-green-400 font-medium underline"
                    >
                      Google AI Studio
                    </a>
                    {' '}üzerinden alabilirsiniz.
                  </AlertDescription>
                </Alert>
              )}

              {provider === 'openai' && (
                <Alert className="bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900">
                  <Info className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  <AlertDescription className="text-sm">
                    <strong>Ücretli Servis:</strong> OpenAI kullanım başına ücretlendirilir. API key'inizi{' '}
                    <a 
                      href="https://platform.openai.com/api-keys" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-orange-600 dark:text-orange-400 font-medium underline"
                    >
                      OpenAI Platform
                    </a>
                    {' '}üzerinden alabilirsiniz.
                  </AlertDescription>
                </Alert>
              )}

              {/* Test Connection */}
              <Separator />

              <div className="flex items-center gap-3">
                <Button 
                  onClick={testConnection} 
                  disabled={isTestingConnection}
                  variant="outline"
                  size="lg"
                >
                  {isTestingConnection ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
              </div>

              {/* Model Selection */}
              {availableModels.length > 0 && (
                <>
                  <Separator />
                  
                  <div className="space-y-3">
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
                          const modelInfo = AI_PROVIDERS[provider].models.find(model => model.value === m);
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
                  </div>
                </>
              )}

              {/* Save Button */}
              <Separator />

              <div className="flex justify-end">
                <Button 
                  onClick={saveSettings}
                  disabled={isSaving}
                  size="lg"
                  className="min-w-[160px]"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
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

          {/* AI Features */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <CardTitle>Kullanılabilir AI Özellikleri</CardTitle>
              </div>
              <CardDescription>
                Seçtiğiniz AI provider ile aktif olacak özellikler
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-3">
                {AI_FEATURES.map((feature, index) => (
                  <div 
                    key={index} 
                    className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
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
        </>
      )}

      {/* AI Disabled Message */}
      {!aiEnabled && (
        <Alert className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900">
          <Info className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <AlertDescription>
            <p className="font-semibold mb-2">AI Özellikleri Kapalı</p>
            <p className="text-sm text-muted-foreground">
              AI özellikleri şu anda devre dışı. Aktif etmek için yukarıdaki anahtarı açın ve ayarları kaydedin.
              AI özellikleri kapalıyken, AI destekli tüm işlemler (sohbet, analiz, öneriler) kullanılamayacaktır.
            </p>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
