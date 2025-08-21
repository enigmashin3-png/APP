import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Globe, Weight, Bell, Smartphone, SettingsIcon, Bot } from "lucide-react";
import ThemeSelector from "@/components/theme/ThemeSelector";
import { useThemeCtx } from "@/components/theme/ThemeProvider";
import { THEME_STORAGE_KEY, DEFAULT_THEME } from "@/lib/theme";
import { useToast } from "@/hooks/use-toast";

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
];

export default function Settings() {
  const [language, setLanguage] = useState(localStorage.getItem('fitness-app-language') || 'en');
  const [weightUnit, setWeightUnit] = useState(localStorage.getItem('fitness-app-weight-unit') || 'lbs');
  const [notifications, setNotifications] = useState(localStorage.getItem('fitness-app-notifications') !== 'false');
  const [autoRest, setAutoRest] = useState(localStorage.getItem('fitness-app-auto-rest') !== 'false');
  const [restInterval, setRestInterval] = useState(parseInt(localStorage.getItem('fitness-app-rest-interval') || '90', 10));
  const { setTheme } = useThemeCtx();
  const { toast } = useToast();

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    localStorage.setItem('fitness-app-language', newLanguage);
    toast({
      title: "Language updated",
      description: `Language changed to ${LANGUAGES.find(l => l.code === newLanguage)?.name}`,
    });
  };

  const handleWeightUnitChange = (newUnit: string) => {
    setWeightUnit(newUnit);
    localStorage.setItem('fitness-app-weight-unit', newUnit);
    toast({
      title: "Weight unit updated", 
      description: `Weight unit changed to ${newUnit}`,
    });
  };


  const handleNotificationsToggle = (enabled: boolean) => {
    setNotifications(enabled);
    localStorage.setItem('fitness-app-notifications', enabled.toString());
    toast({
      title: "Notifications updated",
      description: `Notifications ${enabled ? 'enabled' : 'disabled'}`,
    });
  };

  const handleAutoRestToggle = (enabled: boolean) => {
    setAutoRest(enabled);
    localStorage.setItem('fitness-app-auto-rest', enabled.toString());
    toast({
      title: "Auto-rest updated",
      description: `Auto-rest timer ${enabled ? 'enabled' : 'disabled'}`,
    });
  };

  const handleRestIntervalChange = (value: string) => {
    const seconds = parseInt(value, 10) || 0;
    setRestInterval(seconds);
    localStorage.setItem('fitness-app-rest-interval', seconds.toString());
    toast({
      title: "Rest timer updated",
      description: `Default rest time set to ${seconds}s`,
    });
  };

  const convertWeight = (weight: number, from: string, to: string): number => {
    if (from === to) return weight;
    if (from === 'lbs' && to === 'kg') return Math.round(weight * 0.453592 * 10) / 10;
    if (from === 'kg' && to === 'lbs') return Math.round(weight * 2.20462 * 10) / 10;
    return weight;
  };

  const resetAllSettings = () => {
    setLanguage('en');
    setWeightUnit('lbs');
    setNotifications(true);
    setAutoRest(true);
    setTheme(DEFAULT_THEME);

    localStorage.removeItem('fitness-app-language');
    localStorage.removeItem('fitness-app-weight-unit');
    localStorage.removeItem('fitness-app-notifications');
    localStorage.removeItem('fitness-app-auto-rest');
    localStorage.removeItem(THEME_STORAGE_KEY);
    
    
    toast({
      title: "Settings reset",
      description: "All settings have been reset to defaults",
    });
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4 lg:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Customize your workout experience
            </p>
          </div>
          <SettingsIcon className="h-6 w-6 text-gray-500" />
        </div>
      </header>

      <div className="p-4 lg:p-6 space-y-6 max-w-4xl mx-auto">
        {/* Language & Region */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span>Language & Region</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="language">App Language</Label>
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <div className="flex items-center space-x-2">
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Change the display language of the application
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Units & Measurements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Weight className="h-5 w-5" />
              <span>Units & Measurements</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="weight-unit">Weight Unit</Label>
              <Select value={weightUnit} onValueChange={handleWeightUnitChange}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select weight unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                  <SelectItem value="kg">Kilograms (kg)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Choose your preferred weight measurement unit
              </p>
            </div>

            {/* Unit Conversion Helper */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Quick Conversion</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">100 lbs =</p>
                  <p className="font-medium text-gray-900 dark:text-white">{convertWeight(100, 'lbs', 'kg')} kg</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">50 kg =</p>
                  <p className="font-medium text-gray-900 dark:text-white">{convertWeight(50, 'kg', 'lbs')} lbs</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>Appearance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <ThemeSelector />
          </CardContent>
        </Card>

        {/* Workout Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Smartphone className="h-5 w-5" />
              <span>Workout Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications">Workout Notifications</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Get notified about rest times and workout reminders
                </p>
              </div>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={handleNotificationsToggle}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-rest">Auto Rest Timer</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Automatically start rest timer after completing a set
                </p>
              </div>
              <Switch
                id="auto-rest"
                checked={autoRest}
                onCheckedChange={handleAutoRestToggle}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="rest-interval">Default Rest Time (s)</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Used when exercise rest time isn't specified
                </p>
              </div>
              <Input
                id="rest-interval"
                type="number"
                value={restInterval}
                onChange={(e) => handleRestIntervalChange(e.target.value)}
                className="w-24"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                <strong>Note:</strong> Browser notification permissions may be required for workout reminders and rest timers to work properly.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Reset Settings */}
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">Reset Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Reset all settings to their default values. This action cannot be undone.
            </p>
            <Button 
              variant="destructive" 
              onClick={resetAllSettings}
              className="w-full sm:w-auto"
            >
              Reset All Settings
            </Button>
          </CardContent>
        </Card>

        {/* AI Coach */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bot className="h-5 w-5" />
              <span>AI Coach</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
            <p>The AI Coach fetches tips from OpenRouter when you're online.</p>
            <p>If offline, heuristic advice is generated locally.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}